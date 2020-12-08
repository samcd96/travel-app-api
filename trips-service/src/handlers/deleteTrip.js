import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getTripById } from "./getTrip";
import { deletePictureFromS3 } from "../lib/deletePictureFromS3";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function deleteTrip(event, context) {
  const { id } = event.pathParameters;
  const trip = await getTripById(id);
  try {
    if (
      trip.coverImage !==
      "https://trips-bucket-sdlkhfwijdn12-dev.s3.eu-west-2.amazonaws.com/defaultCoverImage.png"
    ) {
      await deletePictureFromS3(trip.coverImage);
    }

    await dynamodb
      .delete({
        TableName: process.env.TRIP_TABLE_NAME,
        Key: {
          id: trip.id,
        },
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 200,
    body: "Item Deleted",
  };
}

export const handler = commonMiddleware(deleteTrip);
