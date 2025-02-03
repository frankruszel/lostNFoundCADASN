import ClaimItApi from "../ClaimItAPIRequest";

export const GetUserNotificationApi = async (requestBody) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await ClaimItApi.post('/user/notification/', requestBody);
   
      return response.data;
    } catch (error) {
      console.error('Error subscribing User:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };