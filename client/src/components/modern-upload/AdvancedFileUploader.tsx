import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Check, AlertCircle, Image, File } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  progress?: number;
  status?: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface AdvancedFileUploaderProps {
  onUploadComplete?: (files: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  allowMultiple?: boolean;
  uploadType?: 'profile' | 'portfolio' | 'document';
  className?: string;
}

export function AdvancedFileUploader({
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*'],
  allowMultiple = true,
  uploadType = 'portfolio',
  className = ''
}: AdvancedFileUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Upload mutation for presigned URLs
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/upload/presigned-url', {
        uploadType,
        fileCount: files.length
      });
      return response.json();
    }
  });

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const { file, errors } = rejection;
      errors.forEach((error: any) => {
        toast({
          title: "Upload Error",
          description: `${file.name}: ${error.message}`,
          variant: "destructive"
        });
      });
    });

    // Process accepted files
    const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
      const fileWithPreview = Object.assign(file, {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'idle' as const,
        progress: 0
      });

      // Create preview for images
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      return fileWithPreview;
    });

    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      // Respect maxFiles limit
      return combined.slice(0, maxFiles);
    });
  }, [maxFiles, toast, uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles,
    multiple: allowMultiple,
    disabled: isUploading
  });

  // Upload individual file
  const uploadFile = async (file: FileWithPreview, presignedUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress } : f
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
          ));
          resolve(presignedUrl.split('?')[0]); // Return clean URL
        } else {
          const error = `Upload failed: ${xhr.status}`;
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error', error } : f
          ));
          reject(new Error(error));
        }
      });

      xhr.addEventListener('error', () => {
        const error = 'Network error during upload';
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error', error } : f
        ));
        reject(new Error(error));
      });

      // Setup abort handling
      if (abortControllerRef.current) {
        abortControllerRef.current.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));
      
      xhr.send(file);
    });
  };

  // Handle upload process
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    abortControllerRef.current = new AbortController();

    try {
      // Get presigned URLs
      const { urls } = await uploadMutation.mutateAsync();
      
      if (!urls || urls.length !== files.length) {
        throw new Error('Invalid presigned URLs received');
      }

      // Upload all files concurrently
      const uploadPromises = files.map((file, index) => 
        uploadFile(file, urls[index])
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Notify parent component
      onUploadComplete?.(uploadedUrls);
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedUrls.length} file(s)`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios/galleries'] });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  // Clear all files
  const clearFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  // Cancel upload
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
    setFiles(prev => prev.map(f => ({ ...f, status: 'idle', progress: 0 })));
  };

  const overallProgress = files.length > 0 
    ? Math.round(files.reduce((sum, file) => sum + (file.progress || 0), 0) / files.length)
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-gray-300 dark:border-gray-600'
      } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
        <div {...getRootProps()} className="p-8 text-center cursor-pointer">
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or click to browse files
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Max {maxFiles} files • Max {Math.round(maxSize / 1024 / 1024)}MB each</p>
            <p>Supported: {acceptedTypes.join(', ')}</p>
          </div>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Files ({files.length})</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFiles}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center space-x-3">
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <File className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <Progress value={file.progress || 0} className="mt-1 h-1" />
                    )}
                    
                    {/* Error Message */}
                    {file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {file.status === 'success' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {file.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {file.status === 'idle' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Controls */}
      {files.length > 0 && (
        <div className="space-y-3">
          {/* Overall Progress */}
          {isUploading && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading files...</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
            </Button>
            
            {isUploading && (
              <Button 
                variant="outline" 
                onClick={cancelUpload}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}