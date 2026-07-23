import { useState } from 'react';

export default function usePOSCart(products) {
  const [cart, setCart] = useState([]);

  const addToCart = (product, priceOverride = null) => {
    if (product.stockQuantity <= 0 && !priceOverride) return; 
    
    setCart(prev => {
      const unitPriceToUse = priceOverride !== null ? priceOverride : product.unitPrice;
      const quantityToUse = priceOverride !== null ? 1 : 1; 
      
      const existing = prev.find(item => item.productId === product.id && item.unitPrice === unitPriceToUse);
      if (existing && priceOverride === null) {
        if (existing.quantity >= product.stockQuantity) {
          return prev;
        }
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, {
          productId: product.id + (priceOverride ? '-' + Date.now() : ''), 
          originalProductId: product.id,
          productName: product.productName + (priceOverride ? ' (Scale Item)' : ''),
          category: product.category,
          unitPrice: unitPriceToUse,
          costPrice: product.costPrice,
          taxTyCd: product.taxTyCd || 'B',
          itemCd: product.itemCd,
          itemClsCd: product.itemClsCd,
          quantity: quantityToUse,
          discount: '',
          status: 'pending'
        }];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQ = item.quantity + delta;
          const product = products.find(p => p.id === productId);
          if (product && newQ > product.stockQuantity) {
            return item; 
          }
          return { ...item, quantity: newQ > 0 ? newQ : 0 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const updateDiscount = (productId, discountVal) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          return { ...item, discount: discountVal };
        }
        return item;
      });
    });
  };

  const calculateItemDiscount = (item) => {
    const splyAmt = item.quantity * item.unitPrice;
    if (!item.discount) return 0;
    if (item.discount.includes('%')) {
      const pct = parseFloat(item.discount) || 0;
      return (splyAmt * pct) / 100;
    }
    return parseFloat(item.discount) || 0;
  };

  const totalAmount = cart.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) - calculateItemDiscount(item)), 0);

  const clearCart = () => setCart([]);

  return {
    cart,
    setCart,
    addToCart,
    updateQuantity,
    updateDiscount,
    calculateItemDiscount,
    totalAmount,
    clearCart
  };
}
