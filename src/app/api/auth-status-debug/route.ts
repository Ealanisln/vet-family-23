import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getUser, getRoles, isAuthenticated } = getKindeServerSession();
    
    // Test all auth methods with detailed error handling
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      domain: process.env.VERCEL_URL || 'unknown',
      kindeConfig: {
        domain: process.env.KINDE_DOMAIN,
        issuerUrl: process.env.KINDE_ISSUER_URL,
        siteUrl: process.env.KINDE_SITE_URL,
        clientIdExists: !!process.env.KINDE_CLIENT_ID,
        clientSecretExists: !!process.env.KINDE_CLIENT_SECRET,
        postLoginUrl: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
        postLogoutUrl: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
        cookieDomain: process.env.KINDE_COOKIE_DOMAIN,
      },
      tests: {
        user: { status: 'pending', data: null, error: null },
        roles: { status: 'pending', data: null, error: null },
        authenticated: { status: 'pending', data: null, error: null }
      },
      analysis: {
        configurationIssues: [] as string[],
        recommendations: [] as string[]
      }
    };

    // Test getUser()
    try {
      const user = await getUser();
      results.tests.user = {
        status: 'success',
        data: user ? {
          id: user.id,
          email: user.email,
          given_name: user.given_name,
          family_name: user.family_name
        } : null,
        error: null
      };
    } catch (error) {
      results.tests.user = {
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test getRoles()
    try {
      const roles = await getRoles();
      results.tests.roles = {
        status: 'success',
        data: roles,
        error: null
      };
    } catch (error) {
      results.tests.roles = {
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test isAuthenticated()
    try {
      const authenticated = await isAuthenticated();
      results.tests.authenticated = {
        status: 'success',
        data: authenticated,
        error: null
      };
    } catch (error) {
      results.tests.authenticated = {
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Analysis - already initialized above

    // Check for common configuration issues
    if (!process.env.KINDE_CLIENT_ID) {
      results.analysis.configurationIssues.push('KINDE_CLIENT_ID is missing');
    }
    if (!process.env.KINDE_CLIENT_SECRET) {
      results.analysis.configurationIssues.push('KINDE_CLIENT_SECRET is missing');
    }
    if (!process.env.KINDE_ISSUER_URL) {
      results.analysis.configurationIssues.push('KINDE_ISSUER_URL is missing');
    }
    if (!process.env.KINDE_SITE_URL) {
      results.analysis.configurationIssues.push('KINDE_SITE_URL is missing');
    }

    // Check URL configuration
    if (process.env.KINDE_SITE_URL && !process.env.KINDE_SITE_URL.includes('development.vetforfamily.com')) {
      results.analysis.configurationIssues.push('KINDE_SITE_URL may not match the current domain');
    }

    // Recommendations based on issues found
    if (results.analysis.configurationIssues.length > 0) {
      results.analysis.recommendations.push('Check Vercel environment variables configuration');
      results.analysis.recommendations.push('Ensure Kinde application is configured for development.vetforfamily.com');
      results.analysis.recommendations.push('Verify callback URLs in Kinde: https://development.vetforfamily.com/api/auth/kinde_callback');
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 