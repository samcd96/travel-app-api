import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createTrip(event, context) {
  const { tripName, tripStart, tripEnd } = event.body;
  const { email } = event.requestContext.authorizer.claims;
  const now = new Date();
  const id = uuid();

  const trip = {
    id,
    tripName,
    createdAt: now.toISOString(),
    createdBy: email,
    description: "",
    images: [],
    tripStart,
    tripEnd,
  };

  let coverImage =
    "https://trips-bucket-sdlkhfwijdn12-dev.s3.eu-west-2.amazonaws.com/defaultCoverImage.png";

  if (tripStart > tripEnd) {
    throw createError.Forbidden(`The start date must be after the end date`);
  }

  try {
    if (event.body.coverImage) {
      const base64 = event.body.coverImage.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const imageId = uuid();
      const buffer = Buffer.from(base64, "base64");
      coverImage = await uploadPictureToS3(imageId + ".jpg", buffer);
    }

    trip.coverImage = coverImage;

    await dynamodb
      .put({
        TableName: process.env.TRIP_TABLE_NAME,
        Item: trip,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(trip),
  };
}

export const handler = commonMiddleware(createTrip);
