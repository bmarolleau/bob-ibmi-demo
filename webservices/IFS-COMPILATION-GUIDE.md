# IFS Compilation Guide for Article REST API

## Overview

This guide provides instructions for compiling the Article REST API service program from IFS (Integrated File System) source files, not from source members.

## Prerequisites

- Source files in IFS: `/home/benoit/projects/bob-ibmi-demo/`
- IBM i 7.3 or higher
- Authority to create objects in target library

## Compilation Commands for IFS

### Step 1: Compile the RPG Module

```bash
CRTSQLRPGI OBJ(SAMCO/ART400) +
          SRCSTMF('/home/benoit/projects/bob-ibmi-demo/QRPGLESRC/ART400.SQLRPGLE') +
          OBJTYPE(*MODULE) +
          DBGVIEW(*SOURCE) +
          REPLACE(*YES) +
          COMMIT(*NONE) +
          CLOSQLCSR(*ENDMOD) +
          OPTION(*EVENTF) +
          OUTPUT(*PRINT) +
          COMPILEOPT('INCDIR(''/home/benoit/projects/bob-ibmi-demo/QPROTOSRC'' +
                             ''/home/benoit/projects/bob-ibmi-demo/includes'') +
                     TGTCCSID(297)')
```
Example
```bash
CRTSQLRPGI OBJ(SAMCO/ART400) SRCSTMF('/home/benoit/projects/bob-ibmi-demo/
QRPGLESRC/ART400.SQLRPGLE') OBJTYPE(*MODULE)  DBGVIEW(*SOURCE) REPLACE(*YES) COM
MIT(*NONE)  RPGPPOPT(*LVL2) CLOSQLCSR(*ENDMOD) OPTION(*EVENTF) OUTPUT(*PRINT) TG
TRLS() COMPILEOPT('INCDIR(''/home/benoit/projects/bob-ibmi-demo/QPROTOSRC'' ''/h
ome/benoit/projects/bob-ibmi-demo/includes'') OPTIMIZE() TGTCCSID(297)')         
```

**Key Parameters Explained:**
- `SRCSTMF` - Source stream file (IFS path)
- `INCDIR` - Include directories for /include or /copy directives
- `TGTCCSID(297)` - Target CCSID (French)
- `CLOSQLCSR(*ENDMOD)` - Close SQL cursors at module end
- `COMMIT(*NONE)` - No commitment control

### Step 2: Create the Service Program

```bash
CRTSRVPGM SRVPGM(SAMCO/FARTICLEAPI) +
          MODULE(SAMCO/ART400) +
          EXPORT(*SRCFILE) +
          SRCFILE(SAMCO/QSRVSRC) +
          SRCMBR(FARTICLEAPI) +
          TEXT('Article REST API Service Program') +
          REPLACE(*YES)
```

**Note**: The binding source (FARTICLEAPI.BND) must be in a source member, not IFS.

### Alternative: Create Binding Source from IFS

If you want to keep everything in IFS, create the binding source in a member first:

```bash
# Copy binding source to member
CPYFRMSTMF FROMSTMF('/home/benoit/projects/bob-ibmi-demo/QSRVSRC/FARTICLEAPI.BND') +
           TOMBR('/QSYS.LIB/SAMCO.LIB/QSRVSRC.FILE/FARTICLEAPI.MBR') +
           MBROPT(*REPLACE)

# Then create service program
CRTSRVPGM SRVPGM(SAMCO/FARTICLEAPI) +
          MODULE(SAMCO/ART400) +
          EXPORT(*SRCFILE) +
          SRCFILE(SAMCO/QSRVSRC) +
          SRCMBR(FARTICLEAPI) +
          REPLACE(*YES)
```

### Step 3: Verify Creation

```bash
# Check module
DSPPGM PGM(SAMCO/ART400) DETAIL(*MODULE)

# Check service program
DSPSRVPGM SRVPGM(SAMCO/FARTICLEAPI)

# Check exported procedures
DSPSRVPGM SRVPGM(SAMCO/FARTICLEAPI) DETAIL(*EXPORT)
```

Expected exports:
- GETARTICLE
- LISTARTICLES

## Complete Build Script for IFS

Create a shell script: `build-article-api.sh`

```bash
#!/bin/bash

# Configuration
LIB="SAMCO"
PROJECT_DIR="/home/benoit/projects/bob-ibmi-demo"

echo "Building Article REST API Service Program..."

# Step 1: Compile RPG module
echo "Step 1: Compiling ART400 module..."
system "CRTSQLRPGI OBJ($LIB/ART400) +
       SRCSTMF('$PROJECT_DIR/QRPGLESRC/ART400.SQLRPGLE') +
       OBJTYPE(*MODULE) +
       DBGVIEW(*SOURCE) +
       REPLACE(*YES) +
       COMMIT(*NONE) +
       CLOSQLCSR(*ENDMOD) +
       COMPILEOPT('INCDIR(''$PROJECT_DIR/QPROTOSRC'' +
                          ''$PROJECT_DIR/includes'') +
                  TGTCCSID(297)')"

if [ $? -ne 0 ]; then
    echo "ERROR: Module compilation failed"
    exit 1
fi

# Step 2: Copy binding source to member
echo "Step 2: Copying binding source..."
system "CPYFRMSTMF FROMSTMF('$PROJECT_DIR/QSRVSRC/FARTICLEAPI.BND') +
       TOMBR('/QSYS.LIB/$LIB.LIB/QSRVSRC.FILE/FARTICLEAPI.MBR') +
       MBROPT(*REPLACE)"

# Step 3: Create service program
echo "Step 3: Creating service program..."
system "CRTSRVPGM SRVPGM($LIB/FARTICLEAPI) +
       MODULE($LIB/ART400) +
       EXPORT(*SRCFILE) +
       SRCFILE($LIB/QSRVSRC) +
       SRCMBR(FARTICLEAPI) +
       TEXT('Article REST API') +
       REPLACE(*YES)"

if [ $? -ne 0 ]; then
    echo "ERROR: Service program creation failed"
    exit 1
fi

# Step 4: Verify
echo "Step 4: Verifying..."
system "DSPSRVPGM SRVPGM($LIB/FARTICLEAPI) DETAIL(*EXPORT)"

echo "Build complete!"
```

