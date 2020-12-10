import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { respond } from "../lib/respond";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function listTrips(event, context) {
  let trips;
  let payload;
  let statusCode;
  const { email } = event.requestContext.authorizer.claims;
  const params = {
    TableName: process.env.TRIP_TABLE_NAME,
    IndexName: "createdByIndex",
    KeyConditionExpression: "#createdBy = :createdBy",
    ExpressionAttributeValues: {
      ":createdBy": email,
    },
    ExpressionAttributeNames: {
      "#createdBy": "createdBy",
    },
  };
  try {
    const results = await dynamodb.query(params).promise();
    trips = results.Items;
    payload = trips;
    statusCode = 200;
  } catch (error) {
    payload = error;
    statusCode = 500;
  }

  return respond(payload, statusCode);
}

export const handler = commonMiddleware(listTrips);
