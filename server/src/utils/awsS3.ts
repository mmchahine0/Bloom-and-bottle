// utils/awsS3.ts
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

export const uploadToS3 = async (file: Express.Multer.File) => {
  const fileExtension = file.originalname.split(".").pop();
  const filename = `${uuidv4()}.jpeg`;

  // Resize and compress image using sharp
  let processedBuffer = file.buffer;
  try {
    processedBuffer = await sharp(file.buffer)
      .resize({ width: 1000 }) // max width, adjust as needed
      .jpeg({ quality: 80 })   // compress to JPEG, adjust quality as needed
      .toBuffer();
  } catch (err) {
    console.error("Image processing error:", err);
    // fallback: use original buffer
  }

  const params = {
    Bucket: process.env.BUCKET_NAME!,
    Key: filename,
    Body: processedBuffer,
    ContentType: "image/jpeg", // set to jpeg since we convert
  };

  return s3.upload(params).promise();
};
