# Article REST API - IBM i Integrated Web Services Configuration

## Overview

This document provides step-by-step instructions to deploy the Article REST API using IBM i Integrated Web Services (IWS).

## Prerequisites

- IBM i 7.3 or higher
- IBM HTTP Server for i configured and running
- IWS Server installed and configured
- Authority to create web services

## Files Created

1. **QRPGLESRC/ART400.SQLRPGLE** - RPG module with REST API procedures
2. **QSRVSRC/FARTICLEAPI.BND** - Service program binding source
3. **QILESRVSRC/FARTICLEAPI.ILESRVPGM** - Build script

## Step 1: Compile the Service Program

### Option A: Using the Build Script

```
CALL PGM(YOURLIB/FARTICLEAPI) PARM('YOURLIB' 'FARTICLEAPI')
```

### Option B: Manual Compilation

```
/* 1. Compile the RPG module */
CRTSQLRPGI OBJ(YOURLIB/ART400) +
          SRCFILE(YOURLIB/QRPGLESRC) +
          SRCMBR(ART400) +
          OBJTYPE(*MODULE) +
          DBGVIEW(*SOURCE) +
          REPLACE(*YES) +
          COMMIT(*NONE) +
          CLOSQLCSR(*ENDMOD)

/* 2. Create the service program */
CRTSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) +
          MODULE(YOURLIB/ART400) +
          EXPORT(*SRCFILE) +
          SRCFILE(YOURLIB/QSRVSRC) +
          SRCMBR(FARTICLEAPI) +
          TEXT('Article REST API Service Program') +
          REPLACE(*YES)

/* 3. Verify creation */
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI)
```

## Step 2: Deploy Web Services Using IWS

### Method 1: Using IBM Web Administration for i (Recommended)

1. **Open Web Administration**
   - URL: `http://your-ibm-i:2001/HTTPAdmin`   - Login with your IBM i credentials

2. **Navigate to IWS**
   - Click "IBM i Integrated Web Services Server"
   - Select your server instance (usually DEFAULT)

3. **Deploy Service - GetArticle**
   
   a. Click "Deploy New Service"
   
   b. Fill in the details:
   - **Service name**: `GetArticle`
   - **Library**: `YOURLIB`
   - **Service program**: `FARTICLEAPI`
   - **Procedure**: `GETARTICLE`
   - **Description**: `Get article by ID`
   
   c. Configure parameters:
   - **Parameter 1**:
     - Name: `articleId`
     - Type: `CHAR(6)`
     - Usage: `INPUT`
   
   d. Configure return value:
   - Type: `VARCHAR(4096)`
   - Content type: `application/json`
   
   e. Set HTTP method: `GET`
   
   f. Set resource path: `/api/articles/{articleId}`
   
   g. Click "Deploy"

4. **Deploy Service - ListArticles**
   
   a. Click "Deploy New Service"
   
   b. Fill in the details:
   - **Service name**: `ListArticles`
   - **Library**: `YOURLIB`
   - **Service program**: `FARTICLEAPI`
   - **Procedure**: `LISTARTICLES`
   - **Description**: `Get paginated list of articles`
   
   c. Configure parameters:
   - **Parameter 1**:
     - Name: `page`
     - Type: `INT(10)`
     - Usage: `INPUT`
     - Default: `1`
   - **Parameter 2**:
     - Name: `pageSize`
     - Type: `INT(10)`
     - Usage: `INPUT`
     - Default: `14`
   - **Parameter 3** (Optional):
     - Name: `positionTo`
     - Type: `CHAR(6)`
     - Usage: `INPUT`
     - Optional: `Yes`
   - **Parameter 4** (Optional):
     - Name: `includeDeleted`
     - Type: `IND`
     - Usage: `INPUT`
     - Optional: `Yes`
   
   d. Configure return value:
   - Type: `VARCHAR(32000)`
   - Content type: `application/json`
   
   e. Set HTTP method: `GET`
   
   f. Set resource path: `/api/articles`
   
   g. Click "Deploy"

### Method 2: Using REST API to Deploy (Advanced)

You can also deploy using the IWS REST API itself. See IBM documentation for details.

## Step 3: Configure CORS (for React Frontend)

To allow the React application to call these APIs:

1. **In Web Administration**:
   - Navigate to your IWS server
   - Click "Manage Server"
   - Go to "CORS Configuration"

2. **Add CORS Rules**:
   ```
   Allowed Origins: http://localhost:3000
   Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
   Allowed Headers: Content-Type, Authorization
   Max Age: 3600
   ```

3. **Apply and restart** the IWS server if needed

## Step 4: Test the APIs

### Test GetArticle

