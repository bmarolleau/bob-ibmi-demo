# RPG Service Program Specifications

## Overview

This document specifies the RPG Service Programs (SRVPGM) required to support the REST API endpoints for the Article Management application. These service programs will encapsulate business logic and data access, exposing procedures that can be called by the REST API layer.

---

## 1. Service Program Architecture

### Design Principles

1. **Separation of Concerns**: Each service program handles a specific domain
2. **Stateless Operations**: Procedures don't maintain state between calls
3. **JSON Communication**: All procedures accept/return JSON strings for easy REST integration
4. **Error Handling**: Consistent error reporting through JSON error objects
5. **Transaction Management**: Proper commit control for data integrity
6. **Reusability**: Procedures can be called from REST APIs, RPG programs, or other service programs

### Service Program Structure

```
FARTICLESRV (Article Service Program)
├── Article CRUD operations
├── Article information management
└── Article validation

FLOOKUPSRV (Lookup Service Program)
├── Family operations
├── VAT code operations
└── Utility calculations

FCOMMONSRV (Common Service Program)
├── JSON utilities
├── Error handling
└── Validation helpers
```

---

## 2. FARTICLESRV - Article Service Program

### Source File Structure

**Binding Directory**: `QBNDSRC/FARTICLE.BND`
```
STRPGMEXP  PGMLVL(*CURRENT) SIGNATURE('FARTICLESRV V1.0')

  EXPORT SYMBOL('GetArticleList')
  EXPORT SYMBOL('GetArticle')
  EXPORT SYMBOL('CreateArticle')
  EXPORT SYMBOL('UpdateArticle')
  EXPORT SYMBOL('DeleteArticle')
  EXPORT SYMBOL('GetArticleInformation')
  EXPORT SYMBOL('UpdateArticleInformation')
  EXPORT SYMBOL('ValidateArticle')

ENDPGMEXP
```

**Service Program Source**: `QSRVSRC/FARTICLESRV.SQLRPGLE`

---

### 2.1 GetArticleList Procedure

**Purpose**: Retrieve paginated list of articles with optional filtering and sorting

**Prototype**:
```rpgle
**FREE

///
// Get paginated list of articles
// @param pPage - Page number (1-based)
// @param pPageSize - Number of records per page
// @param pSearch - Search term for description (optional)
// @param pPositionTo - Position to description (optional)
// @param pSortBy - Sort field: 'ID', 'DESC', 'FAM' (optional)
// @param pSortOrder - Sort order: 'ASC' or 'DESC' (optional)
// @param pIncludeDeleted - Include deleted articles (optional)
// @return JSON string with article list and pagination info
///
dcl-proc GetArticleList export;
  dcl-pi *n varchar(32000);
    pPage int(10) const;
    pPageSize int(10) const;
    pSearch varchar(50) const options(*nopass);
    pPositionTo varchar(50) const options(*nopass);
    pSortBy varchar(20) const options(*nopass);
    pSortOrder varchar(4) const options(*nopass);
    pIncludeDeleted ind const options(*nopass);
  end-pi;
  
  dcl-s jsonResult varchar(32000);
  dcl-s search varchar(50);
  dcl-s positionTo varchar(50);
  dcl-s sortBy varchar(20);
  dcl-s sortOrder varchar(4);
  dcl-s includeDeleted ind;
  dcl-s offset int(10);
  dcl-s totalCount int(10);
  dcl-s sqlStmt varchar(2000);
  
  // Handle optional parameters
  if %parms() >= 3;
    search = pSearch;
  else;
    search = '';
  endif;
  
  if %parms() >= 4;
    positionTo = pPositionTo;
  else;
    positionTo = '';
  endif;
  
  if %parms() >= 5;
    sortBy = pSortBy;
  else;
    sortBy = 'DESC';
  endif;
  
  if %parms() >= 6;
    sortOrder = pSortOrder;
  else;
    sortOrder = 'ASC';
  endif;
  
  if %parms() >= 7;
    includeDeleted = pIncludeDeleted;
  else;
    includeDeleted = *off;
  endif;
  
  // Calculate offset
  offset = (pPage - 1) * pPageSize;
  
  // Build dynamic SQL
  exec sql set option commit = *none;
  
  // Get total count
  exec sql
    select count(*)
    into :totalCount
    from article a
    left join familly f on a.artifa = f.faid
    left join vatdef v on a.arvatcd = v.vatcode
    where (:search = '' or upper(a.ardesc) like '%' || upper(:search) || '%')
      and (:positionTo = '' or a.ardesc >= :positionTo)
      and (:includeDeleted = '1' or a.ardel <> 'X');
  
  // Build JSON response
  jsonResult = buildArticleListJson(
    pPage: pPageSize: offset: totalCount: 
    search: positionTo: sortBy: sortOrder: includeDeleted
  );
  
  return jsonResult;
end-proc;
```

