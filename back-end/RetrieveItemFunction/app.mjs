import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'ItemTable';

// Function to query data from DynamoDB, now with conditional query based on uuid
const scanItemDataFromDynamoDB = async ( itemId, userId_CreatedBy ) => {
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
  if (userId_CreatedBy) {
    if ("FilterExpression" in params){
      params.FilterExpression += ' AND userId_CreatedBy = :userId_CreatedBy';
    }else{
      params.FilterExpression = 'userId_CreatedBy = :userId_CreatedBy';
    }
    params.ExpressionAttributeValues[':userId_CreatedBy'] = userId_CreatedBy;

  }

    const result = await dynamoDB.scan(params).promise();
    console.log(`Scanned data: ${result}`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying Item data from DynamoDB:', error);
    throw new Error('Failed to query Item data from DynamoDB.');
  }
};


const queryItemDataFromDynamoDB = async (itemId) => {
  try {
    let params = {
      TableName: tableName,
      KeyConditionExpression: 'itemId = :itemId', // Query only by userId_CreatedBy initially
      ExpressionAttributeValues: {
        ':itemId': itemId,
      },
    };

    const result = await dynamoDB.query(params).promise();
    console.log(`Queried item data for itemId: ${itemId} w`);
    return result.Items || [];
  } catch (error) {
    console.error('Error querying item data from DynamoDB:', error);
    throw new Error('Failed to query item data from DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  try {
    // Extract userId_CreatedBy and uuid from query parameters
    const userId_CreatedBy = event.queryStringParameters && event.queryStringParameters.userId_CreatedBy ? event.queryStringParameters.userId_CreatedBy : null;
    const itemId = event.queryStringParameters && event.queryStringParameters.itemId ? event.queryStringParameters.itemId : null;

    // Query DynamoDB for Item data with or without uuid based on its presence
    let ItemData
    if (!userId_CreatedBy && itemId){
      ItemData = await queryItemDataFromDynamoDB(itemId);
    }
    else {
      ItemData = await scanItemDataFromDynamoDB(itemId, userId_CreatedBy);
    }
    

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
          message: 'Item data not found for the specified userId_CreatedBy and/or uuid.',
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
