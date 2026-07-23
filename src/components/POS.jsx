import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateThermalReceiptHTML } from '../utils/receiptGenerator';
import { vsdcApi } from '../utils/vsdcMock';

export default function POS({ currentUser, categories }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  const loadProducts = async () => {
    if (!window.api) return;
    const data = await window.api.getProducts();
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, {
          productId: product.id,
          productName: product.productName,
          category: product.category,
          unitPrice: product.unitPrice,
          costPrice: product.costPrice,
          taxTyCd: product.taxTyCd || 'B',
          itemCd: product.itemCd,
          itemClsCd: product.itemClsCd,
          quantity: 1
        }];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: newQ > 0 ? newQ : 0 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const receiptId = uuidv4();
      const dateStr = new Date().toISOString().split('T')[0];
      
      const tin = await window.api.getSetting('tin') || "999999999";
      
      let taxblAmtA = 0;
      let taxblAmtB = 0;
      let taxAmtB = 0;

      const itemList = cart.map((item, index) => {
        const itemTot = item.quantity * item.unitPrice;
        let taxAmt = 0;
        let taxbl = itemTot;
        
        if (item.taxTyCd === 'B') {
           taxAmt = itemTot - (itemTot / 1.18);
           taxbl = itemTot - taxAmt;
           taxblAmtB += taxbl;
           taxAmtB += taxAmt;
        } else {
           taxblAmtA += taxbl;
        }
        
        return {
          itemSeq: index + 1,
          itemCd: item.itemCd || "RW2NTBA0000012",
          itemClsCd: item.itemClsCd || "5059690800",
          itemNm: item.productName,
          bcd: null,
          pkgUnitCd: "NT",
          pkg: 1,
          qtyUnitCd: "U",
          qty: item.quantity,
          prc: item.unitPrice,
          splyAmt: itemTot,
          dcRt: 0,
          dcAmt: 0,
          taxTyCd: item.taxTyCd,
          taxblAmt: taxbl,
          taxAmt: taxAmt,
          totAmt: itemTot
        };
      });

      const vsdcPayload = {
        tin: tin,
        bhfId: "00",
        invcNo: 1,
        orgInvcNo: 0,
        custTin: "",
        custNm: customerName,
        salesTyCd: "N",
        rcptTyCd: "S",
        pmtTyCd: paymentMethod === 'Cash' ? "01" : paymentMethod === 'Card' ? "02" : "04",
        salesSttsCd: "02",
        cfmDt: dateStr.replace(/-/g, '') + "120000",
        salesDt: dateStr.replace(/-/g, ''),
        stockRlsDt: dateStr.replace(/-/g, '') + "120000",
        totItemCnt: cart.length,
        taxblAmtA: taxblAmtA,
        taxblAmtB: taxblAmtB,
        taxblAmtC: 0,
        taxblAmtD: 0,
        taxRtA: 0,
        taxRtB: 18,
        taxRtC: 0,
        taxRtD: 0,
        taxAmtA: 0,
        taxAmtB: taxAmtB,
        taxAmtC: 0,
        taxAmtD: 0,
        totTaxblAmt: taxblAmtA + taxblAmtB,
        totTaxAmt: taxAmtB,
        totAmt: totalAmount,
        itemList: itemList
      };

      const vsdcResponse = await vsdcApi.saveSales(vsdcPayload);
      const rcptSign = vsdcResponse.data.rcptSign;
      const intrlData = vsdcResponse.data.intrlData;
      const rcptNo = vsdcResponse.data.rcptNo;

      // 1. Add each sale to DB
      for (const item of cart) {
        await window.api.addSale({
          productId: item.productId,
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          totalPrice: item.quantity * item.unitPrice,
          date: dateStr,
          customerName: customerName,
          notes: notes,
          paymentMethod: paymentMethod,
          receiptId: receiptId,
          receiptSignature: rcptSign,
          internalData: intrlData,
          receiptNo: rcptNo
        }, currentUser.id);
      }

      // 2. Generate Receipt HTML
      const htmlReceipt = generateThermalReceiptHTML(
        cart, 
        totalAmount, 
        receiptId, 
        paymentMethod, 
        customerName, 
        currentUser.username,
        {
          tin,
          rcptSign,
          intrlData,
          rcptNo,
          sdcId: vsdcResponse.data.sdcId,
          mrcNo: vsdcResponse.data.mrcNo,
          taxblAmtA,
          taxblAmtB,
          taxAmtB
        }
      );

      // 3. Print
      const printerName = await window.api.getSetting('receiptPrinter');
      const printResult = await window.api.printReceipt(htmlReceipt, printerName || '');
      
      if (printResult.success) {
        alert('Checkout complete and receipt printed!');
      } else {
        alert('Checkout complete, but printing failed: ' + (printResult.errorType || 'Unknown error'));
      }

      // 4. Clear cart
      setCart([]);
      setCustomerName('');
      setNotes('');
      setPaymentMethod('Cash');
      loadProducts(); // refresh stock

    } catch (err) {
      alert("Error during checkout: " + err.message);
    }
  };

  const filteredProducts = products.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (search && !p.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', gap: '20px', padding: '20px' }}>
      
      {/* Left Panel: Product Selection */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', alignContent: 'start' }}>
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              onClick={() => addToCart(p)}
              style={{ 
                background: '#fff', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '15px', 
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.95rem' }}>{p.productName}</div>
              <div style={{ color: 'var(--primary)', fontWeight: '600' }}>{p.unitPrice.toLocaleString()} FRW</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Stock: {p.stockQuantity || 0}</div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>No products found.</div>
          )}
        </div>
      </div>

      {/* Right Panel: Cart */}
      <div style={{ width: '350px', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '20px' }}>
        <h2 style={{ margin: '0 0 15px 0' }}>Current Cart</h2>
        
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
          {cart.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed var(--border-color)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500' }}>{item.productName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.unitPrice.toLocaleString()} FRW</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQuantity(item.productId, -1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: '#e2e8f0', cursor: 'pointer' }}>-</button>
                <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer' }}>+</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>Cart is empty</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label>Payment:</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>
          </div>
          <input type="text" placeholder="Customer Name (Optional)" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          <input type="text" placeholder="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '15px' }}>
          <span>Total:</span>
          <span style={{ color: 'var(--primary)' }}>{totalAmount.toLocaleString()} FRW</span>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
          onClick={handleCheckout}
          disabled={cart.length === 0}
        >
          Checkout & Print
        </button>
      </div>

    </div>
  );
}
