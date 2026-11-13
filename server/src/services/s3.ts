import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.S3_BUCKET || '';

// Credentials come from the standard AWS chain: AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY env, profile, or IAM role.
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {})
});

export const s3Configured = () => !!BUCKET;

export async function putResume(key: string, body: Buffer, contentType: string) {
  if (!BUCKET) throw new Error('S3_BUCKET is not configured.');
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ServerSideEncryption: 'AES256'
  }));
}

export async function getResume(key: string): Promise<Buffer> {
  const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return Buffer.from(await out.Body!.transformToByteArray());
}

/** Short-lived download link (PRD: signed, time-limited access). */
export function signedResumeUrl(key: string, fileName: string, expiresIn = 300) {
  return getSignedUrl(s3, new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${fileName.replace(/[^\w.\- ]/g, '_')}"`
  }), { expiresIn });
}
