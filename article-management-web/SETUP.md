
# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (should be 18.x or higher)
node --version

# Check npm version (should be 9.x or higher)
npm --version
```

If you don't have Node.js installed, download it from: https://nodejs.org/

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd article-management-web
npm install
```

**Expected output**: Installation of ~1000 packages (takes 1-2 minutes)

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your API URL
# For example: VITE_API_BASE_URL=http://192.168.1.100:8080/api
```

### 3. Start Development Server

```bash
npm run dev
```

**Expected output**:
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h to show help
```

### 4. Open in Browser

Navigate to: **http://localhost:3000**

You should see the Article Management interface.

## Verify Installation

### Check if all files are present:

```bash
# Should show the project structure
ls -la src/
```

Expected directories:
- `components/` - React components
- `pages/` - Page components
- `services/` - API services
- `types/` - TypeScript types
- `styles/` - SCSS styles

### Test the build:

```bash
npm run build
```

Should complete without errors and create a `dist/` directory.

## Common Issues

### Issue: "Cannot find module 'react'"

**Solution**: Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"

**Solution**: Vite will automatically use the next available port (3001, 3002, etc.)

Or specify a different port in `vite.config.ts`:
```ts
server: {
  port: 3001,
}
```

### Issue: "API connection failed"

**Solution**: Check your backend API
1. Verify the API is running
2. Check the URL in `.env`
3. Test the API endpoint directly:
   ```bash
   curl http://your-server:8080/api/articles
   ```

### Issue: TypeScript errors in IDE

**Solution**: Restart your IDE or TypeScript server
- VS Code: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type: "TypeScript: Restart TS Server"

## Next Steps

1. ✅ **Frontend is running** - You can now develop the UI

2. 🔧 **Implement Backend APIs** - Follow the modernization plan to create RPG Service Programs
3. 🧪 **Test Integration** - Verify frontend connects to backend
4. 🚀 **Deploy** - Build and deploy to production

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Make changes** to components in `src/`
3. **See changes instantly** in the browser (hot reload)
4. **Test API integration** with your backend
5. **Build for production** when ready: `npm run build`

## File Structure Quick Reference

```
src/
├── components/          # Reusable UI components
│   ├── ArticleList.tsx     # List view with table
│   ├── ArticleForm.tsx     # Create/Edit form
│   └── ArticleInfo.tsx     # Extended info view
├── pages/              # Page-level components
│   └── ArticleManagement.tsx  # Main orchestrator
├── services/           # API integration
│   ├── api.config.ts      # Endpoints configuration
│   ├── api.client.ts      # HTTP client
│   └── article.service.ts # Business logic
├── types/              # TypeScript definitions
│   └── article.types.ts   # All type definitions
└── styles/             # SCSS styles
    └── App.scss           # Main styles
```

## Environment Variables

Create a `.env` file with:

```env
# Required: Backend API URL
VITE_API_BASE_URL=http://your-ibm-i-server:8080/api

# Optional: Application title
VITE_APP_TITLE=Article Management System
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Performance Tips

- Use production build for deployment (`npm run build`)
- Enable gzip compression on your web server
- Use CDN for static assets if possible
- Monitor bundle size with `npm run build -- --analyze`

## Security Notes

- Never commit `.env` files with real credentials
- Use HTTPS in production
- Implement proper authentication/authorization
- Validate all user inputs on the backend

## Getting Help

1. Check the main [README.md](README.md) for detailed documentation
2. Review the [modernization plan](../modernization-plan/README.md)
3. Check browser console for error messages
4. Verify API endpoints are accessible

---

**Ready to start? Run `npm run dev` and open http://localhost:3000** 🎉
