# Quick Start Guide - Article REST API

## 🚀 Get Started in 5 Minutes

This guide gets your Article REST API up and running quickly using IBM i Integrated Web Services (IWS).

## Prerequisites

- IBM i 7.3 or higher
- IBM HTTP Server configured and running
- IWS Server installed
- Sample data loaded in ARTICLE table

## Step 1: Compile the Service Program (2 minutes)

Replace `YOURLIB` with your library name and `YOUR_IBM_I` with your server hostname:

```bash
# Compile RPG module
CRTSQLRPGI OBJ(YOURLIB/ART400) +
          SRCFILE(YOURLIB/QRPGLESRC) +
          SRCMBR(ART400) +
          OBJTYPE(*MODULE) +
          DBGVIEW(*SOURCE) +
          REPLACE(*YES) +
          COMMIT(*NONE) +
          CLOSQLCSR(*ENDMOD)

# Create service program
CRTSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) +
          MODULE(YOURLIB/ART400) +
          EXPORT(*SRCFILE) +
          SRCFILE(YOURLIB/QSRVSRC) +
          SRCMBR(FARTICLEAPI) +
          TEXT('Article REST API') +
          REPLACE(*YES)

# Verify
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) DETAIL(*EXPORT)
```

Expected export: **LISTALLARTICLES**

## Step 2: Deploy Web Service (2 minutes)

1. Open Web Admin: `http://YOUR_IBM_I:2001/HTTPAdmin`
2. Navigate to: **IBM i Integrated Web Services Server**
3. Click: **Deploy New Service**

### Service Configuration

```
Service Name:       articles
Library:            YOURLIB
Service Program:    FARTICLEAPI
Procedure:          ListAllArticles
Description:        Get all articles

HTTP Method:        GET
Resource Path:      /articles

Parameters:         (None)

Return Value:
  - Type:           Data Structure
  - Content-Type:   application/json
  - Auto JSON:      YES (Let IWS convert)
```

## Step 3: Test the API (30 seconds)

```bash
curl "http://YOUR_IBM_I:PORT/web/services/article/articles"
```

Expected response:
```json
{
  "article_GetArticles_R": [
    {
      "ARID": "ART001",
      "ARDESC": "Laptop Computer 15 inch",
      "ARSALEPR": 899.99,
      "ARSTOCK": 25,
      ...
    }
  ]
}
```

## Step 4: Configure React Frontend (1 minute)

Update `article-management-web/vite.config.ts`:

```typescript
proxy: {
  '/web': {
    target: 'http://YOUR_IBM_I:PORT',
    changeOrigin: true,
    secure: false,
  }
}
```

Update `article-management-web/.env`:

```env
VITE_API_BASE_URL=/web/services/article
```

## Step 5: Run the Application

```bash
cd article-management-web
npm install
npm run dev
```

Open browser to `http://localhost:3000` - you should see your articles!

## ✅ Verification Checklist

- [ ] Service program compiled successfully
- [ ] Web service deployed in IWS
- [ ] Test URL returns JSON data
- [ ] React app displays articles

## 🔧 Troubleshooting

### Service program not found
```bash
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI)
```

### No data returned
```sql
SELECT COUNT(*) FROM ARTICLE WHERE ARDEL = ' ';
```

### CORS errors
Restart dev server after changing vite.config.ts

## 📚 Next Steps

- See `02-FRONTEND-SETUP.md` for detailed React configuration
- See `03-IBM-i-DEPLOYMENT.md` for advanced IWS options
- See `04-TROUBLESHOOTING.md` for common issues

---
*Made with Bob*