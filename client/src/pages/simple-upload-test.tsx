import React, { useState } from 'react';
import { SimpleFileUploader } from '@/components/SimpleFileUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SimpleUploadTestPage() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('auth_token') || '');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('auth_token'));

  // Simple login
  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('auth_token', token);
        setAuthToken(token);
        setIsLoggedIn(true);
        console.log('Login successful');
      } else {
        const error = await response.json();
        console.error('Login failed:', error.error);
        alert('Login failed: ' + error.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error');
    }
  };

  // Quick register for testing
  const handleQuickRegister = async () => {
    try {
      const testUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('auth_token', token);
        setAuthToken(token);
        setIsLoggedIn(true);
        setLoginForm({ email: testUser.email, password: testUser.password });
        console.log('Test user created and logged in');
      } else {
        const error = await response.json();
        console.error('Registration failed:', error.error);
        alert('Registration failed: ' + error.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration error');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setAuthToken('');
    setIsLoggedIn(false);
  };

  // Test API endpoints
  const testMe = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        console.log('Current user:', user);
      } else {
        console.error('Me API failed:', response.status);
      }
    } catch (error) {
      console.error('Me API error:', error);
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
                
                {!isLoggedIn ? (
                  <>
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleLogin} className="flex-1">
                        Login
                      </Button>
                      <Button onClick={handleQuickRegister} variant="outline" className="flex-1">
                        Quick Test Register
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-green-400">✅ Logged in successfully</p>
                    <p className="text-white/80 text-sm break-all">
                      Token: {authToken.substring(0, 50)}...
                    </p>
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
                  onClick={testMe}
                  disabled={!isLoggedIn}
                  className="w-full"
                  variant="outline"
                >
                  Test GET /api/auth/me
                </Button>

                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/upload/my-files', {
                        headers: { 'Authorization': `Bearer ${authToken}` }
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