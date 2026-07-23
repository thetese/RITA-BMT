/**
 * VSDC Mock Service
 * This perfectly emulates the actual RRA VSDC API based on the specification document (v1.0.4).
 * When the real VSDC is available at http://localhost:8080, replace this mock with a real fetch call.
 */

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const vsdcApi = {
  /**
   * Mocks POST /trnsSales/saveSales
   * Page 40-44 of VSDC Specification Document
   */
  async saveSales(requestBody) {
    console.log("Mock VSDC received request:", requestBody);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate Mock Certified Data
    const rcptNo = Math.floor(Math.random() * 10000);
    const intrlData = generateRandomString(24);
    const rcptSign = generateRandomString(20);
    
    // Using a fake SDC ID and MRC No
    const sdcId = "SDC007000001";
    const mrcNo = "WIS01000101";

    const responseDate = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

    const mockResponse = {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: responseDate,
      data: {
        rcptNo: rcptNo,
        intrlData: intrlData,
        rcptSign: rcptSign,
        totRcptNo: rcptNo,
        vsdcRcptPbctDate: responseDate,
        sdcId: sdcId,
        mrcNo: mrcNo
      }
    };

    console.log("Mock VSDC returning response:", mockResponse);
    return mockResponse;
  }
};