**Implementation Notes**:
- Use SQL cursor for efficient pagination
- Join with FAMILLY and VATDEF for descriptions
- Support case-insensitive search
- Calculate total pages and navigation flags
- Return JSON with structure matching API specification

---

### 2.2 GetArticle Procedure

**Purpose**: Retrieve single article by ID with all related data

**Prototype**:
```rpgle
///
// Get single article by ID
// @param pArticleId - Article ID (6 characters)
// @return JSON string with article data or error
///
dcl-proc GetArticle export;
  dcl-pi *n varchar(4000);
    pArticleId char(6) const;
  end-pi;
  
  dcl-s jsonResult varchar(4000);
  dcl-ds article extname('ARTICLE') qualified;
  dcl-s familyDesc varchar(50);
  dcl-s vatRate packed(4:2);
  dcl-s vatDesc varchar(20);
  dcl-s priceWithVAT packed(9:2);
  dcl-s found ind;
  
  exec sql set option commit = *none;
  
  // Fetch article with related data
  exec sql
    select a.arid, a.ardesc, a.arsalepr, a.arwhspr, a.artifa,
           a.arstock, a.arminqty, a.arcusqty, a.arpurqty,
           a.arvatcd, a.arcrea, a.armod, a.armodid, a.ardel,
           f.fadesc, v.vatrate, v.vatdesc
    into :article.arid, :article.ardesc, :article.arsalepr,
         :article.arwhspr, :article.artifa, :article.arstock,
         :article.arminqty, :article.arcusqty, :article.arpurqty,
         :article.arvatcd, :article.arcrea, :article.armod,
         :article.armodid, :article.ardel,
         :familyDesc, :vatRate, :vatDesc
    from article a
    left join familly f on a.artifa = f.faid
    left join vatdef v on a.arvatcd = v.vatcode
    where a.arid = :pArticleId;
  
  if sqlcode = 0;
    // Calculate price with VAT
    priceWithVAT = article.arsalepr * (1 + vatRate / 100);
    
    // Build JSON response
    jsonResult = buildArticleJson(
      article: familyDesc: vatRate: vatDesc: priceWithVAT
    );
  else;
    // Article not found
    jsonResult = buildErrorJson('NOT_FOUND': 
      'Article ' + %trim(pArticleId) + ' not found');
  endif;
  
  return jsonResult;
end-proc;
```

---

### 2.3 CreateArticle Procedure

**Purpose**: Create new article with validation

