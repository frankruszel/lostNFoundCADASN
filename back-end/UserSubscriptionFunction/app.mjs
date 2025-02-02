import { SubscribeCommand, SNSClient } from "@aws-sdk/client-sns";

const client = new SNSClient({});

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));
  const topicArn = process.env.TopicArn

  let requestBody;
  // user save button then this function is called
  // request will be list = [cat1,cat2,cat3] (notificationSubList)
  // based on the list, MAKE A FILTER policy
  // then finally subscribe the user's email to the topic
  // check if list is in req

  // then call funciton
  try {
    // Use event directly if it's already an object, otherwise parse event.body
    requestBody = typeof event === 'object' && event.notificationSubList ? event : JSON.parse(event.body);
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
    const { notificationSubList, email } = requestBody;
    // console.log(userId,budgets, typeof(budgets) === 'object')
    // Validate input
    if ( !notificationSubList || !email ) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization", 
        },
        body: JSON.stringify({
          message: 'Missing or invalid notificationSubList or email in request body.',
        }),
      };
    }
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: "email",
      Endpoint: email,
      Attributes: {
        // This subscription will only receive messages with the 'event' attribute set to 'order_placed'.
        FilterPolicyScope: "MessageAttributes",
        FilterPolicy: JSON.stringify({
          category: notificationSubList,
        }),
      },
    });

    const response = await client.send(command);

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
