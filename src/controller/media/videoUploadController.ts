import { Request, Response } from "express";
import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { randomUUID } from "crypto";
import { AppError } from "../../errors/appError";

const account = process.env.AZURE_STORAGE_ACCOUNT!;
const key = process.env.AZURE_STORAGE_KEY!;
const containerName = "videos";

const credential = new StorageSharedKeyCredential(account, key);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  credential
);

// POST /media/videos/upload-url
export const generateVideoUploadUrl = async (req: Request, res: Response) => {
  const { contentType, extension } = req.body;

  if (!contentType || !extension) {
    throw new AppError("contentType and extension are required", 400);
  }

  const fileName = `${randomUUID()}.${extension}`;
  const blobPath = `uploads/${fileName}`;

  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  const blobClient = containerClient.getBlockBlobClient(blobPath);

  // Short lived SAS (15 minutes)
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: blobPath,
      permissions: BlobSASPermissions.parse("cw"), // create + write
      expiresOn: new Date(Date.now() + 15 * 60 * 1000),
      contentType,
    },
    credential
  ).toString();

  res.status(200).json({
    uploadUrl: `${blobClient.url}?${sasToken}`,
    video_url: blobClient.url, // permanent URL (no SAS)
  });
};
