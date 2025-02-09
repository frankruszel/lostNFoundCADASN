import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const sns = new AWS.SNS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'ItemTable';

// Function to update data in DynamoDB
const updateItemDataInDynamoDB = async (itemId, userId_UpdatedBy, updatedData) => {
  try {
    const params = {
      TableName: tableName,
      Key: { itemId },
      UpdateExpression: `
        SET 
          itemStatus = :itemStatus,
          updatedAt = :updatedAt
      `,
      ExpressionAttributeValues: {
        ':itemStatus': updatedData.itemStatus,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW', // Returns the updated item
    };
    if (updatedData.userId_HandledClaim) {
      params.UpdateExpression += ', userId_HandledClaim = :userId_HandledClaim';
      params.ExpressionAttributeValues[':userId_HandledClaim'] = updatedData.userId_HandledClaim;
    }
    if (updatedData.userId_UpdatedBy) {
      params.UpdateExpression += ', userId_UpdatedBy = :userId_UpdatedBy';
      params.ExpressionAttributeValues[':userId_UpdatedBy'] = updatedData.userId_UpdatedBy;
    }
    if (updatedData.title) {
      params.UpdateExpression += ', title = :title';
      params.ExpressionAttributeValues[':title'] = updatedData.title;
    }
    if (updatedData.description) {
      params.UpdateExpression += ', description = :description';
      params.ExpressionAttributeValues[':description'] = updatedData.description;
    }
    if (updatedData.image_url) {
      params.UpdateExpression += ', image_url = :image_url';
      params.ExpressionAttributeValues[':image_url'] = updatedData.image_url;
    }
    if (updatedData.category) {
      params.UpdateExpression += ', category = :category';
      params.ExpressionAttributeValues[':category'] = updatedData.category;
    }


    console.log("DynamoDB Update Params:", JSON.stringify(params, null, 2));

    const result = await dynamoDB.update(params).promise();
    console.log(`Updated Item data in DynamoDB: ${JSON.stringify(result.Attributes)}`);
    return result.Attributes;
  } catch (error) {
    console.error('Error updating Item data in DynamoDB:', error);
    throw new Error('Failed to update Item data in DynamoDB.');
  }
};



export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Lambda context:', JSON.stringify(context, null, 2));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.itemId ? event : JSON.parse(event.body);
  } catch (error) {
    console.error('Invalid JSON in event or event.body:', event.body || event);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Invalid JSON format in request body.',
      }),
    };
  }

  try {
    const { itemId, userId_UpdatedBy,userId_HandledClaim, category, description, image_url, title, itemStatus, dateFound } = requestBody;

    // Validate input
    // if (!itemId || !itemStatus ) {
    //   return {
    //     statusCode: 400,
    //     headers: {
    //       "Access-Control-Allow-Origin": "*", 
    //       "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
    //       "Access-Control-Allow-Headers": "Content-Type, Authorization", 
    //     },
    //     body: JSON.stringify({
    //       message: 'Missing or invalid itemid,itemStatus in request body.',
    //     }),
    //   };
    // }
    let dateClaimed = null
    if ("dateClaimed" in requestBody) {
      let dateClaimed = requestBody.dateClaimed;
    }

    // Process budgets data
    const updatedData = {
      "itemId": itemId,
      "userId_UpdatedBy": userId_UpdatedBy != null ? userId_UpdatedBy : null,
      "userId_HandledClaim": userId_HandledClaim != null ? userId_HandledClaim : null,
      "title": title,
      "description": description,
      "image_url": image_url,
      "itemStatus": itemStatus,
      "category": category,
      "dateFound": dateFound != null ? new Date(dateFound).toISOString() : null,
      "dateClaimed": dateClaimed != null ? new Date(dateClaimed).toISOString() : null,
    };

    console.log("itemStatus")
    console.log(itemStatus)

    // Update DynamoDB
    const updatedItem = await updateItemDataInDynamoDB(itemId, userId_UpdatedBy, updatedData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Item data successfully updated in DynamoDB.',
        updatedData: updatedItem,
      }),
    };
  } catch (error) {
    console.error('Error updating Item data:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST,PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
