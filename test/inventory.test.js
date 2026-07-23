const { expect } = require('chai');
const Store = require('../dist-electron/store');

describe('Inventory Management', () => {
  let store;

  beforeEach(async () => {
    store = new Store(':memory:');
    await store.initPromise;
  });

  it('should accurately set and retrieve stock quantities', () => {
    const productData = {
      productName: 'Inventory Item A',
      category: 'Test Category',
      unitPrice: 100,
      costPrice: 50,
      stockQuantity: 500,
      type: 'standard'
    };

    const added = store.addProduct(productData, 'test-user');
    expect(added.stockQuantity).to.equal(500);

    const products = store.getProducts();
    const fetched = products.find(p => p.id === added.id);
    expect(fetched.stockQuantity).to.equal(500);
  });

  it('should update stock quantity successfully', () => {
    const productData = {
      productName: 'Inventory Item B',
      category: 'Test Category',
      unitPrice: 50,
      costPrice: 20,
      stockQuantity: 10,
      type: 'standard'
    };

    const added = store.addProduct(productData, 'test-user');
    
    // Update stock
    const success = store.updateProduct({ ...added, stockQuantity: 15 }, 'test-user');
    expect(success).to.be.true;

    const products = store.getProducts();
    const fetched = products.find(p => p.id === added.id);
    expect(fetched.stockQuantity).to.equal(15);
  });

  it('should handle negative stock (if allowed by business logic)', () => {
    const productData = {
      productName: 'Inventory Item C',
      category: 'Test Category',
      unitPrice: 50,
      stockQuantity: 5,
      type: 'standard'
    };

    const added = store.addProduct(productData, 'test-user');
    
    // Simulate stock going negative (e.g., manual override or backorder)
    store.updateProduct({ ...added, stockQuantity: -2 }, 'test-user');

    const products = store.getProducts();
    const fetched = products.find(p => p.id === added.id);
    expect(fetched.stockQuantity).to.equal(-2);
  });
});
