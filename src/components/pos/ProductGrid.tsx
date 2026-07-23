import React, { useState } from 'react';
import { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  categories: string[];
  addToCart: (product: Product, priceOverride: number | null) => void;
}

export default function ProductGrid({ products, categories, addToCart }: ProductGridProps) {
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const filteredProducts = products.filter(p => {
    const prod = p as any;
    if (filterCategory && prod.category !== filterCategory) return false;
    if (search && !(prod.productName || prod.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pos-panel pos-products-panel">
      <div className="pos-search-bar">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pos-search-input"
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="pos-search-input" style={{ flex: '0 0 200px' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="pos-product-grid">
        {filteredProducts.map(p => {
          const prod = p as any;
          const isOutOfStock = prod.stockQuantity <= 0;
          const isLowStock = prod.stockQuantity > 0 && prod.stockQuantity <= 5;
          
          const catHash = prod.category ? prod.category.charCodeAt(0) % 5 : 0;
          const cardBg = isOutOfStock ? 'var(--bg-secondary)' : `var(--pos-cat-${catHash})`;

          return (
            <div 
              key={prod.id} 
              onClick={() => { if (!isOutOfStock) addToCart(p, null); }}
              className={`pos-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
              style={{ background: cardBg }}
            >
              {isLowStock && <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff9800', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }}>LOW STOCK</div>}
              
              <div>
                <div style={{ display: 'inline-block', padding: '2px 6px', background: 'var(--pos-cat-tag-bg)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--pos-cat-tag-text)', marginBottom: '4px', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prod.category || 'Item'}
                </div>
                <div className="pos-product-title" style={{ color: 'var(--pos-card-title)' }}>{prod.productName || prod.name}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: isLowStock ? '#ff9800' : 'var(--text-secondary)', fontWeight: isLowStock ? 'bold' : 'normal', marginBottom: '2px' }}>
                  Stock: {prod.stockQuantity || prod.stockLevel || 0}
                </div>
                <div className="pos-product-price" style={{ whiteSpace: 'nowrap' }}>{(prod.unitPrice || prod.price || 0).toLocaleString()} FRW</div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px', fontSize: '1.2rem' }}>No products found.</div>
        )}
      </div>
    </div>
  );
}
