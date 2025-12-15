# REST API Specification - Article Management

## Overview

This document defines the REST API endpoints required to support the modernized Article Management web application. These APIs will be exposed through IBM i REST services backed by RPG Service Programs.

---

## 1. API Design Principles

### RESTful Standards
- Use HTTP methods appropriately (GET, POST, PUT, DELETE)
- Use plural nouns for resource names
- Use HTTP status codes correctly
- Return consistent JSON response structures

### Base URL
```
https://your-ibmi-server.com/api/v1
```

### Authentication
- Bearer token authentication (JWT)
- Token includes user ID for audit fields (ARMODID)

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description is required",
    "details": { ... }
  },
  "timestamp": "2025-12-15T17:26:00Z"
}
```

---

## 2. Article Endpoints

### 2.1 List Articles (with pagination and search)

**Endpoint**: `GET /articles`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 14, max: 100) |
| search | string | No | Search term for description |
| positionTo | string | No | Position to article description |
| sortBy | string | No | Sort field (id, description, family) |
| sortOrder | string | No | Sort direction (ASC, DESC) |
| includeDeleted | boolean | No | Include deleted articles (default: false) |

**Request Example**:
```http
GET /articles?page=1&pageSize=14&search=sample&sortBy=description&sortOrder=ASC
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "000001",
        "description": "Sample Article Description",
        "familyCode": "ABC",
        "familyDescription": "Sample Family",
        "vatCode": "2",
        "vatRate": 20.00,
        "vatDescription": "Standard Rate",
        "referenceSalePrice": 100.00,
        "stockPrice": 80.00,
        "currentStock": 150,
        "minimumStock": 50,
        "customerOrderQty": 0,
        "purchaseOrderQty": 0,
        "creationDate": "2024-01-15",
        "lastModified": "2024-12-15T10:30:00Z",
        "lastModifiedBy": "JSMITH",
        "deleteFlag": ""
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 14,
      "totalItems": 156,
      "totalPages": 12,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc GetArticleList export;
  dcl-pi *n varchar(32000);
    page int(10) const;
    pageSize int(10) const;
    search varchar(50) const options(*nopass);
    positionTo varchar(50) const options(*nopass);
    sortBy varchar(20) const options(*nopass);
    sortOrder varchar(4) const options(*nopass);
    includeDeleted ind const options(*nopass);
  end-pi;
  // Returns JSON string
end-proc;
```

---

### 2.2 Get Single Article

**Endpoint**: `GET /articles/{id}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Article ID (6 chars) |

**Request Example**:
```http
GET /articles/000001
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "000001",
    "description": "Sample Article Description",
    "familyCode": "ABC",
    "familyDescription": "Sample Family",
    "vatCode": "2",
    "vatRate": 20.00,
    "vatDescription": "Standard Rate",
    "referenceSalePrice": 100.00,
    "priceWithVAT": 120.00,
    "stockPrice": 80.00,
    "currentStock": 150,
    "minimumStock": 50,
    "customerOrderQty": 0,
    "purchaseOrderQty": 0,
    "creationDate": "2024-01-15",
    "lastModified": "2024-12-15T10:30:00Z",
    "lastModifiedBy": "JSMITH",
    "deleteFlag": ""
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Article 000001 not found"
  },
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc GetArticle export;
  dcl-pi *n varchar(4000);
    articleId char(6) const;
  end-pi;
  // Returns JSON string
end-proc;
```

---

### 2.3 Create Article

**Endpoint**: `POST /articles`

**Request Body**:
```json
{
  "description": "New Article Description",
  "familyCode": "ABC",
  "vatCode": "2",
  "referenceSalePrice": 100.00,
  "stockPrice": 80.00,
  "currentStock": 100,
  "minimumStock": 20
}
```

