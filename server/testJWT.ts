import { generateToken, verifyToken, type JWTPayload } from './jwtAuth.js';

// Test JWT functionality
export function testJWTSystem() {
  console.log('\n🧪 Testing JWT System...');
  
  try {
    // Create test token
    const testPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: 'test-user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'service_seeker',
      accountType: 'individual',
      authProvider: 'google'
    };
    
    const token = generateToken(testPayload);
    console.log('✅ Token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Verify token
    const decoded = verifyToken(token);
    if (decoded) {
      console.log('✅ Token verified successfully');
      console.log('Decoded payload:', {
        sub: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        role: decoded.role
      });
    } else {
      console.log('❌ Token verification failed');
    }
    
    // Test invalid token
    const invalidDecoded = verifyToken('invalid.token.here');
    console.log('✅ Invalid token handled correctly:', !invalidDecoded);
    
    console.log('🎉 JWT System Test Complete\n');
    
  } catch (error) {
    console.error('❌ JWT Test Failed:', error);
  }
}