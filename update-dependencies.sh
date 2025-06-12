#!/bin/bash

# Next.js 15 + React 19 Dependency Update Script
# Run from the project root directory

echo "🚀 Starting Next.js 15 + React 19 dependency updates..."

# Update compatible packages that should work with React 19
echo "📦 Updating compatible packages..."
pnpm update @headlessui/react@latest
pnpm update vaul@latest  
pnpm update react-day-picker@latest
pnpm update embla-carousel-react@latest
pnpm update react-share@latest

# Try to update next-cloudinary to beta (may support Next.js 15)
echo "🖼️  Attempting to update next-cloudinary to beta..."
pnpm add next-cloudinary@beta

# Check if build passes
echo "🔨 Testing build..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! All updates applied."
    echo "📋 Next steps:"
    echo "   1. Test your application thoroughly"
    echo "   2. Check browser console for any warnings"
    echo "   3. Test all UI components (navbar, drawers, calendar, etc.)"
    echo "   4. Test image loading (Cloudinary components)"
    echo "   5. Review the migration guide: NEXT15_REACT19_MIGRATION_GUIDE.md"
else
    echo "❌ Build failed. Check the errors above."
    echo "🔄 You may need to rollback some updates or apply manual fixes."
fi

echo "📖 For detailed migration instructions, see: NEXT15_REACT19_MIGRATION_GUIDE.md"
