// @ts-nocheck
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';

const defaultProduct = {
  productName: '',
  category: '',
  unitPrice: '',
  costPrice: '',
  stockQuantity: '',
  lowStockThreshold: 5,
  taxTyCd: 'B',
  barcode: '',
  type: 'standard',
  comboItems: '[]'
};

export default function ProductsManagement({ categories = [], currentUser, businessType = 'restaurant' }) {
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(defaultProduct);
  const [editingId, setEditingId] = useState(null);
  
  const [comboItemForm, setComboItemForm] = useState({ productId: '', quantity: 1 });

  const handleAddComboItem = () => {
    if (!comboItemForm.productId) return;
    const currentItems = JSON.parse(form.comboItems || '[]');
    const exists = currentItems.find(i => i.productId === comboItemForm.productId);
    let newItems;
    if (exists) {
      newItems = currentItems.map(i => i.productId === comboItemForm.productId ? { ...i, quantity: i.quantity + Number(comboItemForm.quantity) } : i);
    } else {
      newItems = [...currentItems, { productId: comboItemForm.productId, quantity: Number(comboItemForm.quantity) }];
    }
    setForm(prev => ({ ...prev, comboItems: JSON.stringify(newItems) }));
    setComboItemForm({ productId: '', quantity: 1 });
  };

  const handleRemoveComboItem = (productId) => {
    const currentItems = JSON.parse(form.comboItems || '[]');
    const newItems = currentItems.filter(i => i.productId !== productId);
    setForm(prev => ({ ...prev, comboItems: JSON.stringify(newItems) }));
  };
  
  // Stock Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ quantity: '', type: 'IN', reason: '' });

  // Recipe Modal
  const [recipeProduct, setRecipeProduct] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [recipeForm, setRecipeForm] = useState({ ingredientId: '', quantityRequired: '' });

  // Label Printing Modal
  const [printingProduct, setPrintingProduct] = useState(null);
  const [printCopies, setPrintCopies] = useState(1);
  const barcodeRef = React.useRef(null);

  useEffect(() => {
    if (printingProduct && barcodeRef.current) {
      try {
        // Fallback to random ID chunk if no barcode exists
        const code = printingProduct.barcode || printingProduct.id.substring(0, 10);
        JsBarcode(barcodeRef.current, code, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: true,
          fontSize: 14,
          margin: 0
        });
      } catch (err) {
        console.error("Barcode generation error:", err);
      }
    }
  }, [printingProduct]);

  const confirmPrintLabel = async () => {
    if (!printingProduct || !barcodeRef.current) return;
    
    const svgContent = barcodeRef.current.outerHTML;
    
    let htmlContent = `
      <html>
      <head>
        <style>
          @page { margin: 0; }
          body { font-family: sans-serif; text-align: center; margin: 0; padding: 5px; }
          .label { width: 100%; margin-bottom: 20px; page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100px; }
          .name { font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%; margin-bottom: 5px; }
          .price { font-size: 14px; font-weight: bold; margin-top: 5px; }
          svg { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
    `;
    
    for (let i = 0; i < printCopies; i++) {
      htmlContent += `
        <div class="label">
          <div class="name">${printingProduct.productName}</div>
          ${svgContent}
          <div class="price">${printingProduct.unitPrice.toLocaleString()} FRW</div>
        </div>
      `;
    }
    
    htmlContent += `</body></html>`;
    
    const printerName = await window.api.getSetting('receiptPrinter');
    const result = await window.api.printReceipt(htmlContent, printerName || '');
    if (!result.success) {
      showToast("Print failed: " + (result.errorType || 'Unknown error'), "error");
    }
    setPrintingProduct(null);
    setPrintCopies(1);
  };

  const fileInputRef = React.useRef(null);

  const loadProducts = async () => {
    if (!window.api) return;
    const data = await window.api.getProducts();
    setProducts(data);
    const ingData = await window.api.getIngredients();
    setIngredients(ingData);
  };

  useEffect(() => { loadProducts(); }, []);

  // Barcode Scanner Listener for auto-identifying products
  const barcodeBufferRef = React.useRef('');
  const lastKeyTimeRef = React.useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      
      const currentTime = Date.now();
      if (currentTime - lastKeyTimeRef.current > 50) {
        barcodeBufferRef.current = '';
      }
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length > 0) {
          const scannedCode = barcodeBufferRef.current;
          let foundProduct = products.find(p => p.barcode === scannedCode);
          
          if (!foundProduct && scannedCode.length === 13 && /^2[0-9]/.test(scannedCode)) {
            const itemCodePrefix = scannedCode.substring(0, 7);
            foundProduct = products.find(p => p.barcode && p.barcode.startsWith(itemCodePrefix));
          }

          if (foundProduct) {
            handleEdit(foundProduct);
          } else {
            // New product, open add form and prefill barcode
            setForm({ ...defaultProduct, barcode: scannedCode });
            setEditingId(null);
            // Optionally, scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          barcodeBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  const openRecipeModal = async (product) => {
    setRecipeProduct(product);
    const recData = await window.api.getRecipes(product.id);
    setRecipes(recData);
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    await window.api.addRecipe({
      productId: recipeProduct.id,
      ingredientId: recipeForm.ingredientId,
      quantityRequired: parseFloat(recipeForm.quantityRequired)
    }, currentUser.id);
    setRecipeForm({ ingredientId: '', quantityRequired: '' });
    const recData = await window.api.getRecipes(recipeProduct.id);
    setRecipes(recData);
  };

  const handleDeleteRecipe = async (id) => {
    await window.api.deleteRecipe(id, currentUser.id);
    const recData = await window.api.getRecipes(recipeProduct.id);
    setRecipes(recData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatMoney = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const str = val.toString().replace(/[^0-9.]/g, '');
    const parts = str.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const handleMoney = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: formatMoney(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        unitPrice: parseFloat(form.unitPrice.toString().replace(/,/g, '')) || 0,
        costPrice: parseFloat(form.costPrice.toString().replace(/,/g, '')) || 0,
        stockQuantity: parseInt(form.stockQuantity, 10) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold, 10) || 5,
        taxTyCd: form.taxTyCd || 'B',
        barcode: form.barcode || '',
        type: form.type || 'standard',
        comboItems: form.comboItems || '[]'
      };
      if (editingId) {
        await window.api.updateProduct({ ...payload, id: editingId }, currentUser?.id);
      } else {
        await window.api.addProduct(payload, currentUser?.id);
      }
      setForm(defaultProduct);
      setEditingId(null);
      loadProducts();
      showToast(editingId ? "Product updated successfully" : "Product added successfully", "success");
    } catch (err) {
      showToast("Error adding product: " + err.message, "error");
    }
  };

  const handleEdit = (prod) => {
    setForm({
      ...prod,
      unitPrice: formatMoney(prod.unitPrice),
      costPrice: formatMoney(prod.costPrice),
      stockQuantity: prod.stockQuantity || 0,
      lowStockThreshold: prod.lowStockThreshold || 5,
      taxTyCd: prod.taxTyCd || 'B',
      barcode: prod.barcode || '',
      type: prod.type || 'standard',
      comboItems: prod.comboItems || '[]'
    });
    setEditingId(prod.id);
  };

  const handleDelete = async (id) => {
    if (await askConfirm('Delete this product?')) {
      await window.api.deleteProduct(id, currentUser?.id);
      loadProducts();
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    
    const qty = parseInt(adjustForm.quantity, 10);
    if (qty <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }

    try {
      const payload = {
        productId: adjustingProduct.id,
        productName: adjustingProduct.productName,
        quantity: qty,
        type: adjustForm.type,
        reason: adjustForm.reason,
        date: new Date().toISOString().split('T')[0]
      };
      
      await window.api.addStockMovement(payload, currentUser?.id);
      
      // Mock VSDC API call for stock movement
      if (window.api && window.api.getSetting) {
        const tin = await window.api.getSetting('tin') || "999999999";
        // Dynamic import to avoid messing up regular execution if mock isn't loaded properly
        import('../utils/vsdcMock').then(module => {
          module.vsdcApi.saveStockItems({ tin, items: [payload] });
        });
      }

      setAdjustingProduct(null);
      setAdjustForm({ quantity: '', type: 'IN', reason: '' });
      loadProducts();
      showToast("Stock adjusted successfully", "success");
    } catch (err) {
      showToast("Error adjusting stock: " + err.message, "error");
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(products.map(p => ({
      'Product Name': p.productName,
      'Category': p.category,
      'Barcode': p.barcode || '',
      'Unit Price': p.unitPrice,
      'Cost Price': p.costPrice || 0,
      'Initial Stock': p.stockQuantity || 0,
      'Low Stock Alert': p.lowStockThreshold || 5,
      'Tax Category (A/B)': p.taxTyCd || 'B'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "Inventory.xlsx");
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Product Name': 'Sample Item',
      'Category': 'Drinks',
      'Barcode': '1234567890123',
      'Unit Price': 1000,
      'Cost Price': 800,
      'Initial Stock': 50,
      'Low Stock Alert': 10,
      'Tax Category (A/B)': 'B'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Inventory_Import_Template.xlsx");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!await askConfirm('This will append imported items to your database. Make sure your headers match exactly: Product Name, Category, Barcode, Unit Price, Cost Price, Initial Stock, Low Stock Alert, Tax Category (A/B). Continue?')) {
      e.target.value = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      let importedCount = 0;
      let failedCount = 0;
      for (const [index, row] of data.entries()) {
        if (!row['Product Name'] || !row['Category'] || row['Unit Price'] === undefined) {
          console.warn(`Skipping row ${index + 2} due to missing required fields.`);
          failedCount++;
          continue;
        }
        const payload = {
          productName: row['Product Name'],
          category: row['Category'],
          barcode: (row['Barcode'] || '').toString(),
          unitPrice: parseFloat(row['Unit Price']) || 0,
          costPrice: parseFloat(row['Cost Price']) || 0,
          stockQuantity: parseInt(row['Initial Stock'], 10) || 0,
          lowStockThreshold: parseInt(row['Low Stock Alert'], 10) || 5,
          taxTyCd: row['Tax Category (A/B)'] || 'B'
        };
        await window.api.addProduct(payload, currentUser?.id);
        importedCount++;
      }
      loadProducts();
      showToast(`Successfully imported ${importedCount} products! ${failedCount > 0 ? `(${failedCount} skipped due to errors)` : ''}`, "success");
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="products-mgmt">
      <div className="sales-form">
        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
            <div className="form-row">
              <label>Product Name *</label>
              <input name="productName" value={form.productName} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Barcode</label>
              <input name="barcode" value={form.barcode} onChange={handleChange} placeholder="Scan or type" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-row">
              <label>Category *</label>
              <input name="category" value={form.category} onChange={handleChange} list="cat-list" required />
              <datalist id="cat-list">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="form-row">
              <label>Product Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="standard">Standard Product</option>
                <option value="combo">Combo / Pack (Composite)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-row">
              <label>Unit Price (FRW) *</label>
              <input name="unitPrice" type="text" inputMode="numeric" value={form.unitPrice} onChange={handleMoney} required />
            </div>
            <div className="form-row">
              <label>Cost Price (FRW)</label>
              <input name="costPrice" type="text" inputMode="numeric" value={form.costPrice} onChange={handleMoney} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div className="form-row">
              <label>Initial Stock</label>
              <input name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-row">
              <label>Low Stock Threshold</label>
              <input name="lowStockThreshold" type="number" value={form.lowStockThreshold} onChange={handleChange} placeholder="5" />
            </div>
            <div className="form-row">
              <label>RRA Tax Category</label>
              <select name="taxTyCd" value={form.taxTyCd} onChange={handleChange} required>
                <option value="A">A - Exempt (0%)</option>
                <option value="B">B - 18% VAT</option>
              </select>
            </div>
          </div>

          {form.type === 'combo' && (
            <div className="form-row" style={{ gridColumn: '1 / -1', background: 'var(--bg-color)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '10px' }}>
              <label style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>Combo Items (Bill of Materials)</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-5px', marginBottom: '10px' }}>Selling this combo will automatically deduct stock of the included items below.</p>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '15px' }}>
                {JSON.parse(form.comboItems || '[]').map((item, idx) => {
                   const p = products.find(prod => prod.id === item.productId);
                   return (
                     <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--background)', marginBottom: '5px', borderRadius: '4px' }}>
                       <span>{p?.productName || 'Unknown Product'}</span>
                       <div>
                         <span style={{ fontWeight: 'bold', marginRight: '15px' }}>x {item.quantity}</span>
                         <button type="button" onClick={() => handleRemoveComboItem(item.productId)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                       </div>
                     </li>
                   );
                })}
                {JSON.parse(form.comboItems || '[]').length === 0 && (
                  <li style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '8px' }}>No items added yet.</li>
                )}
              </ul>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem' }}>Select Product to include</label>
                  <select value={comboItemForm.productId} onChange={e => setComboItemForm({...comboItemForm, productId: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <option value="">-- Choose Product --</option>
                    {products.filter(p => p.type !== 'combo').map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>Qty</label>
                  <input type="number" min="1" value={comboItemForm.quantity} onChange={e => setComboItemForm({...comboItemForm, quantity: e.target.value})} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                </div>
                <button type="button" onClick={handleAddComboItem} className="btn-secondary" style={{ padding: '8px 16px', height: 'fit-content' }}>Add to Combo</button>
              </div>
            </div>
          )}

          <div className="form-actions">
            {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultProduct); }}>Cancel</button>}
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add Product'}</button>
          </div>
        </form>
      </div>

      <div className="sales-list" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Product Catalog & Inventory</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '-15px', marginBottom: '15px', fontSize: '0.9rem' }}>
              ℹ️ Tip: You can scan a barcode anytime on this screen to instantly edit an existing item, or start adding a new one.
            </p>
          </div>
          {businessType !== 'restaurant' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={handleImport}
              />
              <button className="btn-secondary btn-sm" onClick={handleDownloadTemplate}>📄 Template</button>
              <button className="btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>📥 Import</button>
              <button className="btn-secondary btn-sm" onClick={handleExport}>📤 Export</button>
            </div>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Product Name</th>
                <th>Unit Price</th>
                <th>Cost Price</th>
                <th>Tax Cat</th>
                <th>In Stock</th>
                <th>Alert Threshold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ backgroundColor: p.stockQuantity <= 0 ? '#ffebee' : (p.stockQuantity <= (p.lowStockThreshold || 5) ? '#fff8e1' : 'transparent') }}>
                  <td><span className="badge">{p.category}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.productName}</td>
                  <td>{p.unitPrice.toLocaleString()} FRW</td>
                  <td>{p.costPrice.toLocaleString()} FRW</td>
                  <td>{p.taxTyCd === 'A' ? 'A (0%)' : 'B (18%)'}</td>
                  <td>
                    {p.stockQuantity > 0 ? (
                      p.stockQuantity <= (p.lowStockThreshold || 5) ? <span className="warning">{p.stockQuantity}</span> : <span className="interest">{p.stockQuantity}</span>
                    ) : (
                      <span className="btn-danger" style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em' }}>Out of Stock</span>
                    )}
                  </td>
                  <td>{p.lowStockThreshold || 5}</td>
                  <td className="actions">
                    {businessType === 'restaurant' && (
                      <button className="btn-sm btn-secondary" onClick={() => openRecipeModal(p)}>Recipe</button>
                    )}
                    {businessType !== 'restaurant' && (
                      <button className="btn-sm btn-secondary" onClick={() => setPrintingProduct(p)}>Label</button>
                    )}
                    <button className="btn-sm" onClick={() => setAdjustingProduct(p)}>Adjust</button>
                    <button className="btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                    {currentUser?.role === 'Admin' && (
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Del</button>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="empty">No products added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adjustingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-color)', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0 }}>Adjust Stock: {adjustingProduct.productName}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Current Stock: {adjustingProduct.stockQuantity}</p>
            <form onSubmit={handleAdjustStock}>
              <div className="form-row">
                <label>Adjustment Type</label>
                <select value={adjustForm.type} onChange={e => setAdjustForm({...adjustForm, type: e.target.value})} required>
                  <option value="IN">Stock IN (Add)</option>
                  <option value="OUT">Stock OUT (Remove/Damaged)</option>
                </select>
              </div>
              <div className="form-row">
                <label>Quantity</label>
                <input type="number" value={adjustForm.quantity} onChange={e => setAdjustForm({...adjustForm, quantity: e.target.value})} min="1" required />
              </div>
              <div className="form-row">
                <label>Reason / Notes</label>
                <input type="text" value={adjustForm.reason} onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})} placeholder="e.g. Expired, Restock, Return" required />
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setAdjustingProduct(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {recipeProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-color)', padding: '30px', borderRadius: '12px', width: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0 }}>Recipe / Bill of Materials</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Product: {recipeProduct.productName}</p>
            
            <form onSubmit={handleAddRecipe} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <label>Ingredient</label>
                <select value={recipeForm.ingredientId} onChange={e => setRecipeForm({...recipeForm, ingredientId: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <option value="">Select Raw Material</option>
                  {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} (in {ing.unit})</option>)}
                </select>
              </div>
              <div style={{ width: '120px' }}>
                <label>Qty Required</label>
                <input type="number" step="0.001" min="0.001" value={recipeForm.quantityRequired} onChange={e => setRecipeForm({...recipeForm, quantityRequired: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', height: 'fit-content' }}>Add</button>
            </form>

            <table className="cat-table" style={{ width: '100%', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Required Qty</th>
                  <th>Current Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(r => (
                  <tr key={r.id}>
                    <td>{r.ingredientName}</td>
                    <td>{r.quantityRequired} {r.unit}</td>
                    <td>{ingredients.find(i => i.id === r.ingredientId)?.stockQuantity} {r.unit}</td>
                    <td><button className="btn-sm btn-danger" onClick={() => handleDeleteRecipe(r.id)}>Del</button></td>
                  </tr>
                ))}
                {recipes.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '10px' }}>No ingredients mapped.</td></tr>
                )}
              </tbody>
            </table>

            <div style={{ textAlign: 'right' }}>
              <button className="btn-secondary" onClick={() => setRecipeProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {printingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-color)', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Print Label</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{printingProduct.productName}</p>
            
            <div style={{ padding: '20px', background: '#fff', border: '1px dashed #ccc', display: 'inline-block', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>{printingProduct.productName}</div>
              <svg ref={barcodeRef}></svg>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>{printingProduct.unitPrice.toLocaleString()} FRW</div>
            </div>

            <div className="form-row" style={{ textAlign: 'left' }}>
              <label>Number of Copies</label>
              <input type="number" min="1" max="100" value={printCopies} onChange={e => setPrintCopies(parseInt(e.target.value) || 1)} />
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setPrintingProduct(null)}>Cancel</button>
              <button className="btn-primary" onClick={confirmPrintLabel}>🖨️ Print Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
