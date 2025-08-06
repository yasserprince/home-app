import { Express, Request, Response } from 'express';
// Use existing auth middleware instead
import { isAuthenticated } from './replitAuth';
import { ObjectStorageService } from './objectStorage';

interface AuthRequest extends Request {
  user?: any; // Use existing auth user type
}

// Simple upload service following 2024 best practices
export function setupSimpleUpload(app: Express) {
  
  // Get presigned URL for file upload
  app.post('/api/upload/presigned-url', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { fileName, fileType, fileSize } = req.body;
      
      // Validate inputs
      if (!fileName || !fileType) {
        return res.status(400).json({ error: 'fileName and fileType required' });
      }
      
      // File size validation (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (fileSize && fileSize > maxSize) {
        return res.status(400).json({ error: 'File too large (max 10MB)' });
      }
      
      // File type validation
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({ error: 'File type not allowed' });
      }
      
      // Generate presigned URL
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      res.json({ 
        uploadURL,
        maxSize,
        allowedTypes: allowedTypes
      });
      
    } catch (error) {
      console.error('Presigned URL error:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });
  
  // Complete upload - set ACL and store metadata
  app.post('/api/upload/complete', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      const { uploadURL, fileName, fileType, fileSize } = req.body;
      
      if (!uploadURL || !fileName) {
        return res.status(400).json({ error: 'uploadURL and fileName required' });
      }
      
      const objectStorageService = new ObjectStorageService();
      
      // Get user ID from existing auth system
      const userId = ((req.user as any)?.claims || {}).sub || req.user?.id || 'unknown';
      
      // Set ACL policy for uploaded file
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(uploadURL, {
        owner: userId,
        visibility: 'private', // Default to private
        aclRules: [] // No additional rules by default
      });
      
      // Store file metadata (you can save to database here)
      console.log('File uploaded:', {
        userId,
        fileName,
        fileType,
        fileSize,
        objectPath,
        uploadedAt: new Date()
      });
      
      res.json({ 
        success: true,
        objectPath,
        fileName,
        fileSize,
        uploadedAt: new Date()
      });
      
    } catch (error) {
      console.error('Upload completion error:', error);
      res.status(500).json({ error: 'Failed to complete upload' });
    }
  });
  
  // Get user's uploaded files
  app.get('/api/upload/my-files', isAuthenticated, async (req: AuthRequest, res: Response) => {
    try {
      // In a real app, query database for user's files
      // For demo, return empty array
      res.json([]);
      
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({ error: 'Failed to get files' });
    }
  });
  
  console.log('✅ Simple upload endpoints configured');
}