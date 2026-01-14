# Frontend Setup Guide - React Application

## Overview

This guide explains how to configure and run the React frontend application to connect to your IBM i REST API.

## Architecture

```
Browser (localhost:3000)
    ↓
Vite Dev Server (proxy)
    ↓
IBM i Web Services (YOUR_IBM_I:PORT)
    ↓
FARTICLEAPI Service Program
    ↓
ARTICLE Database
```

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- IBM i REST API deployed (see `01-QUICK-START.md`)

## Installation

### 1. Install Dependencies

```bash
cd article-management-web
npm install
```

### 2. Configure Environment

Create or update `.env` file:

```env
# Use proxy path (Vite forwards to IBM i)
VITE_API_BASE_URL=/web/services/article

# Application Settings
VITE_APP_TITLE=Article Management System
```

### 3. Configure Vite Proxy

The `vite.config.ts` is already configured:

```typescript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/web': {
        target: 'http://YOUR_IBM_I:PORT',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

**Update the target** with your IBM i hostname and port.

## Data Flow

### Request Flow
1. Frontend calls: `/web/services/article/articles`
2. Vite proxy intercepts `/web` requests
3. Forwards to: `http://YOUR_IBM_I:PORT/web/services/article/articles`
4. IBM i returns JSON response
5. Frontend transforms and displays data

### Data Transformation

The application automatically transforms IBM i format to frontend format:

| IBM i Field | Frontend Field | Type | Description |
|-------------|---------------|------|-------------|
| ARID | id | string | Article ID |
| ARDESC | description | string | Description |
| ARTIFA | familyCode | string | Family code |
| ARVATCD | vatCode | string | VAT code |
| ARSALEPR | salePrice | number | Sale price |
| ARWHSPR | warehousePrice | number | Warehouse price |
| ARSTOCK | stock | number | Stock quantity |
| ARMINQTY | minimumQuantity | number | Minimum quantity |
| ARDEL | deleted | boolean | Deleted flag |
| ARCREA | createdDate | string | Creation date |
| ARMOD | modifiedDate | string | Modified date |
| ARMODID | modifiedUser | string | Modified by |

## Running the Application

### Development Mode

```bash
npm run dev
```

Application runs on: `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Features

### ✅ Implemented
- Display all articles from IBM i
- Client-side search/filtering
- Client-side pagination (14 items per page)
- Responsive table layout
- Action menu (Edit, Info, Delete, Suppliers)

### ⚠️ Not Yet Implemented
- Create new article
- Edit article
- Delete article
- View article info
- View suppliers

These require additional IBM i endpoints.

## File Structure

```
article-management-web/
├── src/
│   ├── components/
│   │   ├── ArticleList.tsx      # Main list view
│   │   ├── ArticleForm.tsx      # Create/Edit form
│   │   └── ArticleInfo.tsx      # Extended info view
│   ├── pages/
│   │   └── ArticleManagement.tsx # Page orchestrator
│   ├── services/
│   │   ├── api.config.ts        # API endpoints
│   │   ├── api.client.ts        # HTTP client
│   │   └── article.service.ts   # Business logic
│   └── types/
│       └── article.types.ts     # TypeScript types
├── .env                         # Environment config
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies
```

## Troubleshooting

### Issue: Network Error

**Cause**: Vite proxy not configured or IBM i not accessible

**Solution**:
1. Check `vite.config.ts` proxy target
2. Verify IBM i is accessible: `ping YOUR_IBM_I`
3. Test API directly: `curl http://YOUR_IBM_I:PORT/web/services/article/articles`
4. Restart dev server after config changes

### Issue: Empty Article List

**Cause**: No data in ARTICLE table or API not returning data

**Solution**:
1. Check browser console for errors
2. Check Network tab in DevTools
3. Verify API response format matches expected structure
4. Test API directly with curl

### Issue: TypeScript Errors

**Cause**: Type mismatches or missing dependencies

**Solution**:
```bash
npm install
npm run build
```

### Issue: Port Already in Use

**Cause**: Another process using port 3000

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
server: {
  port: 3001,
  ...
}
```

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant updates. Changes to React components update without full page reload.

### Browser DevTools

- **Console**: Check for errors and API logs
- **Network**: Inspect API requests/responses
- **React DevTools**: Inspect component state

### API Testing

Test the transformation logic:

```typescript
// In browser console
fetch('/web/services/article/articles')
  .then(r => r.json())
  .then(data => console.log(data));
```

## Production Deployment

### Option 1: Deploy on IBM i

1. Build the application: `npm run build`
2. Copy `dist/` folder to IBM i IFS
3. Configure HTTP Server to serve static files
4. Update API URLs to use same origin

### Option 2: Deploy on Separate Server

1. Build the application: `npm run build`
2. Deploy to web server (nginx, Apache, etc.)
3. Configure CORS on IBM i Web Services
4. Update `.env` with production API URL

## Next Steps

- See `03-IBM-i-DEPLOYMENT.md` for IBM i configuration
- See `04-TROUBLESHOOTING.md` for common issues
- See `05-ADVANCED-FEATURES.md` for implementing CRUD operations

---
*Made with Bob*