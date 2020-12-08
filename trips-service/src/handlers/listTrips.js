import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function listTrips(event, context) {
  let trips;
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
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(trips),
  };
}

export const handler = commonMiddleware(listTrips);
