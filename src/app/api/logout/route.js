import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // Clear the authentication cookie to match login session logic
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}