# REST API Database Queries

This document contains the SQL queries needed to implement the REST API endpoints for the Article Management Web Application.

## 1. Family Lookup API

**Endpoint:** `GET /lookups/families`

**Query Parameters:**
- `searchTerm` (optional): Filter families by code or description
- `limit` (optional, default: 50): Maximum number of records to return

**SQL Query:**

```sql
-- Get all families or filtered by search term
-- Note: FAMILLY table uses FAID (not FACODE) for the family ID
SELECT
    FAID as code,
    FADESC as description
FROM FAMILLY
WHERE
    (? IS NULL OR FAID LIKE ? OR FADESC LIKE ?)
ORDER BY FAID
FETCH FIRST ? ROWS ONLY
```

**Parameters:**
1. `searchTerm` (for NULL check)
2. `'%' || UPPER(searchTerm) || '%'` (for FAID LIKE)
3. `'%' || UPPER(searchTerm) || '%'` (for FADESC LIKE)
4. `limit` (default: 50)

**Expected JSON Response:**
```json
{
  "families": [
    {
      "code": "ELE",
      "description": "Electronics"
    },
    {
      "code": "FUR",
      "description": "Furniture"
    }
  ]
}
```

**IBM i Web Service Configuration:**
- Service Program: Create a new service program or add to existing one
- Procedure: `getFamilies`
- HTTP Method: GET
- Content Type: application/json

---

## 2. VAT Definitions Lookup API

**Endpoint:** `GET /lookups/vat`

**Query Parameters:** None

**SQL Query:**

```sql
-- Get all VAT definitions from PARAMETER table
SELECT 
    PARM3 as code,
    CAST(PARM1 AS DECIMAL(5,2)) as rate,
    PARM2 as description
FROM PARAMETER
WHERE PACODE = 'VAT'
ORDER BY PARM3
```

**Expected JSON Response:**
```json
{
  "vatDefinitions": [
    {
      "code": "20",
      "rate": 20.0,
      "description": "Standard VAT Rate"
    },
    {
      "code": "10",
      "rate": 10.0,
      "description": "Reduced VAT Rate"
    },
    {
      "code": "00",
      "rate": 0.0,
      "description": "Zero VAT Rate"
    }
  ]
}
```

**IBM i Web Service Configuration:**
- Service Program: Same as families or new one
- Procedure: `getVATDefinitions`
- HTTP Method: GET
- Content Type: application/json

---

## 3. Create Article API

**Endpoint:** `POST /articles`

**Request Body:**
```json
{
  "description": "New Article Description",
  "familyCode": "ELE",
  "vatCode": "20",
  "salePrice": 99.99,
  "warehousePrice": 75.00,
  "stock": 100,
  "minimumQuantity": 10
}
```

**SQL Queries:**

```sql
-- Step 1: Generate new Article ID (if auto-generated)
-- Option A: Use a sequence or identity column
-- Option B: Get next available ID
SELECT COALESCE(MAX(CAST(ARID AS INTEGER)), 0) + 1 as nextId
FROM ARTICLE
WHERE ARID REGEXP '^[0-9]+$'

-- Step 2: Insert new article
INSERT INTO ARTICLE (
    ARID,
    ARDESC,
    ARSALEPR,
    ARWHSPR,
    ARTIFA,
    ARSTOCK,
    ARMINQTY,
    ARCUSQTY,
    ARPURQTY,
    ARVATCD,
    ARCREA,
    ARMOD,
    ARMODID,
    ARDEL
) VALUES (
    ?,  -- Article ID (generated or provided)
    ?,  -- Description
    ?,  -- Sale Price
    ?,  -- Warehouse Price
    ?,  -- Family Code
    ?,  -- Stock
    ?,  -- Minimum Quantity
    0,  -- Customer Quantity (default 0)
    0,  -- Purchase Quantity (default 0)
    ?,  -- VAT Code
    CURRENT_DATE,  -- Creation Date
    CURRENT_TIMESTAMP,  -- Modified Timestamp
    CURRENT_USER,  -- Modified User
    ''  -- Not deleted (empty string)
)

-- Step 3: Return the created article with calculated fields
SELECT 
    a.ARID as id,
    a.ARDESC as description,
    a.ARSALEPR as salePrice,
    a.ARWHSPR as warehousePrice,
    a.ARTIFA as familyCode,
    f.FADESC as familyDescription,
    a.ARSTOCK as stock,
    a.ARMINQTY as minimumQuantity,
    a.ARVATCD as vatCode,
    v.VATRATE as vatRate,
    v.VATDESC as vatDescription,
    a.ARSALEPR * (1 + v.VATRATE / 100) as priceWithVAT,
    a.ARCREA as createdDate,
    a.ARMOD as modifiedDate,
    a.ARMODID as modifiedUser,
    CASE WHEN a.ARDEL = '' THEN 0 ELSE 1 END as deleted
FROM ARTICLE a
LEFT JOIN FAMILLY f ON a.ARTIFA = f.FACODE
LEFT JOIN SAMREF v ON a.ARVATCD = v.VATCODE
WHERE a.ARID = ?
```

