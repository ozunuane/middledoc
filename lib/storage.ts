import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { readFile, writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'middledoc'
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local'
const LOCAL_UPLOAD_DIR = process.env.FILE_UPLOAD_DIR || './uploads'

const s3 = R2_ACCOUNT_ID ? new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
}) : null

function useR2(): boolean {
  return STORAGE_PROVIDER === 'r2' && !!s3
}

export async function uploadFile(key: string, data: Buffer, contentType?: string): Promise<void> {
  if (useR2()) {
    await s3!.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: data,
      ContentType: contentType || 'application/octet-stream',
    }))
  } else {
    const filePath = path.join(LOCAL_UPLOAD_DIR, key)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, data)
  }
}

export async function downloadFile(key: string): Promise<Buffer> {
  if (useR2()) {
    const response = await s3!.send(new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }))
    const stream = response.Body
    const chunks: Buffer[] = []
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  } else {
    return readFile(path.join(LOCAL_UPLOAD_DIR, key))
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (useR2()) {
    await s3!.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }))
  } else {
    try {
      await unlink(path.join(LOCAL_UPLOAD_DIR, key))
    } catch {
      // File may not exist
    }
  }
}

export async function deleteFiles(keys: string[]): Promise<void> {
  for (const key of keys) {
    await deleteFile(key)
  }
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 300): Promise<string | null> {
  if (!useR2()) return null
  return getSignedUrl(s3!, new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  }), { expiresIn })
}

export function filePathToKey(filePath: string): string {
  return filePath
    .replace(/^\/app\/uploads\/?/, '')
    .replace(LOCAL_UPLOAD_DIR, '')
    .replace(/^\/+/, '')
}

export function keyToFilePath(key: string): string {
  return path.join(LOCAL_UPLOAD_DIR, key)
}

export function isR2Configured(): boolean {
  return useR2()
}

export { LOCAL_UPLOAD_DIR }
