import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const account = process.env.AZURE_STORAGE_ACCOUNT!;
const key = process.env.AZURE_STORAGE_KEY!;
const credential = new StorageSharedKeyCredential(account, key);

export function generateReadSas(blobUrl: string) {
  const url = new URL(blobUrl);

  const [, containerName, ...blobParts] = url.pathname.split("/");
  const blobName = blobParts.join("/");

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
    credential
  ).toString();

  return `${blobUrl}?${sas}`;
}
