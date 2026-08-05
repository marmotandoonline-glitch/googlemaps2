import AWS from 'aws-sdk';

const endpoint = process.env.S3_ENDPOINT || undefined;
const region = process.env.S3_REGION || 'us-east-1';

const s3 = new AWS.S3({
  endpoint,
  region,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

export async function createPresignedPutUrl(bucket: string, key: string, contentType: string, expiresSeconds = 3600) {
  const params = {
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    Expires: expiresSeconds,
  } as any;

  const url = await s3.getSignedUrlPromise('putObject', params);
  return url;
}

export function makeKey(leadId: string, filename: string) {
  const id = Date.now();
  return `leads/${leadId}/${id}-${filename}`;
}
