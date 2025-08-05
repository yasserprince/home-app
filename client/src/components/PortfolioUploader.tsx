import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, X, Check } from "lucide-react";

interface PortfolioUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL: string; meta: any }> }) => void;
  buttonClassName?: string;
  children: ReactNode;
}

interface FileUpload {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  uploadURL?: string;
}

export function PortfolioUploader({
  maxNumberOfFiles = 10,
  maxFileSize = 10485760, // 10MB
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: PortfolioUploaderProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: FileUpload[] = [];
    
    for (let i = 0; i < selectedFiles.length && newFiles.length + files.length < maxNumberOfFiles; i++) {
      const file = selectedFiles[i];
      
      // Check file size
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`);
        continue;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image. Please select image files only.`);
        continue;
      }
      
      const fileUpload: FileUpload = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: '',
        progress: 0,
        status: 'pending'
      };
      
      newFiles.push(fileUpload);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const updateFileInfo = (id: string, field: 'title' | 'description', value: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const successful: Array<{ uploadURL: string; meta: any }> = [];
    
    for (const fileUpload of files) {
      if (fileUpload.status !== 'pending') continue;
      
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => f.id === fileUpload.id ? { ...f, status: 'uploading' as const } : f));
        
        // Get upload parameters
        const response = await onGetUploadParameters();
        const url = response.uploadURL || response.url;
        
        // Upload file with progress tracking
        const xhr = new XMLHttpRequest();
        
        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setFiles(prev => prev.map(f => f.id === fileUpload.id ? { ...f, progress } : f));
            }
          });
          
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFiles(prev => prev.map(f => f.id === fileUpload.id ? { 
                ...f, 
                status: 'success' as const, 
                uploadURL: url,
                progress: 100 
              } : f));
              
              successful.push({
                uploadURL: url,
                meta: {
                  title: fileUpload.title,
                  description: fileUpload.description,
                  filename: fileUpload.file.name,
                  size: fileUpload.file.size,
                  type: fileUpload.file.type
                }
              });
              
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });
          
          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });
          
          xhr.open('PUT', url);
          xhr.setRequestHeader('Content-Type', fileUpload.file.type);
          xhr.send(fileUpload.file);
        });
        
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => f.id === fileUpload.id ? { ...f, status: 'error' as const } : f));
      }
    }
    
    setIsUploading(false);
    
    // Call completion callback
    if (successful.length > 0) {
      onComplete?.({ successful });
      
      // Close dialog after successful upload
      setTimeout(() => {
        setOpen(false);
        setFiles([]);
      }, 1500);
    }
  };

  const resetUploader = () => {
    // Revoke all object URLs
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setIsUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetUploader();
      }
    }}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          {children}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md md:max-w-2xl lg:max-w-4xl bg-gray-900/95 backdrop-blur-lg border-gray-700 text-white max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="upload-description">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Portfolio Images</DialogTitle>
        </DialogHeader>
        
        <div id="upload-description" className="sr-only">
          Upload and manage your portfolio images with drag and drop functionality
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300 mb-2">Drop images here or click to browse</p>
            <p className="text-sm text-gray-500">
              Max {maxNumberOfFiles} files, up to {Math.round(maxFileSize / 1024 / 1024)}MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            />
          </div>
          
          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Selected Images ({files.length})</h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {files.map((fileUpload) => (
                  <div key={fileUpload.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex gap-4">
                      {/* Image Preview */}
                      <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={fileUpload.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {fileUpload.file.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {fileUpload.status === 'success' && (
                              <Check className="w-4 h-4 text-green-400" />
                            )}
                            {fileUpload.status === 'error' && (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(fileUpload.id)}
                              className="h-6 w-6 p-0 hover:bg-gray-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {fileUpload.status === 'uploading' && (
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${fileUpload.progress}%` }}
                            />
                          </div>
                        )}
                        
                        {/* Title Input */}
                        <Input
                          placeholder="Image title"
                          value={fileUpload.title}
                          onChange={(e) => updateFileInfo(fileUpload.id, 'title', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white text-sm"
                          disabled={isUploading}
                        />
                        
                        {/* Description Input */}
                        <Textarea
                          placeholder="Description (optional)"
                          value={fileUpload.description}
                          onChange={(e) => updateFileInfo(fileUpload.id, 'description', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white text-sm resize-none"
                          rows={2}
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Upload Button */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUploading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={uploadFiles}
            disabled={files.length === 0 || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </div>
            ) : (
              <>Upload {files.length} Image{files.length !== 1 ? 's' : ''}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}