**Validation Rules**:
- `description`: Required, max 50 chars
- `familyCode`: Required, must exist in FAMILLY table
- `vatCode`: Required, must exist in VATDEF table
- `referenceSalePrice`: Optional, >= 0
- `stockPrice`: Optional, >= 0
- `currentStock`: Optional, >= 0
- `minimumStock`: Optional, >= 0

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "000157",
    "description": "New Article Description",
    "familyCode": "ABC",
    "familyDescription": "Sample Family",
    "vatCode": "2",
    "vatRate": 20.00,
    "vatDescription": "Standard Rate",
    "referenceSalePrice": 100.00,
    "priceWithVAT": 120.00,
    "stockPrice": 80.00,
    "currentStock": 100,
    "minimumStock": 20,
    "customerOrderQty": 0,
    "purchaseOrderQty": 0,
    "creationDate": "2025-12-15",
    "lastModified": "2025-12-15T17:26:00Z",
    "lastModifiedBy": "JSMITH",
    "deleteFlag": ""
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "description": "Description is required",
      "familyCode": "Family ABC does not exist"
    }
  },
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc CreateArticle export;
  dcl-pi *n varchar(4000);
    jsonInput varchar(4000) const;
    userId char(11) const;
  end-pi;
  // Returns JSON string with created article or error
end-proc;
```

---

### 2.4 Update Article

**Endpoint**: `PUT /articles/{id}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Article ID (6 chars) |

**Request Body**:
```json
{
  "description": "Updated Article Description",
  "familyCode": "DEF",
  "vatCode": "2",
  "referenceSalePrice": 110.00,
  "stockPrice": 85.00,
  "currentStock": 120,
  "minimumStock": 25
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "000001",
    "description": "Updated Article Description",
    "familyCode": "DEF",
    "familyDescription": "Different Family",
    "vatCode": "2",
    "vatRate": 20.00,
    "vatDescription": "Standard Rate",
    "referenceSalePrice": 110.00,
    "priceWithVAT": 132.00,
    "stockPrice": 85.00,
    "currentStock": 120,
    "minimumStock": 25,
    "customerOrderQty": 0,
    "purchaseOrderQty": 0,
    "creationDate": "2024-01-15",
    "lastModified": "2025-12-15T17:26:00Z",
    "lastModifiedBy": "JSMITH",
    "deleteFlag": ""
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc UpdateArticle export;
  dcl-pi *n varchar(4000);
    articleId char(6) const;
    jsonInput varchar(4000) const;
    userId char(11) const;
  end-pi;
  // Returns JSON string with updated article or error
end-proc;
```

---

### 2.5 Delete Article (Soft Delete)

**Endpoint**: `DELETE /articles/{id}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Article ID (6 chars) |

**Request Example**:
```http
DELETE /articles/000001
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "000001",
    "deleted": true,
    "deletedAt": "2025-12-15T17:26:00Z",
    "deletedBy": "JSMITH"
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc DeleteArticle export;
  dcl-pi *n varchar(1000);
    articleId char(6) const;
    userId char(11) const;
  end-pi;
  // Returns JSON string with deletion confirmation or error
end-proc;
```

---

### 2.6 Get Article Information (Extended Text)

**Endpoint**: `GET /articles/{id}/information`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Article ID (6 chars) |

**Request Example**:
```http
GET /articles/000001/information
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "articleId": "000001",
    "information": "This is extended information about the article...",
    "lastModified": "2025-12-15T17:26:00Z"
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**Response** (404 Not Found) - No information exists:
```json
{
  "success": true,
  "data": {
    "articleId": "000001",
    "information": "",
    "lastModified": null
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc GetArticleInformation export;
  dcl-pi *n varchar(2000);
    articleId char(6) const;
  end-pi;
  // Returns JSON string
end-proc;
```

---

### 2.7 Update Article Information

**Endpoint**: `PUT /articles/{id}/information`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Article ID (6 chars) |

**Request Body**:
```json
{
  "information": "Updated extended information about the article..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "articleId": "000001",
    "information": "Updated extended information about the article...",
    "lastModified": "2025-12-15T17:26:00Z"
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc UpdateArticleInformation export;
  dcl-pi *n varchar(2000);
    articleId char(6) const;
    information varchar(1520) const;
  end-pi;
  // Returns JSON string
end-proc;
```

---

## 3. Family Endpoints

### 3.1 List Families

**Endpoint**: `GET /families`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search term for description |
| includeDeleted | boolean | No | Include deleted families (default: false) |

**Request Example**:
```http
GET /families?search=sample
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "families": [
      {
        "code": "ABC",
        "description": "Sample Family Description",
        "deleteFlag": ""
      },
      {
        "code": "DEF",
        "description": "Different Family",
        "deleteFlag": ""
      }
    ]
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc GetFamilyList export;
  dcl-pi *n varchar(10000);
    search varchar(50) const options(*nopass);
    includeDeleted ind const options(*nopass);
  end-pi;
  // Returns JSON string
end-proc;
```

