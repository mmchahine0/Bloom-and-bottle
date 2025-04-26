import { S3 } from "aws-sdk";
import { PutObjectRequest, ManagedUpload } from "aws-sdk/clients/s3";

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const s3: S3 = new AWS.S3();

const uploadToS3 = async (params: PutObjectRequest): Promise<string> => {
  return new Promise((resolve, reject) => {
    s3.upload(params, (error: Error | null, data: ManagedUpload.SendData) => {
      if (error) reject(error);
      resolve(data.Location);
    });
  });
};

module.exports = {
  uploadToS3,
};
