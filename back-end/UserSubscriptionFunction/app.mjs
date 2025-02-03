import { SubscribeCommand, SNSClient, ListSubscriptionsByTopicCommand, UnsubscribeCommand } from "@aws-sdk/client-sns";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const client = new SNSClient({});
const tableName = "NotificationTable"


const updateNotificationSublistData = async (userId, notificationSubList) => {
  try {
    let notificationSublistCommand = new PutCommand({
      TableName: tableName,
      Item: {
        userId: userId, //primary keu
        notificationSubList: notificationSubList,
      },
    });
    const response = await ddbDocClient.send(notificationSublistCommand);
    return response;
  } catch (error) {
    console.error('Error updating notification preference data in DynamoDB:', error);
    throw new Error('Failed to update notification preference data in DynamoDB.');
  }
};


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
    requestBody = typeof event === 'object' && event.body ? JSON.parse(event.body) : event;
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
    const { notificationSubList, email, userId } = requestBody;
    console.log(`requestBody`)
    console.log(requestBody)
    // console.log(userId,budgets, typeof(budgets) === 'object')
    // Validate input
    if (!notificationSubList || !email || !userId) {
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
    if (checkSubscription.Subscriptions.length > 0) {
      // create a new topic
      console.log(`checkSubscription.Subscriptions`)
      console.log(checkSubscription.Subscriptions)
      for (let i = 0; i < checkSubscription.Subscriptions.length; i++) {
        if (checkSubscription.Subscriptions[i].Endpoint === email) {
          let SubscriptionArn = checkSubscription.Subscriptions[i].SubscriptionArn
          if (SubscriptionArn === 'PendingConfirmation') {
            throw new Error('Failed to update subscription as confirmation is pending data in DynamoDB.');
          }else {
            let command = new UnsubscribeCommand({ // UnsubscribeInput
              SubscriptionArn: SubscriptionArn, // required
            });
            let response = await client.send(command);
          }
          
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

    //update the data in dynamodb
    try {
      await updateNotificationSublistData(userId, notificationSubList) //once notificaiton updated THEN update dynamoidb
    } catch (error) {
      console.error('Error updating notification preference data in DynamoDB:', error);
      throw new Error('Failed to update notification preference data in DynamoDB.');
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