**Prototype**:
```rpgle
///
// Create new article
// @param pJsonInput - JSON string with article data
// @param pUserId - User ID for audit fields
// @return JSON string with created article or error
///
dcl-proc CreateArticle export;
  dcl-pi *n varchar(4000);
    pJsonInput varchar(4000) const;
    pUserId char(11) const;
  end-pi;
  
  dcl-s jsonResult varchar(4000);
  dcl-ds article extname('ARTICLE') qualified;
  dcl-s newId char(6);
  dcl-s validationErrors varchar(1000);
  
  exec sql set option commit = *none;
  
  // Parse JSON input
  parseArticleJson(pJsonInput: article);
  
  // Validate input
  validationErrors = ValidateArticle(article);
  if validationErrors <> '';
    return buildErrorJson('VALIDATION_ERROR': validationErrors);
  endif;
  
  // Generate next article ID
  exec sql
    select max(arid) into :newId from article;
  
  if sqlcode = 0 and newId <> '';
    newId = %char(%dec(newId: 6: 0) + 1);
  else;
    newId = '000001';
  endif;
  
  // Set system fields
  article.arid = newId;
  article.arcrea = %date();
  article.armod = %timestamp();
  article.armodid = pUserId;
  article.ardel = '';
  
  // Insert article
  exec sql
    insert into article values(
      :article.arid, :article.ardesc, :article.arsalepr,
      :article.arwhspr, :article.artifa, :article.arstock,
      :article.arminqty, :article.arcusqty, :article.arpurqty,
      :article.arvatcd, :article.arcrea, :article.armod,
      :article.armodid, :article.ardel
    );
  
  if sqlcode = 0;
    // Return created article
    jsonResult = GetArticle(newId);
  else;
    jsonResult = buildErrorJson('DATABASE_ERROR': 
      'Failed to create article: ' + %trim(sqlermtxt));
  endif;
  
  return jsonResult;
end-proc;
```

---

### 2.4 UpdateArticle Procedure

**Purpose**: Update existing article with validation

**Prototype**:
```rpgle
///
// Update existing article
// @param pArticleId - Article ID to update
// @param pJsonInput - JSON string with updated data
// @param pUserId - User ID for audit fields
// @return JSON string with updated article or error
///
dcl-proc UpdateArticle export;
  dcl-pi *n varchar(4000);
    pArticleId char(6) const;
    pJsonInput varchar(4000) const;
    pUserId char(11) const;
  end-pi;
  
  dcl-s jsonResult varchar(4000);
  dcl-ds article extname('ARTICLE') qualified;
  dcl-s validationErrors varchar(1000);
  
  exec sql set option commit = *none;
  
  // Check if article exists
  exec sql
    select * into :article from article
    where arid = :pArticleId;
  
  if sqlcode <> 0;
    return buildErrorJson('NOT_FOUND': 
      'Article ' + %trim(pArticleId) + ' not found');
  endif;
  
  // Parse JSON input (only update provided fields)
  parseArticleJson(pJsonInput: article);
  
  // Validate input
  validationErrors = ValidateArticle(article);
  if validationErrors <> '';
    return buildErrorJson('VALIDATION_ERROR': validationErrors);
  endif;
  
  // Update system fields
  article.armod = %timestamp();
  article.armodid = pUserId;
  
  // Update article
  exec sql
    update article set
      ardesc = :article.ardesc,
      arsalepr = :article.arsalepr,
      arwhspr = :article.arwhspr,
      artifa = :article.artifa,
      arstock = :article.arstock,
      arminqty = :article.arminqty,
      arvatcd = :article.arvatcd,
      armod = :article.armod,
      armodid = :article.armodid
    where arid = :pArticleId;
  
  if sqlcode = 0;
    // Return updated article
    jsonResult = GetArticle(pArticleId);
  else;
    jsonResult = buildErrorJson('DATABASE_ERROR': 
      'Failed to update article: ' + %trim(sqlermtxt));
  endif;
  
  return jsonResult;
end-proc;
```

---

### 2.5 DeleteArticle Procedure

**Purpose**: Soft delete article (set ARDEL flag)

