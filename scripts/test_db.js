const Store = require('./electron/store.js');
const { app } = require('electron');

// Mock app.getPath
app.getPath = () => __dirname;

try {
  const store = new Store();
  console.log("Store initialized.");
  const product = store.addProduct({
    productName: 'Test Product',
    category: 'Test Category',
    unitPrice: 1000,
    costPrice: 500
  });
  console.log("Added product:", product);
  const products = store.getProducts();
  console.log("All products:", products);
} catch (e) {
  console.error("Error:", e);
}
