import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
      
      <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-md md:max-w-2xl lg:max-w-4xl bg-gray-900/95 backdrop-blur-lg border-gray-700 text-white max-h-[75vh] overflow-hidden flex flex-col p-3 sm:p-4" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: 0 }}>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-white text-base sm:text-lg">Upload Portfolio Images</DialogTitle>
          <DialogDescription className="text-gray-300 sr-only">
            Upload and manage your portfolio images with drag and drop functionality
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-600 rounded-lg p-2 sm:p-4 text-center hover:border-gray-500 transition-colors cursor-pointer min-h-[80px] flex flex-col justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1 text-gray-400" />
            <p className="text-gray-300 mb-1 text-xs sm:text-sm">Drop images here or tap to browse</p>
            <p className="text-[10px] sm:text-xs text-gray-500">
              Max {maxNumberOfFiles} files, {Math.round(maxFileSize / 1024 / 1024)}MB each
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
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-medium">Selected Images ({files.length})</h3>
              
              <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                {files.map((fileUpload) => (
                  <div key={fileUpload.id} className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
                    <div className="flex gap-2 sm:gap-3">
                      {/* Image Preview */}
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={fileUpload.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium truncate pr-2">
                            {fileUpload.file.name}
                          </span>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {fileUpload.status === 'success' && (
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                            )}
                            {fileUpload.status === 'error' && (
                              <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(fileUpload.id)}
                              className="h-7 w-7 sm:h-6 sm:w-6 p-0 hover:bg-gray-700 flex-shrink-0"
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
                          className="bg-gray-700 border-gray-600 text-white text-xs sm:text-sm h-7 sm:h-8"
                          disabled={isUploading}
                        />
                        
                        {/* Description Input */}
                        <Textarea
                          placeholder="Description (optional)"
                          value={fileUpload.description}
                          onChange={(e) => updateFileInfo(fileUpload.id, 'description', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white text-xs sm:text-sm resize-none min-h-[40px] sm:min-h-[45px]"
                          rows={1}
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
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-gray-700 mt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUploading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 h-9 text-xs sm:text-sm order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={uploadFiles}
            disabled={files.length === 0 || isUploading}
            className="bg-blue-600 hover:bg-blue-700 h-9 text-xs sm:text-sm order-1 sm:order-2"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Uploading...</span>
                <span className="sm:hidden">Upload...</span>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">Upload {files.length} Image{files.length !== 1 ? 's' : ''}</span>
                <span className="sm:hidden">Upload ({files.length})</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}