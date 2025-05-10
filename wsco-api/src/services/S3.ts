// utils/awsUpload.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config();

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY as string
  }
});

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const key = `uploads/${Date.now()}_${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });

try {
  await s3.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;
} catch (err) {
  console.error('S3 upload failed:', err);
  throw new Error('Upload to S3 failed');
}
}
