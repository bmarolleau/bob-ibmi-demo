# Article REST API - Documentation

## 📚 Documentation Index

This directory contains comprehensive documentation for deploying and using the Article REST API with IBM i Integrated Web Services (IWS) and React frontend.

### Getting Started

1. **[01-QUICK-START.md](01-QUICK-START.md)** - Get up and running in 5 minutes
   - Compile service program
   - Deploy web service
   - Test API
   - Configure React app

2. **[02-FRONTEND-SETUP.md](02-FRONTEND-SETUP.md)** - React application configuration
   - Installation and setup
   - Environment configuration
   - Vite proxy setup
   - Data transformation
   - Running the application

3. **[03-IBM-i-DEPLOYMENT.md](03-IBM-i-DEPLOYMENT.md)** - IBM i Web Services deployment
   - IWS configuration
   - Service deployment
   - CORS setup
   - Security configuration
   - Monitoring and logging

4. **[04-TROUBLESHOOTING.md](04-TROUBLESHOOTING.md)** - Common issues and solutions
   - Service program issues
   - Web services deployment
   - API response problems
   - Frontend issues
   - Performance optimization

### Additional Resources

- **[IFS-COMPILATION-GUIDE.md](IFS-COMPILATION-GUIDE.md)** - Compiling from IFS (advanced)

## 🎯 Quick Reference

### Architecture

```
React Frontend (localhost:3000)
    ↓ (Vite Proxy)
IBM i Web Services (YOUR_IBM_I:PORT)
    ↓
FARTICLEAPI Service Program
    ↓
ARTICLE Database Table
```

### Key Files

| File | Purpose |
|------|---------|
| QRPGLESRC/ART400.SQLRPGLE | RPG service program module |
| QSRVSRC/FARTICLEAPI.BND | Binding source (exports) |
| QILESRVSRC/FARTICLEAPI.ILESRVPGM | Build script |
| article-management-web/.env | Frontend configuration |
| article-management-web/vite.config.ts | Proxy configuration |

### API Endpoint

```
GET http://YOUR_IBM_I:PORT/web/services/article/articles
```

Returns all articles in JSON format.

### Response Format

```json
{
  "article_GetArticles_R": [
    {
      "ARID": "ART001",
      "ARDESC": "Laptop Computer 15 inch",
      "ARSALEPR": 899.99,
      "ARWHSPR": 650.00,
      "ARTIFA": "ELE",
      "ARSTOCK": 25,
      "ARMINQTY": 10,
      "ARVATCD": "1",
      "ARDEL": ""
    }
  ]
}
```

## 🚀 Quick Start Commands

### IBM i

```bash
# Compile
CRTSQLRPGI OBJ(YOURLIB/ART400) SRCFILE(YOURLIB/QRPGLESRC) SRCMBR(ART400)
CRTSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) MODULE(YOURLIB/ART400) EXPORT(*SRCFILE)

# Verify
DSPSRVPGM SRVPGM(YOURLIB/FARTICLEAPI) DETAIL(*EXPORT)

# Test
curl http://YOUR_IBM_I:PORT/web/services/article/articles
```

### React Frontend

```bash
# Setup
cd article-management-web
npm install

# Configure (update YOUR_IBM_I and PORT in vite.config.ts)

# Run
npm run dev

# Build
npm run build
```

## 📋 Checklist

### IBM i Setup
- [ ] Service program compiled
- [ ] Web service deployed in IWS
- [ ] CORS configured
- [ ] API tested with curl

### Frontend Setup
- [ ] Dependencies installed
- [ ] .env configured
- [ ] vite.config.ts proxy configured
- [ ] Dev server running
- [ ] Articles displaying in browser

## 🔗 Related Documentation

- [IBM i Integrated Web Services](https://www.ibm.com/docs/en/i/7.5?topic=services-integrated-web)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Carbon Design System](https://carbondesignsystem.com/)

## 📝 Notes

- Replace `YOUR_IBM_I` with your IBM i hostname or IP address
- Replace `PORT` with your IWS port (typically 10026 or similar)
- Replace `YOURLIB` with your library name
- The API currently returns all articles (no pagination on IBM i side)
- Frontend implements client-side pagination and filtering

## 🆘 Need Help?

1. Check [04-TROUBLESHOOTING.md](04-TROUBLESHOOTING.md) for common issues
2. Review IBM i job logs: `DSPJOBLOG`
3. Check browser console (F12) for frontend errors
4. Test API directly with curl before testing frontend

## 📅 Version History

- **2025-12-17**: Initial documentation
  - Quick start guide
  - Frontend setup guide
  - IBM i deployment guide
  - Troubleshooting guide

---
*Made with Bob*