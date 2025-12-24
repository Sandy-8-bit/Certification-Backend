import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { randomUUID } from "crypto";

const account = process.env.AZURE_STORAGE_ACCOUNT!;
const key = process.env.AZURE_STORAGE_KEY!;

const connectionString = `DefaultEndpointsProtocol=https;AccountName=${account};AccountKey=${key};EndpointSuffix=core.windows.net`;

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

const containerCache = new Map<string, any>();

async function getContainer(containerName: string, isPublic = false) {
  if (containerCache.has(containerName)) {
    return containerCache.get(containerName);
  }

  const containerClient = blobServiceClient.getContainerClient(containerName);

  await containerClient.createIfNotExists();

  containerCache.set(containerName, containerClient);
  return containerClient;
}

type UploadOptions = {
  container: "images" | "videos" | "documents";
  folder?: string;
  isPublic?: boolean;
};

export async function uploadFile(
  file: Express.Multer.File,
  options: UploadOptions
): Promise<string> {
  const sharedKeyCredential = new StorageSharedKeyCredential(account, key);
  const containerClient = await getContainer(options.container);

  const ext = file.originalname.split(".").pop();
  const fileName = `${randomUUID()}.${ext}`;
  const path = options.folder ? `${options.folder}/${fileName}` : fileName;

  const blockBlobClient = containerClient.getBlockBlobClient(path);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  });

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: options.container,
      blobName: path,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
    },
    sharedKeyCredential
  ).toString();

  return `${blockBlobClient.url}?${sasToken}`;
}
