import { SubscribeCommand, SNSClient, ListSubscriptionsByTopicCommand, UnsubscribeCommand   } from "@aws-sdk/client-sns";

const client = new SNSClient({});

export const lambdaHandler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Lambda context:', JSON.stringify(context));
  const topicArn = process.env.TopicArn

  let requestBody;

  
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
    if (!notificationSubList || !email) {
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
    var checkSubscribeParams = {
      TopicArn: topicArn, /* required */
    };
    const checkSubscription = await client.send(
      new ListSubscriptionsByTopicCommand({ TopicArn: topicArn }),
    );
    if (checkSubscription.Subscriptions.length > 0 ) {
      // create a new topic
      for (let i = 0; i < checkSubscription.Subscriptions.length; i++) {
        if (checkSubscription.Subscriptions[i].Endpoint === email) {
          let SubscriptionArn = checkSubscription.Subscriptions[i].SubscriptionArn
          let command = new UnsubscribeCommand({ // UnsubscribeInput
            SubscriptionArn: SubscriptionArn, // required
          });
          let response = await client.send(command);
        }
      }
    }

    if (notificationSubList.length > 0) {
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
    }



    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        message: 'item data successfully created and stored in DynamoDB.',
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
