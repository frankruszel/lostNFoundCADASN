import ClaimItApi from "../ClaimItAPIRequest";

export const GetItemApi = async (userId, itemId) => {
    try {
        let response = await ClaimItApi.get(`/Item/RetrieveItem/`);
        if (userId) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/?userId=${userId}`);
        }
        if (itemId) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/?userId=${userId}&itemId=${itemId}`);
        }
        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting Preference:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};