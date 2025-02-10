import ClaimItApi from "../ClaimItAPIRequest";

export const GetItemApi = async (userId_CreatedBy, itemId) => {
    try {
        let response 
        if (!userId_CreatedBy && !itemId) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/`);
        }
        if (itemId && !userId_CreatedBy) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/?itemId=${itemId}`);
        }
        if (userId_CreatedBy && !itemId) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/?userId_CreatedBy=${userId_CreatedBy}`);
        }
        if (itemId && userId_CreatedBy) {
            response = await ClaimItApi.get(`/Item/RetrieveItem/?userId_CreatedBy=${userId_CreatedBy}&itemId=${itemId}`);
        }
        // Return the successful response
        return response.data;
    } catch (error) {
        console.error('Error getting Item:', error);
        // Re-throw the error for higher-level handling
        throw error;
    }
};