**Prototype**:
```rpgle
///
// Delete article (soft delete)
// @param pArticleId - Article ID to delete
// @param pUserId - User ID for audit fields
// @return JSON string with deletion confirmation or error
///
dcl-proc DeleteArticle export;
  dcl-pi *n varchar(1000);
    pArticleId char(6) const;
    pUserId char(11) const;
  end-pi;
  
  dcl-s jsonResult varchar(1000);
  dcl-s timestamp timestamp;
  
  exec sql set option commit = *none;
  
  timestamp = %timestamp();
  
  // Update delete flag
  exec sql
    update article set
      ardel = 'X',
      armod = :timestamp,
      armodid = :pUserId
    where arid = :pArticleId;
  
  if sqlcode = 0;
    jsonResult = '{"success":true,"data":{"id":"' + %trim(pArticleId) + 
      '","deleted":true,"deletedAt":"' + formatTimestamp(timestamp) + 
      '","deletedBy":"' + %trim(pUserId) + '"}}';
  else;
    jsonResult = buildErrorJson('NOT_FOUND': 
      'Article ' + %trim(pArticleId) + ' not found');
  endif;
  
  return jsonResult;
end-proc;
```

---

### 2.6 GetArticleInformation Procedure

**Purpose**: Retrieve extended article information text

**Prototype**:
```rpgle
///
// Get article information (extended text)
// @param pArticleId - Article ID
// @return JSON string with information or empty
///
dcl-proc GetArticleInformation export;
  dcl-pi *n varchar(2000);
    pArticleId char(6) const;
  end-pi;
  
  dcl-s jsonResult varchar(2000);
  dcl-s information varchar(1520);
  dcl-s lastModified timestamp;
  
  exec sql set option commit = *none;
  
  exec sql
    select article_information, current_timestamp
    into :information, :lastModified
    from artiinf
    where article_info_id = :pArticleId;
  
  if sqlcode = 0;
    jsonResult = '{"success":true,"data":{"articleId":"' + 
      %trim(pArticleId) + '","information":"' + 
      escapeJson(information) + '","lastModified":"' + 
      formatTimestamp(lastModified) + '"}}';
  else;
    // No information exists - return empty
    jsonResult = '{"success":true,"data":{"articleId":"' + 
      %trim(pArticleId) + '","information":"","lastModified":null}}';
  endif;
  
  return jsonResult;
end-proc;
```

---

### 2.7 UpdateArticleInformation Procedure

**Purpose**: Create or update article information text

**Prototype**:
```rpgle
///
// Update article information (extended text)
// @param pArticleId - Article ID
// @param pInformation - Information text (max 1520 chars)
// @return JSON string with updated information or error
///
dcl-proc UpdateArticleInformation export;
  dcl-pi *n varchar(2000);
    pArticleId char(6) const;
    pInformation varchar(1520) const;
  end-pi;
  
  dcl-s jsonResult varchar(2000);
  dcl-s exists ind;
  dcl-s timestamp timestamp;
  
  exec sql set option commit = *none;
  
  timestamp = %timestamp();
  
  // Check if record exists
  exec sql
    select '1' into :exists from artiinf
    where article_info_id = :pArticleId;
  
  if sqlcode = 0;
    // Update existing
    exec sql
      update artiinf set
        article_information = :pInformation
      where article_info_id = :pArticleId;
  else;
    // Insert new
    exec sql
      insert into artiinf values(:pArticleId, :pInformation);
  endif;
  
  if sqlcode = 0;
    jsonResult = '{"success":true,"data":{"articleId":"' + 
      %trim(pArticleId) + '","information":"' + 
      escapeJson(pInformation) + '","lastModified":"' + 
      formatTimestamp(timestamp) + '"}}';
  else;
    jsonResult = buildErrorJson('DATABASE_ERROR': 
      'Failed to update information: ' + %trim(sqlermtxt));
  endif;
  
  return jsonResult;
end-proc;
```

---

### 2.8 ValidateArticle Procedure

**Purpose**: Validate article data according to business rules

