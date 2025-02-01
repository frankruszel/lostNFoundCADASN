import ClaimItApiData from "../ClaimItAPIRequestData";

export const UploadImageApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await ClaimItApiData.post('/Image', requestBody);
   
      return response.data;
    } catch (error) {
      console.error('Error uploading Image', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };