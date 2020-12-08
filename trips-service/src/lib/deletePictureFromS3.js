import AWS from "aws-sdk";

const s3 = new AWS.S3();

export async function deletePictureFromS3(url) {
  const key = url.split("/")[3];
  s3.deleteObject({
    Bucket: process.env.TRIPS_BUCKET_NAME,
    Key: key,
  }).promise();
}
