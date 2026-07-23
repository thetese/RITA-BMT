const { expect } = require('chai');
const Store = require('../dist-electron/store');

describe('Store', () => {
  let store;

  beforeEach(async () => {
    store = new Store(':memory:');
    await store.init();
  });

  it('should create a new store instance', () => {
    expect(store).to.not.be.undefined;
    expect(store.db).to.not.be.undefined;
  });

  it('should add and retrieve a product', () => {
    const productData = {
      productName: 'Test Product',
      category: 'Beverages',
      unitPrice: 15.5,
      costPrice: 5.0,
      stockQuantity: 10
    };

    const newProduct = store.addProduct(productData, 'user-1');
    expect(newProduct).to.have.property('id');
    expect(newProduct.productName).to.equal('Test Product');

    const products = store.getProducts();
    expect(products.length).to.equal(1);
    expect(products[0].productName).to.equal('Test Product');
    expect(products[0].unitPrice).to.equal(15.5);
  });

  it('should update a product', () => {
    const productData = {
      productName: 'Test Product 2',
      category: 'Food',
      unitPrice: 10
    };

    const newProduct = store.addProduct(productData, 'user-1');
    
    // Update it
    const success = store.updateProduct({ ...newProduct, unitPrice: 20 }, 'user-1');
    expect(success).to.be.true;

    const products = store.getProducts();
    expect(products[0].unitPrice).to.equal(20);
  });
});
