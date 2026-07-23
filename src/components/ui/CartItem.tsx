import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatMoney } from '../../utils/format';
import { Badge } from './DesignSystem';

const statusTone: Record<string, 'neutral' | 'success' | 'warning'> = {
  preparing: 'warning',
  ready: 'success',
  pending: 'neutral'
};

const CartItem = React.memo(({ item, dcAmt, onUpdateQuantity, onUpdateDiscount }: any) => {
  return (
    <div className="pos-cart-item">
      <div className="pos-cart-item-main">
        <div className="pos-cart-item-copy">
          <div className="pos-cart-item-title">
            {item.productName}
            {item.status && <Badge tone={statusTone[item.status] || 'neutral'}>{item.status}</Badge>}
          </div>
          <div className="pos-cart-item-meta">
            {formatMoney(item.unitPrice)} FRW
            {dcAmt > 0 && <span className="pos-cart-discount">-{formatMoney(dcAmt)}</span>}
          </div>
        </div>

        <div className="pos-qty-control" aria-label={'Quantity for ' + item.productName}>
          <button type="button" onClick={() => onUpdateQuantity(item.productId, -1)} className="pos-qty-btn" aria-label="Decrease quantity">
            <Minus size={16} />
          </button>
          <span>{item.quantity}</span>
          <button type="button" onClick={() => onUpdateQuantity(item.productId, 1)} className="pos-qty-btn plus" aria-label="Increase quantity">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <label className="pos-discount-field">
        <span>Discount</span>
        <input
          type="text"
          placeholder="% or FRW"
          value={item.discount}
          onChange={e => onUpdateDiscount(item.productId, e.target.value)}
        />
      </label>
    </div>
  );
});

export default CartItem;
