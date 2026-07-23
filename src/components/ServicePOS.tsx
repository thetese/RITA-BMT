// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Printer, Banknote, Smartphone, CreditCard, Search, X, Trash2, Mic, PauseCircle,
  ShoppingCart, FolderOpen, Save, Plus, ArrowLeft
} from 'lucide-react';
import '../styles/App.css';
import { v4 as uuidv4 } from 'uuid';
import { generateThermalReceiptHTML, generateProformaHTML } from '../utils/receiptGenerator';
import { vsdcApi } from '../utils/vsdcClient';
import ShiftManager from './ShiftManager';
import POSLayout from './ui/POSLayout';
import Modal from './ui/Modal';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';
import usePOSCart from '../hooks/usePOSCart';
import useHeldCarts from '../hooks/useHeldCarts';
import { buildVSDCPayload } from '../utils/vsdc';
import { formatMoney } from '../utils/format';
import CartItem from './ui/CartItem';
import { printReceiptHTML } from '../utils/printer';

export default function ServicePOS({ currentUser, categories = [], sales = [], onSave }) {
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerName, setCustomerName] = useState('');
  const [crmCustomers, setCrmCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [notes, setNotes] = useState('');

  const [showHeldModal, setShowHeldModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ Cash: 0, Card: 0, Momo: 0, Credit: 0 });

  const [activeShift, setActiveShift] = useState(null);
  const [shiftMode, setShiftMode] = useState(null);

  // Initialize Hooks
  const { cart, setCart, addToCart, updateQuantity, updateDiscount, calculateItemDiscount, totalAmount, clearCart } = usePOSCart(products);
  const { heldCarts, activeOrderId, activeOrderName, loadHeldCarts, saveHeldCart, restoreCart, deleteHeldCart, clearActiveOrder } = useHeldCarts(window.api);
  
  const loadData = async () => {
    if (!window.api) return;
    const data = await window.api.getProducts();
    setProducts(data);
    await loadHeldCarts();
    const cData = await window.api.getCustomers();
    setCrmCustomers(cData);
    if (currentUser?.id) {
      const shift = await window.api.getActiveShift(currentUser.id);
      setActiveShift(shift);
    }
  };

  useEffect(() => { if (currentUser?.id) loadData(); }, [currentUser?.id]);

  const handleOpenShift = async (cash) => {
    const shift = await window.api.openShift(currentUser.id, cash);
    setActiveShift(shift);
  };

  const handleCloseShift = async (cash) => {
    await window.api.closeShift(activeShift.id, cash);
    setActiveShift(null);
    setShiftMode(null);
  };

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveOrderName, setSaveOrderName] = useState('');

  if (currentUser?.id && !activeShift) return <ShiftManager mode="open" onSubmit={handleOpenShift} />;
  if (shiftMode === 'close' && activeShift) return <ShiftManager mode="close" shift={activeShift} onSubmit={handleCloseShift} onCancel={() => setShiftMode(null)} />;

  const handleHoldCartClick = async () => {
    if (cart.length === 0) return;
    try {
      if (activeOrderId) {
        await saveHeldCart(cart, activeOrderName, currentUser.username);
        clearCart();
        setCustomerName('');
        setNotes('');
        clearActiveOrder();
        if (onSave) onSave();
        showToast("Order updated successfully", "success");
      } else {
        setSaveOrderName(customerName || `Order-${Date.now().toString().slice(-4)}`);
        setShowSaveModal(true);
      }
    } catch (err) {
      showToast("Error saving order: " + err.message, "error");
    }
  };

  const confirmSaveModal = async () => {
    if (!saveOrderName.trim()) {
      showToast("Please enter a name for the order.", "error");
      return;
    }
    try {
      await saveHeldCart(cart, saveOrderName, currentUser.username);
      setShowSaveModal(false);
      clearCart();
      setCustomerName('');
      setNotes('');
      clearActiveOrder();
      await loadData();
      showToast("Order suspended successfully", "success");
    } catch (err) {
      showToast("Error saving order: " + err.message, "error");
    }
  };

  const handlePrintBill = async () => {
    if (cart.length === 0) return;
    try {
      const receiptCart = cart.map(item => ({ ...item, discountAmount: calculateItemDiscount(item) }));
      const businessName = await window.api.getSetting('businessName') || '';
      const businessAddress = await window.api.getSetting('businessAddress') || '';
      const businessPhone = await window.api.getSetting('businessPhone') || '';
      
      const htmlReceipt = generateProformaHTML(
        receiptCart, totalAmount, customerName, currentUser.username,
        { businessName, businessAddress, businessPhone }, activeOrderName
      );

      const printerName = await window.api.getSetting('receiptPrinter');
      const printResult = await window.api.printReceipt(htmlReceipt, printerName || '');
      
      if (!printResult.success) showToast('Failed to print bill: ' + (printResult.errorType || 'Unknown error'), 'error');
    } catch (err) {
      showToast("Error printing bill: " + err.message, "error");
    }
  };

  const calculateTotal = () => {
    let subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    let totalDiscount = cart.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
    return subtotal - totalDiscount;
  };

  const finalTotalAmount = Math.max(0, calculateTotal() - (redeemPoints * 10));
  const totalPaid = (Number(paymentDetails.Cash) || 0) + (Number(paymentDetails.Card) || 0) + (Number(paymentDetails.Momo) || 0) + (Number(paymentDetails.Credit) || 0);
  const changeDue = totalPaid - finalTotalAmount;

  const handleStripeCheckout = async () => {
    try {
      const res = await window.api.createStripeCheckout({ amount: finalTotalAmount, description: 'Service CRM Sale' });
      if (res.success && res.url) {
        window.open(res.url, 'Stripe Checkout', 'width=500,height=700');
        setPaymentDetails({ Cash: 0, Card: finalTotalAmount, Momo: 0, Credit: 0 });
      } else {
        showToast("Stripe Error: " + (res.error || 'Unknown Error'), "error");
      }
    } catch (e) {
      showToast("Stripe Error: " + e.message, "error");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (totalPaid < finalTotalAmount) {
      showToast("Insufficient payment amount.", "error");
      return;
    }

    try {
      const receiptId = uuidv4();
      const dateStr = new Date().toISOString().split('T')[0];
      
      const tin = await window.api.getSetting('tin') || "999999999";
      const businessName = await window.api.getSetting('businessName') || '';
      const businessAddress = await window.api.getSetting('businessAddress') || '';
      const businessPhone = await window.api.getSetting('businessPhone') || '';
      
      const customerInfo = selectedCustomer ? crmCustomers.find(c => c.id === selectedCustomer) : null;

      const creditAmount = Number(paymentDetails.Credit) || 0;
      if (creditAmount > 0) {
        if (!customerInfo) {
          showToast('You must select a registered customer to use Store Credit.', 'error');
          return;
        }
        if (!customerInfo.creditLimit || customerInfo.creditLimit <= 0) {
          showToast('This customer is not approved for store credit.', 'error');
          return;
        }
        const currentBalance = customerInfo.accountBalance || 0;
        if ((currentBalance + creditAmount) > customerInfo.creditLimit) {
          showToast(`Credit limit exceeded! Customer can only borrow up to ${(customerInfo.creditLimit - currentBalance).toLocaleString()} FRW more.`, 'error');
          return;
        }
      }
      
      const { rceipt, taxblAmtA, taxblAmtB, taxAmtB, itemList } = buildVSDCPayload(cart, paymentDetails, tin, totalAmount, calculateItemDiscount, receiptId, customerInfo);

      // @ts-ignore
      rceipt.pmtTyCd = Number(paymentDetails.Cash) >= paymentDetails.Card && Number(paymentDetails.Cash) >= paymentDetails.Momo ? "01" : Number(paymentDetails.Card) >= paymentDetails.Momo ? "02" : "04";
      // @ts-ignore
      rceipt.salesSttsCd = "02";
      // @ts-ignore
      rceipt.salesTyCd = "N";

      const vsdcResponse = await vsdcApi.saveSales(rceipt);
      const rcptSign = vsdcResponse.data.rcptSign;
      const intrlData = vsdcResponse.data.intrlData;
      const rcptNo = vsdcResponse.data.rcptNo;

      for (const item of cart) {
        const dcAmt = calculateItemDiscount(item);
        const dcRt = item.discount.includes('%') ? parseFloat(item.discount) || 0 : 0;
        const finalPrice = (item.quantity * item.unitPrice) - dcAmt;

        await window.api.addSale({
          productId: item.originalProductId || item.productId,
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          totalPrice: finalPrice - (redeemPoints > 0 ? (redeemPoints * 10 / cart.length) : 0),
          date: dateStr,
          customerName: customerInfo ? customerInfo.name : '',
          customerId: selectedCustomer || null,
          notes: notes,
          paymentMethod: Number(paymentDetails.Cash) >= paymentDetails.Card && Number(paymentDetails.Cash) >= paymentDetails.Momo && Number(paymentDetails.Cash) >= paymentDetails.Credit ? 'Cash' 
                         : Number(paymentDetails.Card) >= paymentDetails.Momo && Number(paymentDetails.Card) >= paymentDetails.Credit ? 'Card' 
                         : Number(paymentDetails.Credit) >= paymentDetails.Momo ? 'Store Credit' : 'Mobile Money',
          paymentDetails: JSON.stringify({
            Cash: Number(paymentDetails.Cash) || 0,
            Card: Number(paymentDetails.Card) || 0,
            "Mobile Money": Number(paymentDetails.Momo) || 0,
            "Store Credit": Number(paymentDetails.Credit) || 0
          }),
          discountAmount: dcAmt,
          discountRate: dcRt,
          receiptId: receiptId,
          receiptSignature: rcptSign,
          internalData: intrlData,
          receiptNo: rcptNo,
          waiterName: currentUser.username
        }, currentUser.id);
      }

      if (redeemPoints > 0 && selectedCustomer) {
        await window.api.deductCustomerPoints(selectedCustomer, redeemPoints);
      }
      if (creditAmount > 0 && selectedCustomer) {
        await window.api.adjustCustomerBalance(selectedCustomer, creditAmount);
      }

      const receiptCart = cart.map(item => ({ ...item, discountAmount: calculateItemDiscount(item) }));

      const htmlReceipt = generateThermalReceiptHTML(
        receiptCart, totalAmount, receiptId, paymentMethod, customerName, currentUser.username,
        {
          tin, businessName, businessAddress, businessPhone, rcptSign, intrlData, rcptNo,
          sdcId: vsdcResponse.data.sdcId, mrcNo: vsdcResponse.data.mrcNo, taxblAmtA, taxblAmtB, taxAmtB
        },
        {
          Cash: Number(paymentDetails.Cash) || 0, Card: Number(paymentDetails.Card) || 0, "Mobile Money": Number(paymentDetails.Momo) || 0, "Store Credit": Number(paymentDetails.Credit) || 0
        }
      );

      const printerName = await window.api.getSetting('receiptPrinter');
      const printResult = await window.api.printReceipt(htmlReceipt, printerName || '');
      
      if (printResult.success) {
        showToast('Checkout complete and receipt printed!', 'success');
      } else {
        showToast('Checkout complete, but printing failed: ' + (printResult.errorType || 'Unknown error'), 'error');
      }

      if (activeOrderId) await deleteHeldCart(activeOrderId, () => true);
      clearCart();
      setCustomerName('');
      setNotes('');
      setPaymentDetails({ Cash: 0, Card: 0, Momo: 0, Credit: 0 });
      setShowPaymentModal(false);
      clearActiveOrder();
      await loadData();
      if (onSave) onSave();

    } catch (err) {
      showToast("Error during checkout: " + err.message, "error");
    }
  };

  const filteredProducts = products.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (search && !p.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const LeftPanel = (
    <>
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
          const isService = import.meta.env.VITE_APP_TYPE === 'service';
          const isOutOfStock = isService ? false : p.stockQuantity <= 0;
          const isLowStock = isService ? false : (p.stockQuantity > 0 && p.stockQuantity <= 5);
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
                {!isService && (
                  <div style={{ fontSize: '0.7rem', color: isLowStock ? '#ff9800' : 'var(--text-secondary)', fontWeight: isLowStock ? 'bold' : 'normal', marginBottom: '2px' }}>
                    Stock: {p.stockQuantity || 0}
                  </div>
                )}
                <div className="pos-product-price" style={{ whiteSpace: 'nowrap' }}>{formatMoney(p.unitPrice)} FRW</div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px', fontSize: '1.2rem' }}>No products found.</div>
        )}
      </div>
    </>
  );

  const RightPanel = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 20px 0' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{activeOrderId ? `Sale: ${activeOrderName}` : 'New Sale'}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary btn-sm" onClick={() => { loadHeldCarts(); setShowHeldModal(true); }} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderOpen size={16} /> Suspended
          </button>
          <button className="btn-secondary btn-sm" onClick={handleHoldCartClick} disabled={cart.length === 0} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeOrderId ? <><Save size={16} /> Update</> : <><PauseCircle size={16} /> Suspend</>}
          </button>
        </div>
      </div>
      
      <div className="pos-cart-list">
        {cart.map(item => {
          const dcAmt = calculateItemDiscount(item);
          return (
            <CartItem 
              key={item.productId} 
              item={item} 
              dcAmt={dcAmt} 
              onUpdateQuantity={updateQuantity} 
              onUpdateDiscount={updateDiscount} 
            />
          );
        })}
        {cart.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '60px', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={48} style={{ opacity: 0.3 }} /> Cart is empty
          </div>
        )}
      </div>

      <div className="pos-checkout-area">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '20px' }}>
          <div className="form-row">
            <label style={{ display: 'block', marginBottom: '5px' }}>Customer</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="pos-search-input" style={{ padding: '10px 16px' }}>
              <option value="">Walk-in Customer</option>
              {crmCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <input type="text" placeholder="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} className="pos-search-input" style={{ padding: '10px 16px' }} />
          
          {selectedCustomer && crmCustomers.find(c => c.id === selectedCustomer)?.points > 0 && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(79, 70, 229, 0.05)', padding: '12px', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', flex: 1, fontWeight: '600' }}>
                Redeem Points (Max {crmCustomers.find(c => c.id === selectedCustomer).points})<br/>
                <small style={{ opacity: 0.8 }}>1 pt = 10 FRW off</small>
              </span>
              <input type="number" max={crmCustomers.find(c => c.id === selectedCustomer).points} min="0" value={redeemPoints} onChange={e => setRedeemPoints(Math.min(parseInt(e.target.value) || 0, crmCustomers.find(c => c.id === selectedCustomer).points))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--primary)', width: '80px', textAlign: 'center', fontWeight: 'bold' }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Total</span>
          <span className="pos-gradient-text">{formatMoney(finalTotalAmount)} FRW</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ flex: '0 0 120px', padding: '16px', borderRadius: '16px', fontWeight: 'bold', border: '2px solid var(--border-color)' }} onClick={handlePrintBill} disabled={cart.length === 0}>
            <Printer size={18} style={{ marginRight: '6px' }} /> Bill
          </button>
          <button className="pos-checkout-btn" style={{ flex: '1' }} onClick={() => { setPaymentDetails({ Cash: 0, Card: 0, Momo: 0, Credit: 0 }); setShowPaymentModal(true); }} disabled={cart.length === 0}>
            Checkout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <POSLayout leftPanel={LeftPanel} rightPanel={RightPanel} />

      <Modal title="Suspended Sales" isOpen={showHeldModal} onClose={() => setShowHeldModal(false)}>
        <div style={{ maxHeight: '400px', overflowY: 'auto', margin: '15px 0' }}>
          {heldCarts.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No open orders.</div>
          ) : (
            heldCarts.map(hc => {
              const items = JSON.parse(hc.cartData);
              const qty = items.reduce((sum, i) => sum + i.quantity, 0);
              const tot = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
              return (
                <div key={hc.id} style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{hc.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Waiter: {hc.waiterName || 'Unknown'} | {qty} items - {formatMoney(tot)} FRW
                      <br/>Updated: {new Date(hc.updatedAt || hc.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-primary btn-sm" onClick={async () => {
                      const res = await restoreCart(hc, cart, () => askConfirm("This will overwrite the current active cart. Continue?"));
                      if (res) setCart(res);
                    }}>
                      Load
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ flex: 1, color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                      onClick={async () => {
                        const deletedActive = await deleteHeldCart(hc.id, () => askConfirm("Delete this open order permanently?"));
                        if (deletedActive) clearCart();
                      }}>Delete</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      <Modal title="Payment" isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', margin: '20px 0' }}>
          Total: {formatMoney(finalTotalAmount)} FRW
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setPaymentDetails({ Cash: finalTotalAmount, Card: 0, Momo: 0, Credit: 0 })}>
            <Banknote size={16} /> All Cash
          </button>
          <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setPaymentDetails({ Cash: 0, Card: 0, Momo: finalTotalAmount, Credit: 0 })}>
            <Smartphone size={16} /> All MoMo
          </button>
          <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setPaymentDetails({ Cash: 0, Card: finalTotalAmount, Momo: 0, Credit: 0 })}>
            <CreditCard size={16} /> All Card
          </button>
          {selectedCustomer && (
            <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--primary-color)', color: 'white', border: 'none' }} onClick={() => setPaymentDetails({ Cash: 0, Card: 0, Momo: 0, Credit: finalTotalAmount })}>
              All Credit
            </button>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '12px', background: '#635BFF', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }} onClick={handleStripeCheckout}>
            <CreditCard size={20} /> Pay with Stripe
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Cash (FRW)</label>
            <input type="number" min="0" value={paymentDetails.Cash as any} onChange={e => setPaymentDetails({...paymentDetails, Cash: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '150px', textAlign: 'right' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Card (FRW)</label>
            <input type="number" min="0" value={paymentDetails.Card as any} onChange={e => setPaymentDetails({...paymentDetails, Card: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '150px', textAlign: 'right' }} />
          </div>
          {selectedCustomer && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Store Credit (FRW)</label>
              <input type="number" min="0" value={paymentDetails.Credit as any} onChange={e => setPaymentDetails({...paymentDetails, Credit: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '150px', textAlign: 'right' }} />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Momo (FRW)</label>
            <input type="number" min="0" value={paymentDetails.Momo as any} onChange={e => setPaymentDetails({...paymentDetails, Momo: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '150px', textAlign: 'right' }} />
          </div>
        </div>

        <div style={{ padding: '15px', background: changeDue >= 0 ? 'var(--success)' : 'var(--danger)', color: '#fff', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>{changeDue >= 0 ? 'Change Due:' : 'Remaining Balance:'}</span>
          <span>{formatMoney(Math.abs(changeDue))} FRW</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowPaymentModal(false)}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleCheckout} disabled={totalPaid < finalTotalAmount}>Complete Sale</button>
        </div>
      </Modal>

      <Modal title="Save Suspended Sale" isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Enter a reference name for this suspended sale (e.g. Customer Name):</p>
        <input 
          type="text" 
          value={saveOrderName} 
          onChange={e => setSaveOrderName(e.target.value)} 
          placeholder="Order name..." 
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') confirmSaveModal(); }}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px', fontSize: '1.1rem' }} 
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowSaveModal(false)}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={confirmSaveModal}>Save</button>
        </div>
      </Modal>
    </>
  );
}
