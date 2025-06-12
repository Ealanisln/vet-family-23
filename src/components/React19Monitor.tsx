"use client";

import React, { useEffect } from 'react';

/**
 * React 19 Compatibility Monitor
 * Add this component to your layout during the migration period
 * to monitor for any compatibility issues
 */
export default function React19Monitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log version information
      console.log('🔍 React 19 Migration Monitor:');
      console.log(`   React version: ${React.version}`);
      console.log(`   Node environment: ${process.env.NODE_ENV}`);
      
      // Check for common React 19 issues
      const checkForIssues = () => {
        // Monitor for hydration warnings
        const originalError = console.error;
        console.error = (...args) => {
          if (args[0] && args[0].includes && (
            args[0].includes('Hydration') || 
            args[0].includes('useFormState') ||
            args[0].includes('peer dependency')
          )) {
            console.warn('🚨 Potential React 19 compatibility issue detected:', ...args);
          }
          originalError.apply(console, args);
        };

        // Monitor for ref callback warnings
        const originalWarn = console.warn;
        console.warn = (...args) => {
          if (args[0] && args[0].includes && args[0].includes('ref callback')) {
            console.warn('⚠️  React 19 ref callback warning:', ...args);
          }
          originalWarn.apply(console, args);
        };
      };

      checkForIssues();

      // Clean up
      return () => {
        // Restore original console methods if needed
      };
    }
  }, []);

  // Check for problematic peer dependencies
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const problematicPackages = [
        '@headlessui/react',
        'next-cloudinary', 
        '@react-google-maps/api',
        'react-day-picker',
        'embla-carousel-react',
        'react-share',
        'vaul',
        'sanity-plugin-seo'
      ];

      console.log('📋 Monitoring these packages for compatibility:', problematicPackages);
    }
  }, []);

  return null; // This component doesn't render anything
}
