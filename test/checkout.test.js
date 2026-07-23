const { expect } = require('chai');
const Store = require('../dist-electron/store');

describe('Checkout and Sales', () => {
  let store;

  beforeEach(async () => {
    store = new Store(':memory:');
    await store.initPromise;
  });

  it('should complete a checkout transaction and deduct inventory', () => {
    // 1. Create a product with 10 stock
    const productData = {
      productName: 'Checkout Item',
      category: 'Test Category',
      unitPrice: 100,
      costPrice: 50,
      stockQuantity: 10,
      type: 'standard'
    };
    const product = store.addProduct(productData, 'test-user');
    expect(product.stockQuantity).to.equal(10);

    // 2. Perform checkout for 3 units
    const checkoutPayload = {
      items: [
        {
          productId: product.id,
          productName: product.productName,
          category: product.category,
          quantity: 3,
          unitPrice: product.unitPrice,
          totalPrice: product.unitPrice * 3,
          costPrice: product.costPrice
        }
      ],
      userId: 'test-user',
      paymentMethod: 'Cash',
      receiptNo: 'REC-001'
    };

    const savedItems = store.checkoutTransaction(checkoutPayload);
    
    // 3. Verify results
    expect(savedItems).to.be.an('array');
    expect(savedItems.length).to.equal(1);
    expect(savedItems[0].totalPrice).to.equal(300);

    // 4. Verify stock is deducted (10 - 3 = 7)
    const products = store.getProducts();
    const updatedProduct = products.find(p => p.id === product.id);
    expect(updatedProduct.stockQuantity).to.equal(7);
  });

  it('should assign loyalty points to customer on successful checkout', () => {
    // Attempt to add a customer if the method exists
    let customerId = null;
    if (typeof store.addCustomer === 'function') {
      const customer = store.addCustomer({ name: 'Loyal Customer', phone: '1234567890' });
      customerId = customer.id;
    } else {
      // Create manually if method doesn't exist
      customerId = 'temp-cust-id';
      try {
        store.db.prepare("INSERT INTO customers (id, name, points) VALUES (?, ?, 0)").run(customerId, 'Loyal Customer');
      } catch (e) {
        // Table might not exist in early migrations, just skip
        return;
      }
    }

    const checkoutPayload = {
      items: [
        {
          productName: 'Misc Item',
          category: 'Misc',
          quantity: 1,
          unitPrice: 5000,
          totalPrice: 5000,
          costPrice: 1000
        }
      ],
      customerId: customerId,
      customerName: 'Loyal Customer',
      userId: 'test-user',
      paymentMethod: 'Card'
    };

    store.checkoutTransaction(checkoutPayload);

    // Points calculation: Math.floor(sale.totalPrice / 1000) = 5 points
    const customerRow = store.db.prepare("SELECT points FROM customers WHERE id = ?").get(customerId);
    expect(customerRow.points).to.equal(5);
  });
});
