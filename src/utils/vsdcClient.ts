export const vsdcApi = {
  getVsdcUrl() {
    return localStorage.getItem('vsdcUrl') || 'http://localhost:8080';
  },

  async saveSales(requestBody) {
    const url = `${this.getVsdcUrl()}/trnsSales/saveSales`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.warn("VSDC API responded with error:", response.status, response.statusText);
        // Fallback for demo mode if real VSDC isn't connected
        throw new Error(`VSDC error: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.error("VSDC connection failed:", e);
      throw e;
    }
  },

  async saveStockItems(requestBody) {
    const url = `${this.getVsdcUrl()}/saveStockItems/saveStockItems`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`VSDC error: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.error("VSDC connection failed:", e);
      throw e;
    }
  }
};
