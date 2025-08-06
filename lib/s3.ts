import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export class S3Service {
  private bucketName = process.env.AWS_S3_BUCKET_NAME!

  async uploadFile(file: File, key: string): Promise<string> {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      })

      await s3Client.send(command)
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    } catch (error) {
      console.error("Error uploading file:", error)
      throw new Error("Failed to upload file")
    }
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      return await getSignedUrl(s3Client, command, { expiresIn })
    } catch (error) {
      console.error("Error generating signed URL:", error)
      throw new Error("Failed to generate download URL")
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      await s3Client.send(command)
    } catch (error) {
      console.error("Error deleting file:", error)
      throw new Error("Failed to delete file")
    }
  }

  generateFileKey(userId: string, caseId: string, filename: string): string {
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    return `documents/${userId}/${caseId}/${timestamp}_${sanitizedFilename}`
  }
}
