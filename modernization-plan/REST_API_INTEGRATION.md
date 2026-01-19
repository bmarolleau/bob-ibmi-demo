# REST API Integration Guide

This document explains how the Article Management Web Application integrates with REST APIs for dropdown lists and article creation/update operations.

## Overview

The web application is fully configured to call REST APIs for:
1. **Family dropdown list** - Populated from `/lookups/families` endpoint
2. **VAT Code dropdown list** - Populated from `/lookups/vat` endpoint
3. **Create Article** - POST to `/articles` endpoint
4. **Update Article** - PUT to `/articles/{id}` endpoint

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ArticleForm.tsx                                    │    │
│  │  - Loads families via searchFamilies()             │    │
│  │  - Loads VAT codes via getVATDefinitions()         │    │
│  │  - Creates article via createArticle()             │    │
│  │  - Updates article via updateArticle()             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  article.service.ts                                 │    │
│  │  - searchFamilies(request)                          │    │
│  │  - getVATDefinitions()                              │    │
│  │  - createArticle(data)                              │    │
│  │  - updateArticle(id, data)                          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   HTTP Client                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │  api.client.ts (Axios wrapper)                      │    │
│  │  - get(), post(), put(), delete()                   │    │
│  │  - Error handling                                   │    │
│  │  - Request/Response interceptors                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   REST API Endpoints                         │
│  (IBM i Web Services - To be implemented)                   │
│                                                              │
│  GET  /lookups/families      → Returns family list          │
│  GET  /lookups/vat           → Returns VAT definitions       │
│  POST /articles              → Creates new article           │
│  PUT  /articles/{id}         → Updates existing article      │
└─────────────────────────────────────────────────────────────┘
```

## 1. Dropdown Lists Integration

### Family Dropdown

**Component:** `ArticleForm.tsx` (lines 115-120)

```typescript
const loadFamilies = async () => {
  const response = await articleService.searchFamilies();
  if (response.success && response.data) {
    setFamilies(response.data.families);
  }
};
```

**Service Method:** `article.service.ts` (lines 175-182)

```typescript
async searchFamilies(request: FamilyLookupRequest = {}): Promise<ApiResponse<FamilyLookupResponse>> {
  const params = {
    searchTerm: request.searchTerm,
    limit: request.limit || 50,
  };

  return apiClient.get<FamilyLookupResponse>(API_ENDPOINTS.lookups.families, { params });
}
```

**API Endpoint:** `GET /lookups/families`

**Expected Response:**
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

**SQL Query:** See `API_QUERIES.md` section 1

---

### VAT Code Dropdown

**Component:** `ArticleForm.tsx` (lines 122-127)

```typescript
const loadVATDefinitions = async () => {
  const response = await articleService.getVATDefinitions();
  if (response.success && response.data) {
    setVATDefinitions(response.data.vatDefinitions);
  }
};
```

**Service Method:** `article.service.ts` (lines 187-189)

```typescript
async getVATDefinitions(): Promise<ApiResponse<VATLookupResponse>> {
  return apiClient.get<VATLookupResponse>(API_ENDPOINTS.lookups.vat);
}
```

**API Endpoint:** `GET /lookups/vat`

**Expected Response:**
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
    }
  ]
}
```

**SQL Query:** See `API_QUERIES.md` section 2

---

## 2. Create Article Integration

### Add Button Flow

**Component:** `ArticleForm.tsx` (lines 148-178)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate
  const validation = articleService.validateArticle(formData);
  if (!validation.valid) {
    setValidationErrors(validation.errors);
    return;
  }

  setSaving(true);
  setError(null);

  let response;
  if (mode === 'create') {
    response = await articleService.createArticle(formData as ArticleCreateRequest);
  } else {
    response = await articleService.updateArticle(
      articleId!,
      formData as ArticleUpdateRequest
    );
  }

  if (response.success) {
    onSave();
  } else {
    setError(response.error?.message || 'Failed to save article');
  }

  setSaving(false);
};
```

**Service Method:** `article.service.ts` (lines 133-135)

```typescript
async createArticle(data: ArticleCreateRequest): Promise<ApiResponse<ArticleResponse>> {
  return apiClient.post<ArticleResponse>(API_ENDPOINTS.articles.create, data);
}
```

**API Endpoint:** `POST /articles`

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

**Expected Response:**
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

**SQL Query:** See `API_QUERIES.md` section 3

---

## 3. Update Article Integration

### Save Button Flow (Edit Mode)

**Component:** Same `handleSubmit` function as above, but with `mode === 'edit'`

**Service Method:** `article.service.ts` (lines 140-142)

```typescript
async updateArticle(id: string, data: ArticleUpdateRequest): Promise<ApiResponse<ArticleResponse>> {
  return apiClient.put<ArticleResponse>(API_ENDPOINTS.articles.update(id), data);
}
```

**API Endpoint:** `PUT /articles/{id}`

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

**Expected Response:** Same format as Create Article response

**SQL Query:** See `API_QUERIES.md` section 4

---

## Configuration

### API Base URL

**File:** `src/services/api.config.ts`

```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/web/services/article',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Environment Variables

