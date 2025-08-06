import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileWithId extends File {
  id: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadUrl?: string;
}

export function SimpleUploadTest() {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithId[] = acceptedFiles.map(file => ({
      ...file,
      id: Date.now() + Math.random().toString(),
      status: 'idle' as const,
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 3,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const uploadFile = async (file: FileWithId) => {
    try {
      console.log('🔄 Starting upload for:', file.name);
      
      // Step 1: Get presigned URL
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ 
          uploadType: 'portfolio', 
          fileCount: 1,
          fileExtensions: [file.name.split('.').pop()?.toLowerCase()]
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.text();
        console.error('❌ Presigned URL error:', errorData);
        throw new Error(`Failed to get upload URL: ${presignedResponse.status}`);
      }

      const { urls } = await presignedResponse.json();
      const uploadUrl = urls[0];
      
      console.log('✅ Got presigned URL:', uploadUrl.substring(0, 100) + '...');

      // Step 2: Upload file to cloud storage
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress: 50 } : f
      ));

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      console.log('✅ File uploaded successfully');

      // Step 3: Set ACL policy
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress: 90 } : f
      ));

      const aclResponse = await fetch('/api/upload/set-acl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileUrl: uploadUrl.split('?')[0], // Clean URL without query params
          visibility: 'private',
          uploadType: 'portfolio'
        }),
      });

      if (!aclResponse.ok) {
        const aclError = await aclResponse.text();
        console.warn('⚠️ ACL setting failed:', aclError);
        // Continue anyway, file is uploaded
      }

      // Success
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'success', 
          progress: 100,
          uploadUrl: uploadUrl.split('?')[0]
        } : f
      ));

      toast({
        title: "Upload Complete",
        description: `${file.name} uploaded successfully`,
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : f
      ));

      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive"
      });
    }
  };

  const uploadAll = async () => {
    setIsUploading(true);
    const pendingFiles = files.filter(f => f.status === 'idle');
    
    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of pendingFiles) {
        await uploadFile(file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAll = () => {
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Simple Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-gray-400 hover:border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-white text-lg mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop images'}
            </p>
            <p className="text-gray-400 text-sm">
              or click to select • Max 3 files • 10MB each
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Files ({files.length})</h3>
                <div className="space-x-2">
                  <Button
                    onClick={uploadAll}
                    disabled={isUploading || files.every(f => f.status !== 'idle')}
                    size="sm"
                  >
                    {isUploading ? 'Uploading...' : 'Upload All'}
                  </Button>
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{file.progress}%</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {file.error && (
                      <p className="text-red-400 text-sm mt-1">{file.error}</p>
                    )}

                    {/* Success URL */}
                    {file.uploadUrl && (
                      <p className="text-green-400 text-xs mt-1 font-mono truncate">
                        ✅ {file.uploadUrl}
                      </p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    {file.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}