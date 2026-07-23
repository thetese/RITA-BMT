import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Modal from './Modal';
import { Button } from './DesignSystem';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const resolverRef = useRef(null);

  const askConfirm = useCallback((msg) => {
    return new Promise((resolve) => {
      setMessage(msg);
      setIsOpen(true);
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    if (resolverRef.current) resolverRef.current(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolverRef.current) resolverRef.current(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ askConfirm }}>
      {children}
      <Modal title="Confirmation" isOpen={isOpen} onClose={handleCancel}>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm}>Confirm</Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};