---

### 3.2 Get Single Family

**Endpoint**: `GET /families/{code}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | Family code (3 chars) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "code": "ABC",
    "description": "Sample Family Description",
    "deleteFlag": ""
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc GetFamily export;
  dcl-pi *n varchar(500);
    familyCode char(3) const;
  end-pi;
  // Returns JSON string
end-proc;
```

---

## 4. VAT Code Endpoints

### 4.1 List VAT Codes

**Endpoint**: `GET /vat-codes`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| includeDeleted | boolean | No | Include deleted VAT codes (default: false) |

**Request Example**:
```http
GET /vat-codes
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "vatCodes": [
      {
        "code": "1",
        "rate": 5.50,
        "description": "Reduced Rate",
        "deleteFlag": ""
      },
      {
        "code": "2",
        "rate": 20.00,
        "description": "Standard Rate",
        "deleteFlag": ""
      },
      {
        "code": "3",
        "rate": 0.00,
        "description": "Zero Rate",
        "deleteFlag": ""
      }
    ]
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc GetVATCodeList export;
  dcl-pi *n varchar(5000);
    includeDeleted ind const options(*nopass);
  end-pi;
  // Returns JSON string
end-proc;
```

---

### 4.2 Get Single VAT Code

**Endpoint**: `GET /vat-codes/{code}`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | VAT code (1 char) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "code": "2",
    "rate": 20.00,
    "description": "Standard Rate",
    "deleteFlag": ""
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc GetVATCode export;
  dcl-pi *n varchar(500);
    vatCode char(1) const;
  end-pi;
  // Returns JSON string
end-proc;
```

---

## 5. Utility Endpoints

### 5.1 Calculate Price with VAT

**Endpoint**: `POST /utilities/calculate-vat`

**Request Body**:
```json
{
  "price": 100.00,
  "vatCode": "2"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "basePrice": 100.00,
    "vatCode": "2",
    "vatRate": 20.00,
    "vatAmount": 20.00,
    "priceWithVAT": 120.00
  },
  "error": null,
  "timestamp": "2025-12-15T17:26:00Z"
}
```

**RPG Service Program Function**:
```rpgle
dcl-proc CalculatePriceWithVAT export;
  dcl-pi *n varchar(500);
    price packed(7:2) const;
    vatCode char(1) const;
  end-pi;
  // Returns JSON string
end-proc;
```

---

## 6. HTTP Status Codes

| Status Code | Description | Usage |
|-------------|-------------|-------|
| 200 OK | Success | GET, PUT, DELETE successful |
| 201 Created | Resource created | POST successful |
| 400 Bad Request | Invalid input | Validation errors |
| 401 Unauthorized | Authentication failed | Missing/invalid token |
| 403 Forbidden | Authorization failed | User lacks permission |
| 404 Not Found | Resource not found | Invalid ID |
| 409 Conflict | Resource conflict | Duplicate key |
| 500 Internal Server Error | Server error | Unexpected error |

---

## 7. Error Codes

| Error Code | Description |
|------------|-------------|
| VALIDATION_ERROR | Input validation failed |
| NOT_FOUND | Resource not found |
| DUPLICATE_KEY | Duplicate key violation |
| FOREIGN_KEY_ERROR | Foreign key constraint violation |
| DATABASE_ERROR | Database operation failed |
| INTERNAL_ERROR | Unexpected server error |

---

## 8. Rate Limiting

- 100 requests per minute per user
- 429 Too Many Requests response when exceeded
- Rate limit headers included in response:
  - `X-RateLimit-Limit`: Maximum requests per minute
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## 9. API Versioning

- Version included in URL: `/api/v1/`
- Breaking changes require new version
- Old versions supported for 12 months after deprecation notice

---

## 10. CORS Configuration

```
Access-Control-Allow-Origin: https://your-webapp-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

## Next Steps

1. Review and approve API specification
2. Create RPG Service Program implementations
3. Set up REST API layer (using IBM i web services or third-party tools)
4. Implement API client in React application
5. Test API endpoints
