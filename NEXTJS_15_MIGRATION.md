# Next.js 15 Migration Guide

## Changes Made

### 1. Package Updates
- **Next.js**: `^14.2.20` → `^15.1.0`
- **React**: `18.3.1` → `^19.0.0`
- **React DOM**: `18.3.1` → `^19.0.0`
- **ESLint Config Next**: `14.1.0` → `^15.1.0`
- **@types/react-dom**: `19.1.2` → `^19.1.2`

### 2. TypeScript Configuration Updates
- **Target**: `ES2017` → `ES2022`
- Added `allowImportingTsExtensions: false` for better compatibility

### 3. Next.js Configuration Updates
- Added Turbopack configuration for better development performance
- Added experimental features section (disabled by default)
- Configured React Compiler support (disabled by default)
- Added Partial Prerendering support (disabled by default)

## Breaking Changes to Watch For

### React 19 Changes
1. **New JSX Transform**: React 19 uses a new JSX transform that's more efficient
2. **Ref as Prop**: `ref` is now passed as a regular prop in function components
3. **New Hooks**: `use()` hook for consuming promises and context
4. **Stricter TypeScript**: More strict type checking for props and refs

### Next.js 15 Changes
1. **Async Request APIs**: Some request APIs are now async by default
2. **Caching Changes**: Updated caching behavior for fetch requests
3. **Turbopack**: Better support for Turbopack in development
4. **Bundle Analysis**: Improved bundle analysis and optimization

## Installation Steps

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Clear Next.js Cache**:
   ```bash
   rm -rf .next
   ```

3. **Run Development Server**:
   ```bash
   pnpm dev
   ```

4. **Test Your Application**:
   - Check all pages load correctly
   - Test form submissions
   - Verify API routes work
   - Test authentication flows

## Potential Issues and Solutions

### 1. TypeScript Errors
If you encounter TypeScript errors related to React types:
```bash
pnpm add -D @types/react@latest @types/react-dom@latest
```

### 2. Ref Prop Issues
If you have components that use `forwardRef`, you might need to update them:
```typescript
// Old way (still works)
const MyComponent = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref} {...props} />;
});

// New way (React 19)
const MyComponent = ({ ref, ...props }: Props & { ref?: Ref<HTMLDivElement> }) => {
  return <div ref={ref} {...props} />;
};
```

### 3. Async Component Issues
If you have server components that use async operations, make sure they're properly typed:
```typescript
// Make sure async server components are properly typed
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## Performance Improvements

### 1. Enable Turbopack (Optional)
To use Turbopack for faster development builds:
```bash
pnpm dev --turbo
```

### 2. Enable React Compiler (Optional)
In `next.config.js`, set:
```javascript
experimental: {
  reactCompiler: true,
}
```

### 3. Enable Partial Prerendering (Optional)
In `next.config.js`, set:
```javascript
experimental: {
  ppr: true,
}
```

## Testing Checklist

- [ ] All pages load without errors
- [ ] Authentication works correctly
- [ ] Forms submit properly
- [ ] API routes respond correctly
- [ ] Images load and display properly
- [ ] SEO metadata is correct
- [ ] Performance is maintained or improved
- [ ] No console errors in browser
- [ ] TypeScript compilation succeeds
- [ ] Build process completes successfully

## Rollback Plan

If issues arise, you can rollback by reverting the package.json changes:
```bash
git checkout HEAD~1 -- package.json
pnpm install
```

## Additional Resources

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15) 