import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Smartphone, ShoppingCart, 
  HelpCircle, ChevronRight, Plus, Minus, CheckCircle2,
  Printer, ArrowLeft
} from 'lucide-react';
import './KioskPOS.css';
import Modal from './ui/Modal';
import { formatMoney } from '../utils/format';

export default function KioskView({ 
  products, 
  categories, 
  cart, 
  addToCart, 
  updateQuantity, 
  totalAmount, 
  clearCart, 
  onExit,
  onKioskHold,
  onKioskCheckout,
  showToast
}) {
  const [filterCategory, setFilterCategory] = useState('');
  const [step, setStep] = useState('welcome'); // 'welcome', 'shop', 'success'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [exitClicks, setExitClicks] = useState(0);

  useEffect(() => {
    if (categories && categories.length > 0 && !filterCategory) {
      setFilterCategory(categories[0]);
    }
  }, [categories, filterCategory]);

  // Inactivity Timeout
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (step !== 'welcome') {
        inactivityTimer = setTimeout(() => {
          if (cart.length > 0) {
            showToast("Session expired due to inactivity.", "info");
            clearCart();
          }
          setStep('welcome');
          setShowPaymentModal(false);
        }, 60000); // 60 seconds
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [step, cart.length, clearCart, showToast]);

  const handleHiddenExitClick = () => {
    setExitClicks(prev => {
      if (prev + 1 >= 5) {
        const pin = prompt("Enter Admin PIN to exit Kiosk Mode:");
        if (pin === "1234") {
          onExit();
        } else {
          showToast("Incorrect PIN", "error");
        }
        return 0;
      }
      return prev + 1;
    });
  };

  const handleStart = () => {
    clearCart();
    setStep('shop');
  };

  const handlePaymentSelect = async (method) => {
    if (method === 'PayAtCounter') {
      const success = await onKioskHold();
      if (success) {
        setStep('success');
      }
    } else {
      const pd = {
        Cash: 0,
        Card: method === 'Card' ? totalAmount : 0,
        Momo: method === 'Momo' ? totalAmount : 0,
        Credit: 0
      };
      const success = await onKioskCheckout(pd, method);
      if (success) {
        setStep('success');
      }
    }
    setShowPaymentModal(false);
  };

  const filteredProducts = products.filter(p => !filterCategory || p.category === filterCategory);

  return (
    <div className="kiosk-container">
      <div className="kiosk-hidden-exit" onClick={handleHiddenExitClick} />

      {step === 'welcome' && (
        <div className="kiosk-welcome-screen">
          <button 
            onClick={onExit} 
            style={{ position: 'absolute', top: '30px', left: '40px', background: 'rgba(0,0,0,0.05)', border: 'none', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600 }}
          >
            <ArrowLeft size={20} /> Exit Kiosk
          </button>
          <h2>Welcome to Rita</h2>
          <p>Tap below to start your order</p>
          <button className="kiosk-start-btn" onClick={handleStart}>
            Start Order
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="kiosk-welcome-screen" style={{ background: 'var(--bg-primary)' }}>
          <CheckCircle2 size={100} color="var(--primary)" style={{ marginBottom: '20px' }} />
          <h2>Order Complete!</h2>
          <p>Please take your receipt / ticket.</p>
          <button className="kiosk-start-btn" onClick={() => setStep('welcome')} style={{ padding: '20px 60px', fontSize: '1.8rem', animation: 'none' }}>
            New Order
          </button>
        </div>
      )}

      {step === 'shop' && (
        <>
          <header className="kiosk-header">
            <div className="kiosk-logo">
              <button 
                onClick={() => setStep('welcome')}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '15px' }}
                title="Go Back"
              >
                <ArrowLeft size={28} />
              </button>
              <img src="/logo.png" alt="Logo" />
              <h1>Self Checkout</h1>
            </div>
            <button className="kiosk-help-btn" onClick={() => showToast("A team member has been notified.", "info")}>
              <HelpCircle size={20} /> Need Help?
            </button>
          </header>

          <main className="kiosk-main">
            <div className="kiosk-content">
              {/* Product Selection */}
              <div className="kiosk-products">
                <div className="kiosk-categories">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      className={`kiosk-category-btn ${filterCategory === cat ? 'active' : ''}`}
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="kiosk-products-grid">
                  {filteredProducts.map(product => {
                    const isOutOfStock = product.stockQuantity <= 0;
                    return (
                      <div 
                        key={product.id} 
                        className={`kiosk-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                        onClick={() => {
                          if (!isOutOfStock) addToCart(product);
                          else showToast("Item is out of stock.", "error");
                        }}
                      >
                        <h3>{product.productName}</h3>
                        <div className="price">{formatMoney(product.unitPrice)}</div>
                        {isOutOfStock && <div style={{ color: 'var(--danger)', fontWeight: 'bold', marginTop: '10px' }}>OUT OF STOCK</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cart Section */}
              <div className="kiosk-cart-section">
                <div className="kiosk-cart-header">
                  <h2>Your Order</h2>
                  {cart.length > 0 && (
                    <button className="kiosk-clear-btn" onClick={() => {
                      if (window.confirm("Are you sure you want to clear your order?")) {
                        clearCart();
                        setStep('welcome');
                      }
                    }}>Cancel Order</button>
                  )}
                </div>
                
                <div className="kiosk-cart-items">
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '50px' }}>
                      <ShoppingCart size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                      <h3>Your cart is empty</h3>
                      <p>Scan an item or tap a product to begin</p>
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="kiosk-cart-item">
                        <div className="kiosk-cart-item-info">
                          <h4>{item.productName}</h4>
                          <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{formatMoney(item.unitPrice * item.quantity)}</div>
                        </div>
                        <div className="kiosk-cart-item-controls">
                          <button className="kiosk-qty-btn" onClick={() => updateQuantity(index, item.quantity - 1)}>
                            <Minus size={20} />
                          </button>
                          <span className="kiosk-qty-display">{item.quantity}</span>
                          <button className="kiosk-qty-btn" onClick={() => updateQuantity(index, item.quantity + 1)}>
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="kiosk-cart-footer">
                  <div className="kiosk-cart-total">
                    <span>Total:</span>
                    <span>{formatMoney(totalAmount)}</span>
                  </div>
                  <button 
                    className="kiosk-pay-btn" 
                    disabled={cart.length === 0}
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Pay Now <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {showPaymentModal && (
        <Modal isOpen={true} title="Select Payment Method" onClose={() => setShowPaymentModal(false)}>
          <div className="kiosk-payment-options">
            <div className="kiosk-payment-card" onClick={() => handlePaymentSelect('Card')}>
              <CreditCard size={40} color="var(--primary)" />
              <h3>Credit / Debit Card</h3>
            </div>
            <div className="kiosk-payment-card" onClick={() => handlePaymentSelect('Momo')}>
              <Smartphone size={40} color="var(--primary)" />
              <h3>Mobile Money</h3>
            </div>
            <div className="kiosk-payment-card primary" onClick={() => handlePaymentSelect('PayAtCounter')}>
              <Printer size={40} />
              <h3>Print & Pay at Counter (Cash)</h3>
            </div>
          </div>
          <button className="btn-secondary" style={{ width: '100%', padding: '15px', marginTop: '15px' }} onClick={() => setShowPaymentModal(false)}>
            Back to Cart
          </button>
        </Modal>
      )}
    </div>
  );
}
