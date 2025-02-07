import ClaimItApi from "../ClaimItAPIRequest";

export const GetItemApi = async (userId, itemId) => {
    try {
        let response 
        if (!userId && !itemId) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/`);
        }
        if (itemId && !userId) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/?itemId=${itemId}`);
        }
        if (userId && !itemId) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/?userId=${userId}`);
        }
        if (itemId && userId) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/?userId=${userId}&itemId=${itemId}`);
        }
        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting Item:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};