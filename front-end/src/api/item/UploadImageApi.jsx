import ClaimItApi from "../ClaimItAPIRequest";

export const UploadImageApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await ClaimItApi.post('/Image', requestBody);
   
      return response.data;
    } catch (error) {
      console.error('Error uploading Image', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };