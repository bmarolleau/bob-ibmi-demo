# Troubleshooting Guide - Common Issues and Solutions

## Overview

This guide covers common issues you may encounter when deploying and using the Article REST API.

## IBM i Service Program Issues

### Issue: Service Program Not Found

**Error**: `Service program FARTICLEAPI not found in library YOURLIB`

**Solutions**:

1. Verify service program exists:
   ```bash
   DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI)
   ```

2. Check library list:
   ```bash
   DSPLIBL
   ```

3. Recompile if needed:
   ```bash
   CRTSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) +
             MODULE(YOURLIB/ART400) +
             EXPORT(*SRCFILE) +
             SRCFILE(YOURLIB/QSRVSRC) +
             SRCMBR(FARTICLEAPI)
   ```

### Issue: Procedure Not Exported

**Error**: `Procedure LISTALLARTICLES not found`

**Solutions**:

1. Check exported procedures:
   ```bash
   DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) DETAIL(*EXPORT)
   ```

2. Verify binding source (QSRVSRC/FARTICLEAPI):
   ```
   STRPGMEXP PGMLVL(*CURRENT)
   EXPORT SYMBOL('ListAllArticles')
   ENDPGMEXP
   ```

3. Recompile service program after fixing binding source

### Issue: SQL Compilation Errors

**Error**: `SQL0xxx errors during compilation`

**Solutions**:

1. Check include paths:
   ```bash
   CRTSQLRPGI ... COMPILEOPT('INCDIR(''/path/to/includes'')')
   ```

2. Verify ARTICLE table exists:
   ```sql
   SELECT * FROM QSYS2.SYSTABLES 
   WHERE TABLE_NAME = 'ARTICLE' 
   AND TABLE_SCHEMA = 'YOURLIB';
   ```

3. Check SQL syntax in source code

## Web Services Deployment Issues

### Issue: IWS Server Not Running

**Error**: Cannot access `http://YOUR_IBM_I:2001/HTTPAdmin`

**Solutions**:

1. Check HTTP server status:
   ```bash
   WRKACTJOB SBS(QHTTPSVR)
   ```

2. Start HTTP server:
   ```bash
   STRTCPSVR SERVER(*HTTP) HTTPSVR(YOUR_INSTANCE)
   ```

3. Check HTTP server configuration:
   ```bash
   WRKHTTPCFG
   ```

### Issue: Service Deployment Fails

**Error**: Deployment fails in Web Admin

**Solutions**:

1. Check job log:
   ```bash
   DSPJOBLOG
   ```

2. Verify user has authority:
   ```bash
   DSPOBJAUT OBJ(YOURLIB/FARTICLEAPI) OBJTYPE(*SRVPGM)
   ```

3. Check IWS server logs:
   ```bash
   tail -f /www/YOUR_INSTANCE/logs/error_log
   ```

### Issue: Service Returns 404

**Error**: `404 Not Found` when calling API

**Solutions**:

1. Verify service is deployed:
   - Check Web Admin service list
   - Look for service name in deployed services

2. Check resource path:
   ```bash
   # Correct
   curl http://YOUR_IBM_I:PORT/web/services/article/articles
   
   # Wrong
   curl http://YOUR_IBM_I:PORT/articles
   ```

3. Restart IWS server:
   ```bash
   ENDTCPSVR SERVER(*HTTP) HTTPSVR(YOUR_INSTANCE)
   STRTCPSVR SERVER(*HTTP) HTTPSVR(YOUR_INSTANCE)
   ```

## API Response Issues

### Issue: Empty Response

**Error**: API returns empty array or no data

**Solutions**:

1. Check ARTICLE table has data:
   ```sql
   SELECT COUNT(*) FROM YOURLIB/ARTICLE WHERE ARDEL = ' ';
   ```

2. Test procedure directly:
   ```bash
   CALL YOURLIB/FARTICLEAPI.LISTALLARTICLES
   ```

3. Check SQL WHERE clause in RPG code

4. Verify FAMILLY and VATDEF tables exist for JOINs

### Issue: Invalid JSON Response

**Error**: JSON parsing error in frontend

**Solutions**:

1. Test API with curl:
   ```bash
   curl http://YOUR_IBM_I:PORT/web/services/article/articles | jq .
   ```

2. Check for special characters in data:
   ```sql
   SELECT * FROM YOURLIB/ARTICLE 
   WHERE ARDESC LIKE '%"%' 
   OR ARDESC LIKE '%\%';
   ```

3. Verify IWS JSON conversion is enabled

4. Check RPG code for proper JSON escaping

### Issue: SQL Error in Response

**Error**: Response contains SQL error message

**Solutions**:

1. Check job log:
   ```bash
   DSPJOBLOG
   ```

