# Simple Article List API - Deployment Guide

## Overview

This is a simplified version that returns ALL articles in a single call (no pagination). IWS automatically converts the RPG data structure to JSON.

## Files

1. **QRPGLESRC/ART400.SQLRPGLE** - Simplified RPG module (123 lines)
2. **QSRVSRC/FARTICLEAPI.BND** - Binding source (exports LISTALLARTICLES)
3. **QILESRVSRC/FARTICLEAPI.ILESRVPGM** - Build script

## Step 1: Compile

```bash
# Compile the module
CRTSQLRPGI OBJ(SAMCO/ART400) +
          SRCSTMF('/home/benoit/projects/bob-ibmi-demo/QRPGLESRC/ART400.SQLRPGLE') +
          OBJTYPE(*MODULE) +
          DBGVIEW(*SOURCE) +
          REPLACE(*YES) +
          COMMIT(*NONE) +
          CLOSQLCSR(*ENDMOD) +
          COMPILEOPT('INCDIR(''/home/benoit/projects/bob-ibmi-demo/QPROTOSRC'' +
                             ''/home/benoit/projects/bob-ibmi-demo/includes'') +
                     TGTCCSID(297)')

# Copy binding source to member
CPYFRMSTMF FROMSTMF('/home/benoit/projects/bob-ibmi-demo/QSRVSRC/FARTICLEAPI.BND') +
           TOMBR('/QSYS.LIB/SAMCO.LIB/QSRVSRC.FILE/FARTICLEAPI.MBR') +
           MBROPT(*REPLACE)

# Create service program
CRTSRVPGM SRVPGM(SAMCO/FARTICLEAPI) +
          MODULE(SAMCO/ART400) +
          EXPORT(*SRCFILE) +
          SRCFILE(SAMCO/QSRVSRC) +
          SRCMBR(FARTICLEAPI) +
          TEXT('Article REST API') +
          REPLACE(*YES)

# Verify
DSPSRVPGM SRVPGM(SAMCO/FARTICLEAPI) DETAIL(*EXPORT)
```

Expected export: **LISTALLARTICLES**

## Step 2: Deploy in IWS

### Using Web Administration

1. Open: `http://your-ibm-i:2001/HTTPAdmin`
2. Navigate to: **IBM i Integrated Web Services Server**
3. Click: **Deploy New Service**

### Service Configuration

```
Service Name:       ListAllArticles
Library:            SAMCO
Service Program:    FARTICLEAPI
Procedure:          LISTALLARTICLES
Description:        Get all articles

HTTP Method:        GET
Resource Path:      /api/articles

Parameters:         (None)

Return Value:
  - Type:           Data Structure
  - Content-Type:   application/json
  - Let IWS handle JSON conversion: YES
```

### Important IWS Settings

- ✅ **Enable automatic JSON conversion**
- ✅ **Set Content-Type to application/json**
- ✅ **No manual JSON building needed** - IWS does it automatically

## Step 3: Configure CORS

In IWS Server configuration:

```
Allowed Origins:  http://localhost:3000
Allowed Methods:  GET, POST, PUT, DELETE, OPTIONS
Allowed Headers:  Content-Type, Authorization
Max Age:          3600
```

## Step 4: Test

```bash
curl -X GET "http://your-ibm-i:port/web/services/ListAllArticles" \
     -H "Accept: application/json"
```

### Expected JSON Response (IWS auto-generated)

```json
{
  "success": true,
  "message": "Articles retrieved successfully",
  "totalRecords": 50,
  "articleCount": 50,
  "articleData": [
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
    ...49 more articles
  ]
}
```

## Step 5: Update React Frontend

### Update API Configuration

Edit `article-management-web/src/services/api.config.ts`:

```typescript
export const API_ENDPOINTS = {
  articles: {
    list: '/ListAllArticles',  // Single endpoint, no pagination
  },
};
```

### Update Article Service

Edit `article-management-web/src/services/article.service.ts`:

```typescript
async getArticles(): Promise<ApiResponse<ArticleListResponse>> {
  // No parameters needed - gets all articles
  return apiClient.get<ArticleListResponse>(API_ENDPOINTS.articles.list);
}
```

### Update React Component

The `ArticleList` component will receive all articles at once:

```typescript
// In ArticleList.tsx
const loadArticles = async () => {
  setLoading(true);
  const response = await articleService.getArticles();
  
  if (response.success && response.data) {
    // IWS returns: { success, message, totalRecords, articleCount, articleData }
    setArticles(response.data.articleData);
    setTotalItems(response.data.totalRecords);
  }
  
  setLoading(false);
};
```

## Key Differences from Complex Version

| Feature | Simple Version | Complex Version |
|---------|---------------|-----------------|
| Pagination | ❌ No | ✅ Yes |
| JSON Building | ✅ IWS automatic | ❌ Manual in RPG |
| Parameters | ❌ None | ✅ page, pageSize, etc. |
| Max Records | 1000 | Unlimited (paginated) |
| Code Lines | 123 | 390 |
| Complexity | Low | High |

## Advantages

1. **✅ Simple** - Minimal code, easy to understand
2. **✅ IWS handles JSON** - No manual JSON building
3. **✅ No pagination logic** - Straightforward SQL
4. **✅ Fast development** - Quick to deploy and test
5. **✅ Good for small datasets** - Works well with <1000 articles

## Limitations

1. **❌ No pagination** - Loads all articles at once
2. **❌ Max 1000 articles** - Array dimension limit
3. **❌ No filtering** - Returns all non-deleted articles
4. **❌ More network traffic** - Sends all data every time
5. **❌ No position-to** - Can't jump to specific article

## When to Use

**Use Simple Version When:**
- You have < 500 articles
- You want quick development
- Pagination isn't critical
- You're prototyping/testing

**Use Complex Version When:**
- You have > 500 articles
- Performance is critical
- You need pagination
- You need advanced filtering

## Troubleshooting

### Issue: Empty articleData array

**Check:**
```sql
SELECT COUNT(*) FROM ARTICLE WHERE ARDEL = ' ';
```

If 0, run the sample data script:
```bash
RUNSQLSTM SRCFILE(SAMCO/QSQLSRC) SRCMBR(POPULATE_SAMPLE_DATA)
```

### Issue: IWS not converting to JSON

**Solution:** In IWS deployment:
- Ensure "Return Type" is set to "Data Structure"
- Enable "Automatic JSON conversion"
- Set Content-Type to "application/json"

### Issue: CORS error

**Solution:** Restart IWS server after CORS configuration:
```
ENDTCPSVR SERVER(*HTTP) HTTPSVR(instance)
STRTCPSVR SERVER(*HTTP) HTTPSVR(instance)
```

## Next Steps

1. ✅ **Deploy this simple version first**
2. ✅ **Test with React frontend**
3. ✅ **Verify data displays correctly**
4. 🔄 **Add pagination later** if needed
5. 🔄 **Add filtering** if needed
6. 🔄 **Add CRUD operations** (Create, Update, Delete)

## Performance Notes

- **50 articles**: ~5KB JSON, <100ms response
- **500 articles**: ~50KB JSON, <500ms response
- **1000 articles**: ~100KB JSON, <1s response

For better performance with large datasets, implement pagination.

---

**This simple version gets you up and running quickly!** 🚀

Test it, verify it works, then enhance as needed.