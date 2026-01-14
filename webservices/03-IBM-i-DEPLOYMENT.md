# IBM i Deployment Guide - Web Services Configuration

## Overview

This guide covers deploying the Article REST API on IBM i using Integrated Web Services (IWS).

## Prerequisites

- IBM i 7.3 or higher
- IBM HTTP Server for i configured and running
- IWS Server installed and configured
- Authority to create web services
- Service program compiled (see `01-QUICK-START.md`)

## Deployment Methods

### Method 1: Web Administration GUI (Recommended)

#### Access Web Admin

1. Open browser: `http://YOUR_IBM_I:2001/HTTPAdmin`
2. Login with IBM i credentials
3. Navigate to: **IBM i Integrated Web Services Server**
4. Select your server instance (usually DEFAULT)

#### Deploy the Service

1. Click **Deploy New Service**

2. **Basic Information**:
   ```
   Service Name:       articles
   Library:            YOURLIB
   Service Program:    FARTICLEAPI
   Procedure:          ListAllArticles
   Description:        Get all articles from ARTICLE table
   ```

3. **HTTP Configuration**:
   ```
   HTTP Method:        GET
   Resource Path:      /articles
   ```

4. **Parameters**: None (this procedure takes no parameters)

5. **Return Value**:
   ```
   Type:               Data Structure
   Content-Type:       application/json
   Auto JSON:          YES (Enable automatic JSON conversion)
   ```

6. Click **Deploy**

7. Verify deployment in service list

### Method 2: Command Line (Advanced)

Use IWS REST API to deploy programmatically. See IBM documentation for details.

## Service Program Details

### Exported Procedure

```
Procedure Name:  ListAllArticles
Parameters:      None
Returns:         Data Structure (ArticleListResponse)
```

### Data Structure

The procedure returns a qualified data structure:

```rpg
Dcl-Ds ArticleListResponse Qualified;
  success Char(1);           // 'Y' or 'N'
  message Char(256);
  totalRecords Int(10);
  jsonData Char(32000);      // JSON string
End-Ds;
```

IWS automatically converts this to JSON.

## Testing the Deployment

### Test with curl

```bash
# Basic test
curl "http://YOUR_IBM_I:PORT/web/services/article/articles"

# With headers
curl -X GET "http://YOUR_IBM_I:PORT/web/services/article/articles" \
     -H "Accept: application/json"

# Pretty print JSON
curl "http://YOUR_IBM_I:PORT/web/services/article/articles" | jq .
```

### Expected Response

```json
{
  "success": "Y",
  "message": "Articles retrieved successfully",
  "totalRecords": 50,
  "jsonData": "{\"articles\":[{\"id\":\"ART001\",\"description\":\"Laptop Computer 15 inch\",...}]}"
}
```

Or if using PCML auto-conversion:

```json
{
  "article_GetArticles_R": [
    {
      "ARID": "ART001",
      "ARDESC": "Laptop Computer 15 inch",
      "ARSALEPR": 899.99,
      ...
    }
  ]
}
```

## CORS Configuration (for React Frontend)

### Enable CORS in IWS

1. In Web Administration, go to your IWS server
2. Click **Manage Server**
3. Go to **CORS Configuration**
4. Add CORS rules:

```
Allowed Origins:  http://localhost:3000
Allowed Methods:  GET, POST, PUT, DELETE, OPTIONS
Allowed Headers:  Content-Type, Authorization
Max Age:          3600
```

5. **Save** and **Restart** IWS server if needed

### Restart IWS Server

```bash
ENDTCPSVR SERVER(*HTTP) HTTPSVR(YOUR_INSTANCE)
STRTCPSVR SERVER(*HTTP) HTTPSVR(YOUR_INSTANCE)
```

## Security Configuration

### Authentication

For production, enable authentication:

1. In IWS configuration, enable authentication
2. Choose method:
   - **Basic Authentication**: Simple username/password
   - **Token-based (JWT)**: More secure, stateless
   - **IBM i User Profile**: Use IBM i credentials

### Authorization

Control access using:
- IBM i object authority
- User profile restrictions
- IP address filtering

### HTTPS

Enable HTTPS for production:

1. Configure SSL certificate in HTTP Server
2. Update IWS to use HTTPS
3. Update React app to use `https://` URLs

## Monitoring and Logging

### View IWS Logs

```bash
# Log location
/www/YOUR_INSTANCE/logs/

# View access log
tail -f /www/YOUR_INSTANCE/logs/access_log

# View error log
tail -f /www/YOUR_INSTANCE/logs/error_log
```

### Monitor Active Jobs

```bash
# View HTTP server jobs
WRKACTJOB SBS(QHTTPSVR)

# View specific job
WRKJOB JOB(job_number/user/job_name)
```

### Check Service Program

```bash
# Display service program
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI)

# Display exported procedures
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) DETAIL(*EXPORT)
```

## Performance Optimization

### Connection Pooling

IWS automatically manages connection pooling. Monitor with:

```bash
WRKACTJOB SBS(QHTTPSVR)
```

### Caching

Consider implementing:
- HTTP cache headers
- Application-level caching
- Database result caching

### SQL Performance

Monitor SQL performance:

```bash
# Start database monitor
STRDBMON

# Run your API calls

# End and analyze
ENDDBMON
```

## Troubleshooting

### Service Program Not Found

```bash
# Verify service program exists
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI)

# Check library list
DSPLIBL
```

### Procedure Not Found

```bash
# Check exported procedures
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) DETAIL(*EXPORT)

# Should show: LISTALLARTICLES
```

### SQL Error in Procedure

```bash
# Check job log
DSPJOBLOG

# Look for SQL errors (SQL0xxx messages)
```

### Empty Response

```bash
# Test procedure directly
CALL YOURLIB/FARTICLEAPI.LISTALLARTICLES

# Check ARTICLE table
RUNQRY QRY(*NONE) QRYFILE((YOURLIB/ARTICLE))
```

### CORS Errors

1. Verify CORS configuration in IWS
2. Check browser console for specific error
3. Restart IWS server after CORS changes
4. Test with curl (no CORS restrictions)

## Production Checklist

- [ ] Service program compiled with DBGVIEW(*NONE)
- [ ] Web service deployed and tested
- [ ] CORS configured for production domain
- [ ] Authentication enabled
- [ ] HTTPS configured
- [ ] Logging enabled
- [ ] Monitoring in place
- [ ] Backup procedures documented

## Next Steps

- See `04-TROUBLESHOOTING.md` for common issues
- See `05-ADVANCED-FEATURES.md` for implementing CRUD operations
- See IBM i documentation for advanced IWS features

## Additional Resources

- [IBM i Integrated Web Services Documentation](https://www.ibm.com/docs/en/i/7.5?topic=services-integrated-web)
- [IBM HTTP Server for i](https://www.ibm.com/docs/en/i/7.5?topic=server-http-i)
- [REST API Best Practices](https://restfulapi.net/)

---
*Made with Bob*