**Prototype**:
```rpgle
///
// Validate article data
// @param pArticle - Article data structure
// @return Empty string if valid, JSON error details if invalid
///
dcl-proc ValidateArticle export;
  dcl-pi *n varchar(1000);
    pArticle likeds(article) const;
  end-pi;
  
  dcl-s errors varchar(1000);
  dcl-s familyExists ind;
  dcl-s vatExists ind;
  
  errors = '';
  
  // Description is required
  if %trim(pArticle.ardesc) = '';
    errors += '"description":"Description is required",';
  endif;
  
  // Family must exist
  exec sql
    select '1' into :familyExists from familly
    where faid = :pArticle.artifa and fadel <> 'X';
  
  if sqlcode <> 0;
    errors += '"familyCode":"Family ' + %trim(pArticle.artifa) + 
      ' does not exist",';
  endif;
  
  // VAT code must exist
  exec sql
    select '1' into :vatExists from vatdef
    where vatcode = :pArticle.arvatcd and vatdel <> 'X';
  
  if sqlcode <> 0;
    errors += '"vatCode":"VAT code ' + %trim(pArticle.arvatcd) + 
      ' does not exist",';
  endif;
  
  // Prices must be >= 0
  if pArticle.arsalepr < 0;
    errors += '"referenceSalePrice":"Price must be >= 0",';
  endif;
  
  if pArticle.arwhspr < 0;
    errors += '"stockPrice":"Price must be >= 0",';
  endif;
  
  // Quantities must be >= 0
  if pArticle.arstock < 0;
    errors += '"currentStock":"Stock must be >= 0",';
  endif;
  
  if pArticle.arminqty < 0;
    errors += '"minimumStock":"Minimum stock must be >= 0",';
  endif;
  
  // Remove trailing comma
  if errors <> '';
    errors = %subst(errors: 1: %len(errors) - 1);
  endif;
  
  return errors;
end-proc;
```

---

## 3. FLOOKUPSRV - Lookup Service Program

### Binding Directory

**File**: `QBNDSRC/FLOOKUP.BND`
```
STRPGMEXP  PGMLVL(*CURRENT) SIGNATURE('FLOOKUPSRV V1.0')

  EXPORT SYMBOL('GetFamilyList')
  EXPORT SYMBOL('GetFamily')
  EXPORT SYMBOL('GetVATCodeList')
  EXPORT SYMBOL('GetVATCode')
  EXPORT SYMBOL('CalculatePriceWithVAT')

ENDPGMEXP
```

---

### 3.1 GetFamilyList Procedure

**Prototype**:
```rpgle
///
// Get list of families
// @param pSearch - Search term (optional)
// @param pIncludeDeleted - Include deleted families (optional)
// @return JSON string with family list
///
dcl-proc GetFamilyList export;
  dcl-pi *n varchar(10000);
    pSearch varchar(50) const options(*nopass);
    pIncludeDeleted ind const options(*nopass);
  end-pi;
  
  dcl-s jsonResult varchar(10000);
  dcl-s search varchar(50);
  dcl-s includeDeleted ind;
  
  // Handle optional parameters
  if %parms() >= 1;
    search = pSearch;
  else;
    search = '';
  endif;
  
  if %parms() >= 2;
    includeDeleted = pIncludeDeleted;
  else;
    includeDeleted = *off;
  endif;
  
  exec sql set option commit = *none;
  
  // Build JSON array of families
  jsonResult = buildFamilyListJson(search: includeDeleted);
  
  return jsonResult;
end-proc;
```

---

### 3.2 CalculatePriceWithVAT Procedure

**Prototype**:
```rpgle
///
// Calculate price with VAT
// @param pPrice - Base price
// @param pVATCode - VAT code
// @return JSON string with calculation details
///
dcl-proc CalculatePriceWithVAT export;
  dcl-pi *n varchar(500);
    pPrice packed(7:2) const;
    pVATCode char(1) const;
  end-pi;
  
  dcl-s jsonResult varchar(500);
  dcl-s vatRate packed(4:2);
  dcl-s vatAmount packed(9:2);
  dcl-s priceWithVAT packed(9:2);
  
  exec sql set option commit = *none;
  
  // Get VAT rate
  exec sql
    select vatrate into :vatRate from vatdef
    where vatcode = :pVATCode;
  
  if sqlcode = 0;
    vatAmount = pPrice * (vatRate / 100);
    priceWithVAT = pPrice + vatAmount;
    
    jsonResult = '{"success":true,"data":{' +
      '"basePrice":' + %char(pPrice) + ',' +
      '"vatCode":"' + pVATCode + '",' +
      '"vatRate":' + %char(vatRate) + ',' +
      '"vatAmount":' + %char(vatAmount) + ',' +
      '"priceWithVAT":' + %char(priceWithVAT) +
      '}}';
  else;
    jsonResult = buildErrorJson('NOT_FOUND': 
      'VAT code ' + pVATCode + ' not found');
  endif;
  
  return jsonResult;
end-proc;
```

