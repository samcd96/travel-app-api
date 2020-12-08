import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getTripById(id) {
  let trip;
  try {
    const result = await dynamodb
      .get({
        TableName: process.env.TRIP_TABLE_NAME,
        Key: { id },
      })
      .promise();

    trip = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!trip) {
    throw new createError.NotFound(`Trip with ID "${id}" not found!`);
  }

  return trip;
}

async function getTrip(event, context) {
  const { id } = event.pathParameters;
  const trip = await getTripById(id);
  return {
    statusCode: 200,
    body: JSON.stringify(trip),
  };
}

export const handler = commonMiddleware(getTrip);
