import { NextResponse } from 'next/server';

/**
 * Create authentication token with user info
 * @param {string} username - The username
 * @param {boolean} isAdmin - Whether user is admin
 * @returns {string} Base64 encoded token
 */
export function createAuthToken(username, isAdmin = false) {
  const userData = {
    username,
    isAdmin: isAdmin || username === 'admin',
    timestamp: Date.now(),
  };
  
  // For production, use JWT instead of simple base64 encoding
  // Example with JWT:
  // return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  return Buffer.from(JSON.stringify(userData)).toString('base64');
}

/**
 * Set authentication cookie in response
 * @param {NextResponse} response - Next.js response object
 * @param {string} token - Authentication token
 */
export function setAuthCookie(response, token) {
  response.cookies.set('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}


/**
 * Verify and decode authentication token
 * @param {string} token - Authentication token
 * @returns {Object|null} User data or null if invalid
 */
export function verifyAuthToken(token) {
  try {
    // For JWT:
    // return jwt.verify(token, process.env.JWT_SECRET);
    
    // For base64:
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get user info from request
 * @param {Request} request - Next.js request object
 * @returns {Object|null} User info or null
 */
export function getUserFromRequest(request) {
  const authCookie = request.cookies.get('auth');
  if (!authCookie) return null;
  
  return verifyAuthToken(authCookie.value);
}