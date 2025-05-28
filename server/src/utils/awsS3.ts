// utils/awsS3.ts
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

export const uploadToS3 = (file: Express.Multer.File) => {
  const fileExtension = file.originalname.split(".").pop();
  const filename = `${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.BUCKET_NAME!,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise();
};