```bash
# Using curl
curl -X GET "http://your-ibm-i:port/web/services/GetArticle/ART001" \
     -H "Accept: application/json"

# Expected response:
{
  "success": true,
  "message": "Article retrieved successfully",
  "article": {
    "id": "ART001",
    "description": "Laptop Computer 15 inch",
    "familyCode": "ELE",
    "familyDescription": "Electronics",
    "vatCode": "1",
    "vatRate": 20.00,
    "vatDescription": "Standard Rate",
    "salePrice": 899.99,
    "warehousePrice": 650.00,
    "stock": 25,
    "minimumQuantity": 10,
    "deleted": " ",
    "priceWithVAT": 1079.99
  }
}
```

### Test ListArticles

```bash
# Using curl - First page
curl -X GET "http://your-ibm-i:port/web/services/ListArticles?page=1&pageSize=14" \
     -H "Accept: application/json"

# With position-to
curl -X GET "http://your-ibm-i:port/web/services/ListArticles?page=1&pageSize=14&positionTo=ART010" \
     -H "Accept: application/json"

# Expected response:
{
  "success": true,
  "message": "Articles retrieved successfully",
  "pagination": {
    "currentPage": 1,
    "pageSize": 14,
    "totalRecords": 50,
    "totalPages": 4,
    "hasMore": true
  },
  "articles": [
    {
      "id": "ART001",
      "description": "Laptop Computer 15 inch",
      "familyCode": "ELE",
      "familyDescription": "Electronics",
      "vatCode": "1",
      "vatRate": 20.00,
      "salePrice": 899.99,
      "warehousePrice": 650.00,
      "stock": 25,
      "minimumQuantity": 10,
      "deleted": " "
    },
    ...
  ]
}
```

## Step 5: Update React Frontend Configuration

Update the `.env` file in your React application:

```env
VITE_API_BASE_URL=http://your-ibm-i:port/web/services
```

Update `src/services/api.config.ts`:

```typescript
export const API_ENDPOINTS = {
  articles: {
    list: '/ListArticles',
    detail: (id: string) => `/GetArticle/${id}`,
    // ... other endpoints
  },
};
```

## Troubleshooting

### Issue: Service program not found

**Solution**: Verify the service program exists and is in the correct library:
```
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI)
```

### Issue: Procedure not found

**Solution**: Check the exported symbols:
```
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) DETAIL(*EXPORT)
```

### Issue: SQL error in procedure

**Solution**: Check the job log:
```
DSPJOBLOG
```

### Issue: CORS errors in browser

**Solution**: 
1. Verify CORS configuration in IWS
2. Check browser console for specific error
3. Ensure IWS server is restarted after CORS changes

### Issue: JSON parsing error

**Solution**: Test the procedure directly:
```
CALL YOURLIB/FARTICLEAPI.GETARTICLE('ART001')
```

## Security Considerations

### 1. Authentication

Add authentication to your web services:

```
1. In IWS configuration, enable authentication
2. Choose authentication method:
   - Basic Authentication
   - Token-based (JWT)
   - IBM i User Profile
```

### 2. Authorization

Control access by:
- IBM i object authority
- User profile restrictions
- IP address filtering

### 3. HTTPS

Enable HTTPS for production:
```
1. Configure SSL certificate in HTTP Server
2. Update IWS to use HTTPS
3. Update React app to use https:// URLs
```

## Performance Optimization

### 1. Connection Pooling

IWS automatically manages connection pooling. Monitor with:
```
WRKACTJOB SBS(QHTTPSVR)
```

### 2. Caching

Consider implementing caching:
- HTTP cache headers
- Application-level caching
- Database result caching

### 3. Monitoring

Monitor web service performance:
```
1. Check IWS logs: /www/instance/logs
2. Monitor job performance: WRKACTJOB
3. Review SQL performance: STRDBMON
```

## Next Steps

1. ✅ **Read operations complete** - GetArticle and ListArticles deployed
2. 🔄 **Create operations** - Implement CreateArticle procedure
3. 🔄 **Update operations** - Implement UpdateArticle procedure
4. 🔄 **Delete operations** - Implement DeleteArticle procedure
5. 🔄 **Extended info** - Implement GetArticleInfo and UpdateArticleInfo
6. 🔄 **Lookups** - Implement GetFamilies and GetVATDefinitions

## Additional Resources

- [IBM i Integrated Web Services Documentation](https://www.ibm.com/docs/en/i/7.5?topic=services-integrated-web)
- [IBM HTTP Server for i](https://www.ibm.com/docs/en/i/7.5?topic=server-http-i)
- [REST API Best Practices](https://restfulapi.net/)

## Support

For issues or questions:
1. Check IBM i job logs: `DSPJOBLOG`
2. Review IWS server logs
3. Test procedures directly before deploying
4. Verify database connectivity and permissions

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-17  
**Author**: Article Management Modernization Project