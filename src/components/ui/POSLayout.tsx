import React from 'react';

export default function POSLayout({ leftPanel, rightPanel }) {
  return (
    <div className="pos-container">
      <div className="pos-panel pos-products-panel">
        {leftPanel}
      </div>
      <div className="pos-panel pos-cart-panel">
        {rightPanel}
      </div>
    </div>
  );
}