**Parameters for INSERT:**
1. `articleId` (generated)
2. `description`
3. `salePrice`
4. `warehousePrice`
5. `familyCode`
6. `stock`
7. `minimumQuantity`
8. `vatCode`

**Expected JSON Response:**
```json
{
  "article": {
    "id": "000123",
    "description": "New Article Description",
    "familyCode": "ELE",
    "familyDescription": "Electronics",
    "vatCode": "20",
    "vatRate": 20.0,
    "vatDescription": "Standard VAT Rate",
    "salePrice": 99.99,
    "warehousePrice": 75.00,
    "stock": 100,
    "minimumQuantity": 10,
    "deleted": false,
    "createdDate": "2026-01-19",
    "modifiedDate": "2026-01-19T10:30:00",
    "modifiedUser": "WEBUSER"
  },
  "priceWithVAT": 119.99
}
```

**IBM i Web Service Configuration:**
- Service Program: FARTICLEAPI or similar
- Procedure: `createArticle`
- HTTP Method: POST
- Content Type: application/json
- Input: JSON object with article data
- Output: JSON object with created article

---

## 4. Update Article API

**Endpoint:** `PUT /articles/{id}`

**Request Body:**
```json
{
  "description": "Updated Description",
  "familyCode": "FUR",
  "vatCode": "10",
  "salePrice": 149.99,
  "warehousePrice": 110.00,
  "stock": 50,
  "minimumQuantity": 5
}
```

**SQL Query:**

```sql
-- Update article
UPDATE ARTICLE
SET 
    ARDESC = COALESCE(?, ARDESC),
    ARSALEPR = COALESCE(?, ARSALEPR),
    ARWHSPR = COALESCE(?, ARWHSPR),
    ARTIFA = COALESCE(?, ARTIFA),
    ARSTOCK = COALESCE(?, ARSTOCK),
    ARMINQTY = COALESCE(?, ARMINQTY),
    ARVATCD = COALESCE(?, ARVATCD),
    ARMOD = CURRENT_TIMESTAMP,
    ARMODID = CURRENT_USER
WHERE ARID = ?
  AND ARDEL = ''  -- Only update non-deleted articles

-- Return updated article (same SELECT as create)
SELECT 
    a.ARID as id,
    a.ARDESC as description,
    a.ARSALEPR as salePrice,
    a.ARWHSPR as warehousePrice,
    a.ARTIFA as familyCode,
    f.FADESC as familyDescription,
    a.ARSTOCK as stock,
    a.ARMINQTY as minimumQuantity,
    a.ARVATCD as vatCode,
    v.VATRATE as vatRate,
    v.VATDESC as vatDescription,
    a.ARSALEPR * (1 + v.VATRATE / 100) as priceWithVAT,
    a.ARCREA as createdDate,
    a.ARMOD as modifiedDate,
    a.ARMODID as modifiedUser,
    CASE WHEN a.ARDEL = '' THEN 0 ELSE 1 END as deleted
FROM ARTICLE a
LEFT JOIN FAMILLY f ON a.ARTIFA = f.FACODE
LEFT JOIN SAMREF v ON a.ARVATCD = v.VATCODE
WHERE a.ARID = ?
```

**Parameters:**
1. `description` (or NULL to keep existing)
2. `salePrice` (or NULL to keep existing)
3. `warehousePrice` (or NULL to keep existing)
4. `familyCode` (or NULL to keep existing)
5. `stock` (or NULL to keep existing)
6. `minimumQuantity` (or NULL to keep existing)
7. `vatCode` (or NULL to keep existing)
8. `articleId` (WHERE clause)
9. `articleId` (for SELECT)

**Expected JSON Response:** Same format as Create Article response

**IBM i Web Service Configuration:**
- Service Program: FARTICLEAPI
- Procedure: `updateArticle`
- HTTP Method: PUT
- Content Type: application/json

---

## 5. Get Single Article API

**Endpoint:** `GET /articles/{id}`

**SQL Query:**

