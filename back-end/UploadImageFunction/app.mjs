import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; // UUID library for generating unique IDs

const s3 = new AWS.S3();
const bucketName = 'prod-lostnfound-store-item-images';

// Function to insert data into S3
const uploadImageToS3 = async (userId,file) => {
  try {
    let params = {
      Bucket: bucketName,
      Key: `${userId}/${file.filename}`,// key
      ContentType: 'image/jpeg',
      Body: file.content
    }
    await s3.putObject(params).promise();
    // await dynamoDB.put(params).promise();
    console.log(`Uploaded image to S3`);
  } catch (error) {
    console.error('Error inserting item data into S3:', error);
    throw new Error('Failed to insert item data into S3.');
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
    const { userId, file } = requestBody;
    // console.log(userId,budgets, typeof(budgets) === 'object')
    // Validate input
    if ( !userId || !file ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing or invalid userId, file, or item in request body.',
        }),
      };
    }

  
    // Upload into S3
    await uploadImageToS3(userId,file);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      },
      body: JSON.stringify({
        message: 'item data successfully created and stored in S3.',
        itemData,
      }),
    };
  } catch (error) {
    console.error('Error processing item data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while processing the request.',
        error: error.message,
      }),
    };
  }
};
