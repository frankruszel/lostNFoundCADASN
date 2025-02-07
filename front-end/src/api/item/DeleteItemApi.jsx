import ClaimItApi from "../ClaimItAPIRequest";

export const DeleteItemApi = async (itemId) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await ClaimItApi.delete(`/Item/DeleteItem/?itemId=${itemId}`);
   
      return response.data;
    } catch (error) {
      console.error('Error deleting Item:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };