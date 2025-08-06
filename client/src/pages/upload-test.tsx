import React, { useState } from 'react';
import { AdvancedFileUploader } from '@/components/modern-upload/AdvancedFileUploader';
import { SimpleUploadTest } from '@/components/modern-upload/SimpleUploadTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

export default function UploadTestPage() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<'profile' | 'portfolio' | 'document'>('portfolio');

  // Check authentication status
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user']
  });

  const handleUploadComplete = (fileUrls: string[]) => {
    console.log('Upload completed:', fileUrls);
    setUploadedFiles(prev => [...prev, ...fileUrls]);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardTitle>Authentication Required</CardTitle>
          <p className="mt-4">Please sign in to test the upload functionality.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              🚀 Modern File Upload System Test
              <Badge variant="secondary">Beta</Badge>
            </CardTitle>
            <p className="text-gray-300">
              Testing the new React Dropzone + Presigned URL upload architecture
            </p>
          </CardHeader>
        </Card>

        {/* Upload Type Selector */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Upload Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['profile', 'portfolio', 'document'] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Different upload types have different ACL policies and storage locations
            </p>
          </CardContent>
        </Card>

        {/* Simple Upload Test */}
        <SimpleUploadTest />

        {/* Advanced Upload Component */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Advanced File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <AdvancedFileUploader
              onUploadComplete={handleUploadComplete}
              uploadType={selectedType}
              maxFiles={5}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedTypes={selectedType === 'document' 
                ? ['image/*', 'application/pdf', 'text/*'] 
                : ['image/*']
              }
              allowMultiple={true}
              className="text-white"
            />
          </CardContent>
        </Card>

        {/* Upload Results */}
        {uploadedFiles.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Upload Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadedFiles.map((fileUrl, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div>
                      <p className="text-white font-medium">File {index + 1}</p>
                      <p className="text-gray-400 text-sm font-mono break-all">
                        {fileUrl}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      ✓ Uploaded
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Info */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">System Information</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-white mb-2">Authentication</h4>
                <p>✅ User authenticated via Google OAuth</p>
                <p>📧 {(user as any).email || 'N/A'}</p>
                <p>🆔 ID: {(user as any).id || (user as any).claims?.sub || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Upload Features</h4>
                <p>✅ React Dropzone interface</p>
                <p>✅ Presigned URL uploads</p>
                <p>✅ Progress tracking</p>
                <p>✅ Error handling</p>
                <p>✅ ACL policy management</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Testing */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">API Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => fetch('/api/upload/presigned-url', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ uploadType: selectedType, fileCount: 1 })
                }).then(r => r.json()).then(console.log)}
              >
                Test Presigned URL
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => fetch('/api/portfolios/galleries').then(r => r.json()).then(console.log)}
              >
                Test Gallery API
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => fetch('/api/auth/debug', { credentials: 'include' }).then(r => r.json()).then(console.log)}
              >
                Test Auth Debug
              </Button>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Check browser console for API responses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}