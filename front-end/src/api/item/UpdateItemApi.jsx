import ClaimItApi from "../ClaimItAPIRequest";

export const UpdateItemApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await ClaimItApi.put('/Item/UpdateItem', requestBody);
   
      return response.data;
    } catch (error) {
      console.error('Error updating Item:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };