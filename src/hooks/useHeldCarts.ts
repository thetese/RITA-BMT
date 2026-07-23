import { useState } from 'react';

export default function useHeldCarts(api) {
  const [heldCarts, setHeldCarts] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeOrderName, setActiveOrderName] = useState('');

  const loadHeldCarts = async () => {
    if (!api) return [];
    const carts = await api.getHeldCarts();
    setHeldCarts(carts);
    return carts;
  };

  const saveHeldCart = async (cart, name, waiterName) => {
    if (activeOrderId) {
      await api.updateHeldCart(activeOrderId, { cartData: JSON.stringify(cart) });
    } else {
      await api.addHeldCart({ name, cartData: JSON.stringify(cart), waiterName });
    }
  };

  const restoreCart = async (heldCart, currentCart, onConfirmOverwrite) => {
    if (currentCart.length > 0 && !activeOrderId) {
      if (!(await onConfirmOverwrite())) return null;
    }
    setActiveOrderId(heldCart.id);
    setActiveOrderName(heldCart.name);
    return JSON.parse(heldCart.cartData);
  };

  const deleteHeldCart = async (id, onConfirmDelete) => {
    if (!(await onConfirmDelete())) return false;
    await api.deleteHeldCart(id);
    await loadHeldCarts();
    if (activeOrderId === id) {
      setActiveOrderId(null);
      setActiveOrderName('');
      return true; // Indicates active cart was deleted, caller should clear cart
    }
    return false;
  };

  const clearActiveOrder = () => {
    setActiveOrderId(null);
    setActiveOrderName('');
  };

  return {
    heldCarts,
    activeOrderId,
    activeOrderName,
    loadHeldCarts,
    saveHeldCart,
    restoreCart,
    deleteHeldCart,
    clearActiveOrder
  };
}
