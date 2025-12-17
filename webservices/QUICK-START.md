# Quick Start Guide - Article REST API with IWS

## 🚀 5-Minute Setup

### Step 1: Compile the Service Program (2 minutes)

```
/* Replace YOURLIB with your library name */

/* Compile RPG module */
CRTSQLRPGI OBJ(YOURLIB/ART400) +
          SRCFILE(YOURLIB/QRPGLESRC) +
          SRCMBR(ART400) +
          OBJTYPE(*MODULE) +
          DBGVIEW(*SOURCE) +
          REPLACE(*YES) +
          COMMIT(*NONE) +
          CLOSQLCSR(*ENDMOD)

/* Create service program */
CRTSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) +
          MODULE(YOURLIB/ART400) +
          EXPORT(*SRCFILE) +
          SRCFILE(YOURLIB/QSRVSRC) +
          SRCMBR(FARTICLEAPI) +
          TEXT('Article REST API') +
          REPLACE(*YES)
```

### Step 2: Deploy via Web Admin (2 minutes)

1. Open: `http://your-ibm-i:2001/HTTPAdmin`
2. Go to: **IBM i Integrated Web Services Server**
3. Click: **Deploy New Service**

#### Service 1: GetArticle

```
Service Name:    GetArticle
Library:         YOURLIB
Service Program: FARTICLEAPI
Procedure:       GETARTICLE
HTTP Method:     GET
Resource:        /api/articles/{articleId}

Parameters:
  - articleId: CHAR(6), INPUT

Return:
  - Type: VARCHAR(4096)
  - Content-Type: application/json
```

#### Service 2: ListArticles

```
Service Name:    ListArticles
Library:         YOURLIB
Service Program: FARTICLEAPI
Procedure:       LISTARTICLES
HTTP Method:     GET
Resource:        /api/articles

Parameters:
  - page: INT(10), INPUT, Default=1
  - pageSize: INT(10), INPUT, Default=14
  - positionTo: CHAR(6), INPUT, Optional
  - includeDeleted: IND, INPUT, Optional

Return:
  - Type: VARCHAR(32000)
  - Content-Type: application/json
```

### Step 3: Enable CORS (1 minute)

In IWS Server configuration:

```
Allowed Origins:  http://localhost:3000
Allowed Methods:  GET, POST, PUT, DELETE, OPTIONS
Allowed Headers:  Content-Type, Authorization
```

### Step 4: Test (30 seconds)

```bash
# Test GetArticle
curl "http://your-ibm-i:port/web/services/GetArticle/ART001"

# Test ListArticles
curl "http://your-ibm-i:port/web/services/ListArticles?page=1&pageSize=14"
```

### Step 5: Update React App

Edit `article-management-web/.env`:

```env
VITE_API_BASE_URL=http://your-ibm-i:port/web/services
```

Edit `article-management-web/src/services/api.config.ts`:

```typescript
export const API_ENDPOINTS = {
  articles: {
    list: '/ListArticles',
    detail: (id: string) => `/GetArticle/${id}`,
  },
};
```

## ✅ Verification Checklist

- [ ] Service program compiled successfully
- [ ] Both web services deployed in IWS
- [ ] CORS configured for localhost:3000
- [ ] Test URLs return JSON data
- [ ] React app .env updated
- [ ] React app api.config.ts updated

## 🎯 Expected Results

### GetArticle Response:
```json
{
  "success": true,
  "message": "Article retrieved successfully",
  "article": {
    "id": "ART001",
    "description": "Laptop Computer 15 inch",
    "salePrice": 899.99,
    "stock": 25
  }
}
```

### ListArticles Response:
```json
{
  "success": true,
  "pagination": {
    "currentPage": 1,
    "totalRecords": 50,
    "hasMore": true
  },
  "articles": [...]
}
```

## 🔧 Troubleshooting

### Service program not found
```
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI)
```

### Check exported procedures
```
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) DETAIL(*EXPORT)
```

### View job log
```
DSPJOBLOG
```

### Test procedure directly
```
CALL YOURLIB/FARTICLEAPI.GETARTICLE('ART001')
```

## 📚 Full Documentation

See `ArticleAPI-IWS-Config.md` for complete details on:
- Security configuration
- Performance optimization
- Advanced deployment options
- Monitoring and logging

## 🆘 Common Issues

**Issue**: "Procedure not found"  
**Fix**: Check binding source exports match procedure names

**Issue**: "CORS error in browser"  
**Fix**: Restart IWS server after CORS configuration

**Issue**: "SQL error"  
**Fix**: Verify ARTICLE, FAMILLY, and VATDEF tables exist

**Issue**: "Empty response"  
**Fix**: Check that sample data is loaded (run POPULATE_SAMPLE_DATA.SQL)

---

**Ready to go!** Start your React app with `npm run dev` and test the integration! 🎉