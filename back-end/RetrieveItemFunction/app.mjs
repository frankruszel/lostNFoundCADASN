import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'ItemTable';

// Function to query data from DynamoDB, now with conditional query based on uuid
const scanItemDataFromDynamoDB = async ( itemId, userId ) => {
  try {
    let params = {
      TableName: tableName,
      // // FilterExpression: '#cat = :cat',
      // ExpressionAttributeNames: {
      //     '#cat': 'category',
      // },
      // ExpressionAttributeValues: {
      //     ':cat': category,
      // },
  };
  if (itemId) {
    params.FilterExpression = 'itemId = :itemId';
    params.ExpressionAttributeValues[':itemId'] = itemId;
  }
  if (userId) {
    if ("FilterExpression" in params){
      params.FilterExpression += ' AND userId = :userId';
    }
    params.ExpressionAttributeValues[':userId'] = userId;

  }

    const result = await dynamoDB.scan(params).promise();
    console.log(`Scanned data: ${result}`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying Preference data from DynamoDB:', error);
    throw new Error('Failed to query Preference data from DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  try {
    // Extract userId and uuid from query parameters
    const userId = event.queryStringParameters && event.queryStringParameters.userId ? event.queryStringParameters.userId : null;
    const itemId = event.queryStringParameters && event.queryStringParameters.itemId ? event.queryStringParameters.itemId : null;

    // Query DynamoDB for Preference data with or without uuid based on its presence
    const ItemData = await scanItemDataFromDynamoDB(itemId, userId);

    // Ensure that at least one item is returned
    if (ItemData.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Preference data not found for the specified userId and/or uuid.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Item data successfully retrieved.',
        data: ItemData, // Return the queried data (whether 1 or more items)
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
