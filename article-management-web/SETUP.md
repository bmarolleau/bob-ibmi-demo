
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
