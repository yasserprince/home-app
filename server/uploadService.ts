import { Storage, File } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

// Modern upload service with best practices
export class ModernUploadService {
  private storage: Storage;

  constructor() {
    this.storage = new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token",
          },
        },
        universe_domain: "googleapis.com",
      },
      projectId: "",
    });
  }

  // Get bucket configuration from environment
  private getBucketConfig() {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    const privateDir = process.env.PRIVATE_OBJECT_DIR;
    
    if (!bucketId || !privateDir) {
      throw new Error('Object storage not configured. Missing bucket ID or private directory.');
    }

    return { bucketId, privateDir };
  }

  // Generate secure presigned upload URLs
  async generatePresignedUploadUrls(options: {
    userId: string;
    uploadType: 'profile' | 'portfolio' | 'document';
    fileCount: number;
    fileExtensions?: string[];
  }): Promise<{ urls: string[]; fileIds: string[] }> {
    const { userId, uploadType, fileCount, fileExtensions = [] } = options;
    const { bucketId, privateDir } = this.getBucketConfig();

    if (fileCount <= 0 || fileCount > 10) {
      throw new Error('Invalid file count. Must be between 1 and 10.');
    }

    const urls: string[] = [];
    const fileIds: string[] = [];

    for (let i = 0; i < fileCount; i++) {
      const fileId = randomUUID();
      const extension = fileExtensions[i] || 'bin';
      const fileName = `${fileId}.${extension}`;
      
      // Organize files by type and user
      const objectPath = `${privateDir}/${uploadType}/${userId}/${fileName}`;
      
      // Generate presigned URL with 15-minute expiry
      const signedUrl = await this.signUploadUrl({
        bucketName: bucketId,
        objectName: objectPath,
        expiresInMinutes: 15
      });

      urls.push(signedUrl);
      fileIds.push(fileId);
    }

    return { urls, fileIds };
  }

  // Set ACL policy for uploaded files
  async setFileAcl(options: {
    fileUrl: string;
    userId: string;
    visibility: 'public' | 'private';
    uploadType: 'profile' | 'portfolio' | 'document';
  }): Promise<string> {
    const { fileUrl, userId, visibility, uploadType } = options;
    const { bucketId } = this.getBucketConfig();

    try {
      // Extract object path from URL
      const url = new URL(fileUrl);
      const objectPath = url.pathname.substring(1); // Remove leading slash
      
      // Get the file object
      const bucket = this.storage.bucket(bucketId);
      const file = bucket.file(objectPath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found in storage');
      }

      // Set ACL policy metadata
      const aclPolicy = {
        owner: userId,
        visibility,
        uploadType,
        createdAt: new Date().toISOString()
      };

      await file.setMetadata({
        metadata: {
          'custom:aclPolicy': JSON.stringify(aclPolicy),
          'custom:uploadType': uploadType,
          'custom:owner': userId
        }
      });

      // Return the object path for API responses
      return `/objects/${objectPath}`;
    } catch (error) {
      console.error('Error setting file ACL:', error);
      throw new Error('Failed to set file permissions');
    }
  }

  // Check file access permissions
  async canAccessFile(options: {
    objectPath: string;
    userId?: string;
    requestedPermission: 'read' | 'write';
  }): Promise<boolean> {
    const { objectPath, userId, requestedPermission } = options;
    const { bucketId } = this.getBucketConfig();

    try {
      const bucket = this.storage.bucket(bucketId);
      const file = bucket.file(objectPath);

      const [metadata] = await file.getMetadata();
      const aclPolicyStr = metadata?.metadata?.['custom:aclPolicy'];
      
      if (!aclPolicyStr) {
        // No ACL policy, deny access
        return false;
      }

      const aclPolicy = JSON.parse(aclPolicyStr);

      // Public files are readable by everyone
      if (aclPolicy.visibility === 'public' && requestedPermission === 'read') {
        return true;
      }

      // Owner has full access
      if (aclPolicy.owner === userId) {
        return true;
      }

      // Otherwise, deny access
      return false;
    } catch (error) {
      console.error('Error checking file access:', error);
      return false;
    }
  }

  // Serve file with proper access control
  async serveFile(options: {
    objectPath: string;
    userId?: string;
    response: any; // Express response object
  }): Promise<void> {
    const { objectPath, userId, response } = options;
    const { bucketId } = this.getBucketConfig();

    const canAccess = await this.canAccessFile({
      objectPath,
      userId,
      requestedPermission: 'read'
    });

    if (!canAccess) {
      response.status(403).json({ error: 'Access denied' });
      return;
    }

    try {
      const bucket = this.storage.bucket(bucketId);
      const file = bucket.file(objectPath);

      const [metadata] = await file.getMetadata();
      const aclPolicy = JSON.parse(metadata?.metadata?.['custom:aclPolicy'] || '{}');

      // Set appropriate headers
      response.set({
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Content-Length': metadata.size,
        'Cache-Control': aclPolicy.visibility === 'public' 
          ? 'public, max-age=86400' 
          : 'private, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
      });

      // Stream the file
      const stream = file.createReadStream();
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!response.headersSent) {
          response.status(500).json({ error: 'Error streaming file' });
        }
      });

      stream.pipe(response);
    } catch (error) {
      console.error('Error serving file:', error);
      if (!response.headersSent) {
        response.status(500).json({ error: 'Error serving file' });
      }
    }
  }

  // Delete file from storage
  async deleteFile(objectPath: string, userId: string): Promise<boolean> {
    const { bucketId } = this.getBucketConfig();

    try {
      const bucket = this.storage.bucket(bucketId);
      const file = bucket.file(objectPath);

      // Check ownership before deletion
      const canAccess = await this.canAccessFile({
        objectPath,
        userId,
        requestedPermission: 'write'
      });

      if (!canAccess) {
        throw new Error('Access denied: Cannot delete file');
      }

      await file.delete();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Private helper: Sign upload URL
  private async signUploadUrl(options: {
    bucketName: string;
    objectName: string;
    expiresInMinutes: number;
  }): Promise<string> {
    const { bucketName, objectName, expiresInMinutes } = options;
    
    const request = {
      bucket_name: bucketName,
      object_name: objectName,
      method: 'PUT' as const,
      expires_at: new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString(),
    };

    const response = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to sign upload URL: ${response.status}`);
    }

    const { signed_url } = await response.json();
    return signed_url;
  }

  // Cleanup expired uploads (utility method)
  async cleanupExpiredUploads(): Promise<void> {
    // This could be implemented to clean up files that were uploaded but never had ACL set
    // Could be run as a periodic job
    console.log('Cleanup expired uploads - to be implemented');
  }
}

// Export singleton instance
export const uploadService = new ModernUploadService();