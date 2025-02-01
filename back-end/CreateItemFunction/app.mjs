import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; // UUID library for generating unique IDs

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'ItemTable';

// Function to insert data into DynamoDB
const insertItemDataIntoDynamoDB = async (itemData) => {
  try {
    const params = {
      TableName: tableName,
      Item: itemData,
    };

    await dynamoDB.put(params).promise();
    console.log(`Inserted item data into DynamoDB: ${JSON.stringify(itemData)}`);
  } catch (error) {
    console.error('Error inserting item data into DynamoDB:', error);
    throw new Error('Failed to insert item data into DynamoDB.');
  }
};

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));

  let requestBody;

  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.item ? event : JSON.parse(event.body);
  } catch (error) {
    console.error('Invalid JSON in event or event.body:', event.body || event);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'Invalid JSON format in request body.',
      }),
    };
  }

  try {
    const { userId, item, file } = requestBody;
    // console.log(userId,budgets, typeof(budgets) === 'object')
    // Validate input
    if ( !userId || typeof(item) !== 'object' || !file ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing or invalid userId, file, or item in request body.',
        }),
      };
    }

    // Generate UUID for item and process rooms
    const itemId = uuidv4();

    const s3ImageKey = `${userId}/${file.filename}`;


    const itemData = {
      userId,
      itemId:itemId,
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      itemStatus: item.itemStatus, // lost (someone is finding this), found (someone has found a lost item), claimed (someone claimed a lost item)
      category: item.category,
      dateFound: new Date(item.dateFound).toISOString(),
      dateClaimed: item.dateClaimed != null ? new Date(item.dateClaimed).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert into DynamoDB
    await insertItemDataIntoDynamoDB(itemData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'item data successfully created and stored in DynamoDB.',
        itemData,
      }),
    };
  } catch (error) {
    console.error('Error processing item data:', error);
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