Create a `.env` file in the `article-management-web` directory:

```env
# Development
VITE_API_BASE_URL=http://your-ibmi-server:port/web/services/article

# Production
# VITE_API_BASE_URL=https://production-server/web/services/article
```

### Endpoint Configuration

**File:** `src/services/api.config.ts`

```typescript
export const API_ENDPOINTS = {
  articles: {
    list: '/articles',
    detail: (id: string) => `/articles/${id}`,
    create: '/articles',
    update: (id: string) => `/articles/${id}`,
    delete: (id: string) => `/articles/${id}`,
    info: (id: string) => `/articles/${id}/info`,
    providers: (id: string) => `/articles/${id}/providers`,
  },
  
  lookups: {
    families: '/lookups/families',
    vat: '/lookups/vat',
  },
};
```

---

## Error Handling

The application includes comprehensive error handling:

### Client-Side Validation

**File:** `article.service.ts` (lines 201-251)

```typescript
validateArticle(data: Partial<Article>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.description !== undefined) {
    if (!data.description.trim()) {
      errors.push('Description is required');
    }
    if (data.description.length > 50) {
      errors.push('Description must not exceed 50 characters');
    }
  }

  // ... more validation rules

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### API Error Handling

**File:** `api.client.ts` (lines 48-112)

The API client automatically handles:
- Network errors
- HTTP status codes (400, 401, 403, 404, 409, 500)
- Request timeouts
- Response parsing errors

Errors are returned in a consistent format:

```typescript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable error message',
    field: 'fieldName',  // Optional
    details: {}          // Optional
  }
}
```

---

## Testing the Integration

### 1. Test Dropdown APIs

```bash
# Test families endpoint
curl -X GET "http://your-ibmi:port/web/services/article/lookups/families"

# Test VAT endpoint
curl -X GET "http://your-ibmi:port/web/services/article/lookups/vat"
```

### 2. Test Create Article API

```bash
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

### 3. Test Update Article API

```bash
curl -X PUT "http://your-ibmi:port/web/services/article/articles/000123" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated Test Article",
    "salePrice": 149.99
  }'
```

### 4. Test in Browser

1. Start the development server:
   ```bash
   cd article-management-web
   npm run dev
   ```

2. Open browser to `http://localhost:5173`

3. Navigate to Articles page

4. Click "Create" button

5. Verify dropdowns are populated:
   - Family dropdown should show list from API
   - VAT Code dropdown should show list from API

6. Fill in the form and click "Save"

7. Check browser DevTools Network tab to see API calls

---

## Implementation Checklist

### Backend (IBM i)

- [ ] Create or update service program with procedures:
  - [ ] `getFamilies` - Returns family list
  - [ ] `getVATDefinitions` - Returns VAT definitions
  - [ ] `createArticle` - Creates new article
  - [ ] `updateArticle` - Updates existing article

- [ ] Deploy service program as Web Service using IWS

- [ ] Configure endpoints:
  - [ ] `GET /lookups/families`
  - [ ] `GET /lookups/vat`
  - [ ] `POST /articles`
  - [ ] `PUT /articles/{id}`

- [ ] Test endpoints with curl or Postman

### Frontend (React)

- [x] ArticleForm component configured to call APIs
- [x] Service layer methods implemented
- [x] API client with error handling
- [x] TypeScript interfaces defined
- [x] Validation logic implemented
- [ ] Configure `.env` file with correct API base URL
- [ ] Test in browser

---

## Troubleshooting

### Dropdowns are empty

**Problem:** Family or VAT dropdowns show no options

**Solutions:**
1. Check browser DevTools Console for errors
2. Check Network tab to see if API calls are made
3. Verify API endpoint URLs in `api.config.ts`
4. Test API endpoints directly with curl
5. Check CORS configuration on IBM i server

### Create/Update fails

**Problem:** Article creation or update returns error

**Solutions:**
1. Check validation errors displayed in the form
2. Check browser DevTools Console for errors
3. Check Network tab for API response
4. Verify request body format matches expected format
5. Check IBM i service program logs
6. Verify database permissions

### CORS Errors

**Problem:** Browser shows CORS policy errors

**Solution:** Configure CORS headers on IBM i Web Services:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Next Steps

1. **Implement Backend APIs** - Use the SQL queries in `API_QUERIES.md`
2. **Configure Environment** - Set up `.env` file with correct API URL
3. **Test Integration** - Verify all API calls work correctly
4. **Add Loading States** - Enhance UX with loading indicators
5. **Add Success Messages** - Show confirmation when operations succeed
6. **Implement Remaining Features** - Add article info, delete, suppliers

---

**Made with Bob**