2. Common SQL errors:
   - **SQL0204**: Table not found
   - **SQL0206**: Column not found
   - **SQL0312**: Variable not defined
   - **SQL0501**: Cursor already open

3. Test SQL statement in STRSQL:
   ```sql
   SELECT A.ARID, A.ARDESC, A.ARTIFA, F.FADESC
   FROM YOURLIB/ARTICLE A
   LEFT JOIN YOURLIB/FAMILLY F ON A.ARTIFA = F.FAID
   WHERE A.ARDEL = ' ';
   ```

## Frontend Issues

### Issue: Network Error / CORS

**Error**: `NetworkError when attempting to fetch resource`

**Solutions**:

1. Check Vite proxy configuration in `vite.config.ts`:
   ```typescript
   proxy: {
     '/web': {
       target: 'http://YOUR_IBM_I:PORT',
       changeOrigin: true,
       secure: false,
     }
   }
   ```

2. Restart dev server after config changes:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. Test API directly:
   ```bash
   curl http://YOUR_IBM_I:PORT/web/services/article/articles
   ```

4. Check browser console for specific error

### Issue: Empty Article List in UI

**Error**: Table shows "No articles found"

**Solutions**:

1. Open browser DevTools (F12)

2. Check Console for errors

3. Check Network tab:
   - Look for API request
   - Check response status (should be 200)
   - Verify response data

4. Check data transformation:
   ```javascript
   // In browser console
   fetch('/web/services/article/articles')
     .then(r => r.json())
     .then(data => console.log(data));
   ```

### Issue: TypeScript Compilation Errors

**Error**: Build fails with TypeScript errors

**Solutions**:

1. Clean and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check TypeScript version:
   ```bash
   npm list typescript
   ```

3. Run type check:
   ```bash
   npm run build
   ```

### Issue: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:

1. Kill process on port 3000:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or change port in `vite.config.ts`:
   ```typescript
   server: {
     port: 3001,
     ...
   }
   ```

## Performance Issues

### Issue: Slow API Response

**Problem**: API takes >2 seconds to respond

**Solutions**:

1. Check SQL performance:
   ```bash
   STRDBMON
   # Run API calls
   ENDDBMON
   # Analyze results
   ```

2. Add indexes:
   ```sql
   CREATE INDEX YOURLIB/ARTICLE1 
   ON YOURLIB/ARTICLE(ARID);
   ```

3. Optimize SQL query:
   - Remove unnecessary JOINs
   - Add WHERE clause early
   - Use FETCH FIRST n ROWS ONLY

4. Monitor active jobs:
   ```bash
   WRKACTJOB SBS(QHTTPSVR)
   ```

### Issue: High Memory Usage

**Problem**: Service program uses too much memory

**Solutions**:

1. Reduce array size in RPG:
   ```rpg
   // Change from
   articleData LikeDs(ArticleItem) Dim(1000);
   // To
   articleData LikeDs(ArticleItem) Dim(500);
   ```

2. Implement pagination

3. Use VARCHAR instead of CHAR for large fields

## Data Issues

### Issue: Special Characters Display Incorrectly

**Problem**: Accented characters show as �

**Solutions**:

1. Check CCSID in compilation:
   ```bash
   CRTSQLRPGI ... COMPILEOPT('TGTCCSID(1208)')
   ```

2. Set HTTP Server CCSID:
   ```
   In HTTP Server configuration:
   DefaultNetCCSID 1208
   ```

3. Verify database CCSID:
   ```sql
   SELECT TABLE_NAME, CCSID 
   FROM QSYS2.SYSTABLES 
   WHERE TABLE_NAME = 'ARTICLE';
   ```

### Issue: Decimal Values Incorrect

**Problem**: Prices show as 89999 instead of 899.99

**Solutions**:

1. Check field definitions in RPG:
   ```rpg
   Dcl-S salePrice Packed(7:2);  // Correct
   ```

2. Verify JSON conversion preserves decimals

3. Check frontend number formatting

## Getting Help

### Collect Diagnostic Information

Before asking for help, collect:

1. **Job log**:
   ```bash
   DSPJOBLOG OUTPUT(*PRINT)
   ```

2. **Service program details**:
   ```bash
   DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) DETAIL(*EXPORT)
   ```

3. **IWS logs**:
   ```bash
   /www/YOUR_INSTANCE/logs/error_log
   ```

4. **Browser console errors** (F12 → Console)

5. **Network tab** (F12 → Network)

### IBM i Resources

- IBM i Documentation: https://www.ibm.com/docs/en/i
- IBM i Community: https://www.ibm.com/community/ibmi/
- Redbooks: https://www.redbooks.ibm.com/

### React/Frontend Resources

- Vite Documentation: https://vitejs.dev/
- React Documentation: https://react.dev/
- Carbon Design System: https://carbondesignsystem.com/

---
*Made with Bob*