```sql
SELECT 
    a.ARID as id,
    a.ARDESC as description,
    a.ARSALEPR as salePrice,
    a.ARWHSPR as warehousePrice,
    a.ARTIFA as familyCode,
    f.FADESC as familyDescription,
    a.ARSTOCK as stock,
    a.ARMINQTY as minimumQuantity,
    a.ARCUSQTY as customerQuantity,
    a.ARPURQTY as purchaseQuantity,
    a.ARVATCD as vatCode,
    v.VATRATE as vatRate,
    v.VATDESC as vatDescription,
    a.ARSALEPR * (1 + v.VATRATE / 100) as priceWithVAT,
    a.ARCREA as createdDate,
    a.ARMOD as modifiedDate,
    a.ARMODID as modifiedUser,
    CASE WHEN a.ARDEL = '' THEN 0 ELSE 1 END as deleted
FROM ARTICLE a
LEFT JOIN FAMILLY f ON a.ARTIFA = f.FACODE
LEFT JOIN SAMREF v ON a.ARVATCD = v.VATCODE
WHERE a.ARID = ?
```

**Parameters:**
1. `articleId`

**Expected JSON Response:** Same format as Create Article response

---

## Implementation Notes

### Service Program Structure (RPG ILE)

```rpgle
**FREE

// Service program: FARTICLEAPI
// Procedures for Article REST API

dcl-proc getFamilies export;
  dcl-pi *n;
    searchTerm varchar(50) const options(*nopass);
    limit int(10) const options(*nopass);
  end-pi;
  
  // Implementation here
  // Return JSON array of families
end-proc;

dcl-proc getVATDefinitions export;
  // Implementation here
  // Return JSON array of VAT definitions
end-proc;

dcl-proc createArticle export;
  dcl-pi *n;
    articleData varchar(1000) const;  // JSON input
  end-pi;
  
  // Implementation here
  // Parse JSON, insert article, return JSON response
end-proc;

dcl-proc updateArticle export;
  dcl-pi *n;
    articleId char(6) const;
    articleData varchar(1000) const;  // JSON input
  end-pi;
  
  // Implementation here
  // Parse JSON, update article, return JSON response
end-proc;
```

### IWS (Integrated Web Services) Configuration

1. **Create Service Program** with the procedures above
2. **Deploy as Web Service** using IWS:
   - Right-click service program in IBM i
   - Select "Deploy as Web Service"
   - Configure endpoints and HTTP methods
   - Set content type to application/json

### Alternative: Use Existing Service Programs

If you already have service programs like `FARTICLE`, you can add these procedures to them or create wrapper procedures that call existing ones.

### Testing the APIs

Use tools like:
- Postman
- curl
- Browser DevTools

Example curl commands:

```bash
# Get families
curl -X GET "http://your-ibmi:port/web/services/article/lookups/families"

# Get VAT definitions
curl -X GET "http://your-ibmi:port/web/services/article/lookups/vat"

# Create article
curl -X POST "http://your-ibmi:port/web/services/article/articles" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test Article",
    "familyCode": "ELE",
    "vatCode": "20",
    "salePrice": 99.99,
    "warehousePrice": 75.00,
    "stock": 100,
    "minimumQuantity": 10
  }'
```

## Database Tables Reference

### FAMILLY Table
- `FACODE` CHAR(3) - Family code
- `FADESC` CHAR(30) - Family description

### SAMREF Table (VAT definitions)
- `VATCODE` CHAR(2) - VAT code
- `VATRATE` DECIMAL(5,2) - VAT rate percentage
- `VATDESC` CHAR(30) - VAT description

### ARTICLE Table
- `ARID` CHAR(6) - Article ID
- `ARDESC` CHAR(50) - Description
- `ARSALEPR` DECIMAL(11,2) - Sale price
- `ARWHSPR` DECIMAL(11,2) - Warehouse price
- `ARTIFA` CHAR(3) - Family code
- `ARSTOCK` DECIMAL(11,2) - Stock quantity
- `ARMINQTY` DECIMAL(11,2) - Minimum quantity
- `ARCUSQTY` DECIMAL(11,2) - Customer quantity
- `ARPURQTY` DECIMAL(11,2) - Purchase quantity
- `ARVATCD` CHAR(2) - VAT code
- `ARCREA` DATE - Creation date
- `ARMOD` TIMESTAMP - Last modified
- `ARMODID` CHAR(10) - Modified by user
- `ARDEL` CHAR(1) - Deleted flag ('' = active, 'X' = deleted)

---

**Made with Bob**