Make it executable:
```bash
chmod +x build-article-api.sh
./build-article-api.sh
```

## Using Makefile (Recommended)

If you're using GNU Make, add to your `Rules.mk`:

```makefile
# Article REST API Service Program
$(LIBL)/FARTICLEAPI.SRVPGM: $(LIBL)/ART400.MODULE QSRVSRC/FARTICLEAPI.BND
	-system -qi "CPYFRMSTMF FROMSTMF('$(CURDIR)/QSRVSRC/FARTICLEAPI.BND') \
	            TOMBR('/QSYS.LIB/$(BIN_LIB).LIB/QSRVSRC.FILE/FARTICLEAPI.MBR') \
	            MBROPT(*REPLACE)"
	system -qi "CRTSRVPGM SRVPGM($(BIN_LIB)/FARTICLEAPI) \
	            MODULE($(BIN_LIB)/ART400) \
	            EXPORT(*SRCFILE) \
	            SRCFILE($(BIN_LIB)/QSRVSRC) \
	            SRCMBR(FARTICLEAPI) \
	            REPLACE(*YES)"

$(LIBL)/ART400.MODULE: QRPGLESRC/ART400.SQLRPGLE
	system -qi "CRTSQLRPGI OBJ($(BIN_LIB)/ART400) \
	            SRCSTMF('$(CURDIR)/QRPGLESRC/ART400.SQLRPGLE') \
	            OBJTYPE(*MODULE) \
	            DBGVIEW(*SOURCE) \
	            REPLACE(*YES) \
	            COMMIT(*NONE) \
	            CLOSQLCSR(*ENDMOD) \
	            COMPILEOPT('INCDIR(''$(CURDIR)/QPROTOSRC'' \
	                               ''$(CURDIR)/includes'') \
	                       TGTCCSID(297)')"
```

Then build with:
```bash
gmake FARTICLEAPI.SRVPGM
```

## Troubleshooting IFS Compilation

### Issue: "Stream file not found"

**Solution**: Verify the path exists:
```bash
ls -la /home/benoit/projects/bob-ibmi-demo/QRPGLESRC/ART400.SQLRPGLE
```

### Issue: "Include directory not found"

**Solution**: Check INCDIR paths:
```bash
ls -la /home/benoit/projects/bob-ibmi-demo/QPROTOSRC/
ls -la /home/benoit/projects/bob-ibmi-demo/includes/
```

### Issue: "Authority failure"

**Solution**: Check file permissions:
```bash
chmod 755 /home/benoit/projects/bob-ibmi-demo/QRPGLESRC/ART400.SQLRPGLE
```

### Issue: "SQL precompiler error"

**Solution**: Check SQL syntax and table names:
```bash
# View compilation output
WRKSPLF SELECT(SAMCO)
```

### Issue: "Binding source not found"

**Solution**: Ensure QSRVSRC source file exists:
```bash
system "CRTSRCPF FILE(SAMCO/QSRVSRC) RCDLEN(112)"
```

## Best Practices for IFS Compilation

1. **Use absolute paths** in SRCSTMF and INCDIR
2. **Keep binding sources in members** (CRTSRVPGM limitation)
3. **Use REPLACE(*YES)** for iterative development
4. **Check CCSID** matches your source files (297 for French)
5. **Use DBGVIEW(*SOURCE)** for debugging
6. **Verify exports** after service program creation

## Quick Reference

### Compile from IFS
```bash
CRTSQLRPGI OBJ(LIB/MODULE) +
          SRCSTMF('/path/to/file.sqlrpgle') +
          OBJTYPE(*MODULE) +
          COMMIT(*NONE) +
          COMPILEOPT('INCDIR(''/path/to/includes'')')
```

### Create Service Program
```bash
# Copy binding source first
CPYFRMSTMF FROMSTMF('/path/to/file.BND') +
           TOMBR('/QSYS.LIB/LIB.LIB/QSRVSRC.FILE/NAME.MBR')

# Create service program
CRTSRVPGM SRVPGM(LIB/SRVPGM) +
          MODULE(LIB/MODULE) +
          EXPORT(*SRCFILE) +
          SRCFILE(LIB/QSRVSRC) +
          SRCMBR(NAME)
```

### Verify
```bash
DSPSRVPGM SRVPGM(LIB/SRVPGM) DETAIL(*EXPORT)
```

## Next Steps

After successful compilation:
1. Deploy web services in IWS (see `ArticleAPI-IWS-Config.md`)
2. Configure CORS for React frontend
3. Test endpoints with curl
4. Update React app configuration

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-17  
**Tested On**: IBM i 7.5, PASE environment