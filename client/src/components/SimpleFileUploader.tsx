import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error: string | null;
  fileName: string | null;
}

interface SimpleFileUploaderProps {
  onUploadComplete?: (result: any) => void;
  accept?: string[];
  maxSize?: number;
  className?: string;
}

export function SimpleFileUploader({ 
  onUploadComplete, 
  accept = ['image/*', '.pdf', '.doc', '.docx'],
  maxSize = 10 * 1024 * 1024, // 10MB
  className 
}: SimpleFileUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
    fileName: null
  });

  const uploadFile = async (file: File) => {
    try {
      setUploadState({
        status: 'uploading',
        progress: 10,
        error: null,
        fileName: file.name
      });

      // Get JWT token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Please log in to upload files');
      }

      // Step 1: Get presigned URL
      setUploadState(prev => ({ ...prev, progress: 20 }));
      
      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      });

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadURL } = await presignedResponse.json();
      
      // Step 2: Upload file directly to cloud storage
      setUploadState(prev => ({ ...prev, progress: 50 }));
      
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Step 3: Complete upload and set ACL
      setUploadState(prev => ({ ...prev, progress: 80 }));
      
      const completeResponse = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uploadURL,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.error || 'Failed to complete upload');
      }

      const result = await completeResponse.json();
      
      setUploadState({
        status: 'success',
        progress: 100,
        error: null,
        fileName: file.name
      });

      onUploadComplete?.(result);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadState({
          status: 'idle',
          progress: 0,
          error: null,
          fileName: null
        });
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        fileName: file.name
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
    disabled: uploadState.status === 'uploading'
  });

  const resetUpload = () => {
    setUploadState({
      status: 'idle',
      progress: 0,
      error: null,
      fileName: null
    });
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadState.status === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadState.status === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${uploadState.status === 'error' ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploadState.status === 'idle' && (
          <div className="space-y-3">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop the file here' : 'Drop a file or click to select'}
              </p>
              <p className="text-sm text-gray-500">
                Supports: {accept.join(', ')} (max {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </div>
          </div>
        )}
        
        {uploadState.status === 'uploading' && (
          <div className="space-y-3">
            <Upload className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Uploading {uploadState.fileName}...
              </p>
              <Progress value={uploadState.progress} className="mt-2" />
              <p className="text-sm text-gray-500 mt-1">
                {uploadState.progress}% complete
              </p>
            </div>
          </div>
        )}
        
        {uploadState.status === 'success' && (
          <div className="space-y-3">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <div>
              <p className="text-lg font-medium text-green-700">
                Upload successful!
              </p>
              <p className="text-sm text-gray-600">
                {uploadState.fileName}
              </p>
            </div>
          </div>
        )}
        
        {uploadState.status === 'error' && (
          <div className="space-y-3">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <div>
              <p className="text-lg font-medium text-red-700">
                Upload failed
              </p>
              <p className="text-sm text-red-600">
                {uploadState.error}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetUpload}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}