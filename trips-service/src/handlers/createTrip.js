import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import { respond } from "../lib/respond";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createTrip(event, context, callback) {
  const { tripName, tripStart, tripEnd } = event.body;
  const { email } = event.requestContext.authorizer.claims;
  const now = new Date();
  const id = uuid();
  let payload;
  let statusCode;

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
    payload = { message: "The start data must be after the end date" };
    statusCode = 400;
  } else {
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

      payload = trip;
      statusCode = 200;
    } catch (error) {
      payload = error;
      statusCode = 500;
    }
  }

  return respond(payload, statusCode);
}

export const handler = commonMiddleware(createTrip);
