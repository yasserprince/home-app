import React, { useState } from 'react';
import { SimpleFileUploader } from '@/components/SimpleFileUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SimpleUploadTestPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Replit Auth login
  const handleReplitLogin = () => {
    window.location.href = '/api/auth/replit';
  };

  // Google Auth login
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check auth on component mount
  React.useEffect(() => {
    checkAuth();
  }, []);

  // Test API endpoints
  const testUserAPI = async () => {
    try {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Current user:', userData);
      } else {
        console.error('User API failed:', response.status);
      }
    } catch (error) {
      console.error('User API error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              Simple Upload Test - Modern Architecture
            </CardTitle>
            <p className="text-white/80 text-center">
              Clean JWT Auth + React Dropzone + Presigned URLs
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="auth" className="data-[state=active]:bg-white/20">Authentication</TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-white/20">File Upload</TabsTrigger>
            <TabsTrigger value="test" className="data-[state=active]:bg-white/20">API Tests</TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="auth">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {loading ? (
                  <div className="text-center py-4">
                    <p className="text-white/60">Checking authentication...</p>
                  </div>
                ) : !isLoggedIn ? (
                  <>
                    <div className="space-y-3">
                      <p className="text-white/80 text-center">
                        Use existing authentication system
                      </p>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleReplitLogin} className="flex-1">
                          Login with Replit
                        </Button>
                        <Button onClick={handleGoogleLogin} variant="outline" className="flex-1">
                          Login with Google
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-green-400">✅ Logged in successfully</p>
                    {user && (
                      <div className="text-white/80 text-sm">
                        <p>User: {user.firstName} {user.lastName}</p>
                        <p>Email: {user.email}</p>
                        <p>ID: {user.id}</p>
                      </div>
                    )}
                    <Button onClick={handleLogout} variant="outline">
                      Logout
                    </Button>
                  </div>
                )}
                
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">File Upload</CardTitle>
                <p className="text-white/80">
                  Modern React Dropzone + Presigned URLs + JWT Authentication
                </p>
              </CardHeader>
              <CardContent>
                
                {isLoggedIn ? (
                  <SimpleFileUploader
                    onUploadComplete={(result) => {
                      console.log('Upload completed:', result);
                      alert('File uploaded successfully!');
                    }}
                    accept={['image/*', '.pdf', '.doc', '.docx']}
                    maxSize={10 * 1024 * 1024}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60">Please log in to upload files</p>
                  </div>
                )}
                
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tests Tab */}
          <TabsContent value="test">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">API Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                <Button 
                  onClick={testUserAPI}
                  disabled={!isLoggedIn}
                  className="w-full"
                  variant="outline"
                >
                  Test GET /api/auth/user
                </Button>

                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/upload/my-files', { 
                        credentials: 'include' 
                      });
                      const files = await response.json();
                      console.log('User files:', files);
                    } catch (error) {
                      console.error('Files API error:', error);
                    }
                  }}
                  disabled={!isLoggedIn}
                  className="w-full"
                  variant="outline"
                >
                  Test GET /api/upload/my-files
                </Button>

                <div className="text-white/60 text-sm">
                  Check browser console for API responses
                </div>
                
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}