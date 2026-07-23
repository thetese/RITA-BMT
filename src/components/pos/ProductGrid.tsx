// @ts-nocheck
import React from 'react';
import { formatMoney } from '../../utils/format';

export default function ProductGrid({ products, addToCart }) {
  return (
    <div className="pos-product-grid">
      {products.map(p => {
        const isOutOfStock = p.stockQuantity <= 0;
        const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 5;
        const catHash = p.category ? p.category.charCodeAt(0) % 5 : 0;
        const cardBg = isOutOfStock ? 'var(--bg-secondary)' : `var(--pos-cat-${catHash})`;

        return (
          <div 
            key={p.id} 
            onClick={() => { if (!isOutOfStock) addToCart(p, null); }}
            className={`pos-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
            style={{ background: cardBg }}
          >
            {isLowStock && <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff9800', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }}>LOW STOCK</div>}
            <div>
              <div style={{ display: 'inline-block', padding: '2px 6px', background: 'var(--pos-cat-tag-bg)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--pos-cat-tag-text)', marginBottom: '4px', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.category || 'Item'}
              </div>
              <div className="pos-product-title" style={{ color: 'var(--pos-card-title)' }}>{p.productName}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: isLowStock ? '#ff9800' : 'var(--text-secondary)', fontWeight: isLowStock ? 'bold' : 'normal', marginBottom: '2px' }}>
                Stock: {p.stockQuantity || 0}
              </div>
              <div className="pos-product-price" style={{ whiteSpace: 'nowrap' }}>{formatMoney(p.unitPrice)} FRW</div>
            </div>
          </div>
        );
      })}
      {products.length === 0 && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px', fontSize: '1.2rem' }}>No products found.</div>
      )}
    </div>
  );
}
