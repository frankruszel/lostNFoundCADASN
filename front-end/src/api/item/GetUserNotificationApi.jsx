import ClaimItApi from "../ClaimItAPIRequest";

export const GetUserNotificationApi = async (userId) => {
    try {
  
      // Make the POST request using the APIRequest class
      const response = await ClaimItApi.get(`/user/getNotification/?userId=${userId}`, );
   
      return response.data;
    } catch (error) {
      console.error('Error getting User notification:', error);
      // Re-throw the error for higher-level handling
      throw error;
    }
  };