---

## 4. FCOMMONSRV - Common Utilities Service Program

### Key Procedures

```rpgle
// JSON building utilities
dcl-proc buildArticleJson export;
dcl-proc buildArticleListJson export;
dcl-proc buildFamilyListJson export;
dcl-proc buildErrorJson export;
dcl-proc parseArticleJson export;
dcl-proc escapeJson export;

// Date/time formatting
dcl-proc formatTimestamp export;
dcl-proc formatDate export;

// Validation helpers
dcl-proc isValidEmail export;
dcl-proc isValidPhone export;
```

---

## 5. Compilation and Deployment

### Build Script

**File**: `QCLSRC/BLDARTSRV.CLLE`
```cl
PGM

/* Compile Article Service Program */
CRTSQLRPGI OBJ(QTEMP/FARTICLESRV) +
           SRCFILE(QSRVSRC) +
           SRCMBR(FARTICLESRV) +
           COMMIT(*NONE) +
           DBGVIEW(*SOURCE) +
           REPLACE(*YES)

/* Create Service Program */
CRTSRVPGM  SRVPGM(MYLIB/FARTICLESRV) +
           MODULE(QTEMP/FARTICLESRV) +
           EXPORT(*SRCFILE) +
           SRCFILE(QSRVSRC) +
           SRCMBR(FARTICLE) +
           BNDDIR(SAMPLE) +
           REPLACE(*YES) +
           TEXT('Article Management Service Program')

/* Compile Lookup Service Program */
CRTSQLRPGI OBJ(QTEMP/FLOOKUPSRV) +
           SRCFILE(QSRVSRC) +
           SRCMBR(FLOOKUPSRV) +
           COMMIT(*NONE) +
           DBGVIEW(*SOURCE) +
           REPLACE(*YES)

CRTSRVPGM  SRVPGM(MYLIB/FLOOKUPSRV) +
           MODULE(QTEMP/FLOOKUPSRV) +
           EXPORT(*SRCFILE) +
           SRCFILE(QSRVSRC) +
           SRCMBR(FLOOKUP) +
           REPLACE(*YES) +
           TEXT('Lookup Service Program')

ENDPGM
```

---

## 6. Testing Strategy

### Unit Testing

Create test programs for each procedure:

```rpgle
**FREE

ctl-opt main(main);

dcl-proc main;
  testGetArticle();
  testCreateArticle();
  testUpdateArticle();
  testDeleteArticle();
  testValidation();
end-proc;

dcl-proc testGetArticle;
  dcl-s result varchar(4000);
  
  result = GetArticle('000001');
  assert(result <> '': 'GetArticle should return data');
  // Add more assertions
end-proc;
```

---

## 7. Integration with REST API

### Example: Using IBM i Web Services

The service programs can be exposed via:

1. **IBM i Integrated Web Services (IWS)**
2. **Third-party REST frameworks** (e.g., NOXDB, ILEastic)
3. **Custom CGI programs**

**Example IWS Configuration**:
```xml
<service name="ArticleService">
  <resource name="articles" pattern="/articles">
    <method name="GET" type="rest">
      <program name="FARTICLESRV" library="MYLIB"/>
      <procedure name="GetArticleList"/>
    </method>
  </resource>
</service>
```

---

## Next Steps

1. Review and approve service program specifications
2. Implement service programs in RPG
3. Create unit tests
4. Deploy to development environment
5. Integrate with REST API layer
6. Perform integration testing
