import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getTripById } from "./getTrip";
import { deletePictureFromS3 } from "../lib/deletePictureFromS3";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import { v4 as uuid } from "uuid";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function updateTrip(event, context) {
  const { id } = event.pathParameters;
  const trip = await getTripById(id);
  const updatedTrip = { ...trip };
  console.log(event.body);
  try {
    //Update image
    if (event.body.coverImage) {
      if (
        trip.coverImage !==
        "https://trips-bucket-sdlkhfwijdn12-dev.s3.eu-west-2.amazonaws.com/defaultCoverImage.png"
      ) {
        await deletePictureFromS3(trip.coverImage);
      }
      const base64 = event.body.coverImage.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const imageId = uuid();
      const buffer = Buffer.from(base64, "base64");
      updatedTrip.coverImage = await uploadPictureToS3(
        imageId + ".jpg",
        buffer
      );
    }
    //Update title
    if (event.body.tripName) {
      updatedTrip.tripName = event.body.tripName;
    }
    //Update tripStart
    if (event.body.tripStart) {
      updatedTrip.tripStart = event.body.tripStart;
    }
    //Update tripEnd
    if (event.body.tripEnd) {
      updatedTrip.tripEnd = event.body.tripEnd;
    }
    //Update description
    if (event.body.description) {
      updatedTrip.description = event.body.description;
    }

    await dynamodb
      .put({
        TableName: process.env.TRIP_TABLE_NAME,
        Item: updatedTrip,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(updatedTrip),
  };
}

export const handler = commonMiddleware(updateTrip);
