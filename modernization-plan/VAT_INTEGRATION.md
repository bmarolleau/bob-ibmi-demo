# IBM i Services Integration

## Overview
This document describes the integration of the real IBM i services (VAT and Family) into the Article Management web application.

## 1. VAT Service Endpoint

**URL:** `http://10.3.61.2:10026/web/services/parameter/vat/`

**Method:** GET

**Response Format:**
```json
{
  "parameter_Parameters_R": [
    {
      "CODE": "0",
      "RATE": 0.00,
      "DESCRIPTION": "Zero VAT Rate"
    },
    {
      "CODE": "1",
      "RATE": 10.00,
      "DESCRIPTION": "Reduced VAT Rate"
    },
    {
      "CODE": "2",
      "RATE": 20.00,
      "DESCRIPTION": "Standard VAT Rate"
    }
  ]
}
```

## 2. Family Service Endpoint

**URL:** `http://10.3.61.2:10026/web/services/facode/family`

**Method:** GET

**Response Format:**
```json
{
  "facode_Getfaid_R": [
    {
      "CODE": "BOO",
      "DESCRIPTION": "Books & Media"
    },
    {
      "CODE": "CLO",
      "DESCRIPTION": "Clothing"
    },
    {
      "CODE": "ELE",
      "DESCRIPTION": "Electronics"
    }
  ]
}
```

## Changes Made

### 1. API Configuration (`src/services/api.config.ts`)

**Updated base URL:**
```typescript
// Use empty string for development (uses Vite proxy)
// Set VITE_API_BASE_URL for production deployment
baseURL: import.meta.env.VITE_API_BASE_URL || ''
```

**Important:** In development, the base URL is empty so requests use the Vite proxy configured in `vite.config.ts`. This avoids CORS issues.

**Updated lookup endpoints:**
```typescript
lookups: {
  families: '/web/services/facode/family',  // Real family service endpoint
  vat: '/web/services/parameter/vat',  // Real VAT service endpoint
}
```

**Updated article endpoints** to include full paths:
```typescript
articles: {
  list: '/web/services/article/articles',
  detail: (id: string) => `/web/services/article/articles/${id}`,
  create: '/web/services/article/articles',
  update: (id: string) => `/web/services/article/articles/${id}`,
  delete: (id: string) => `/web/services/article/articles/${id}`,
  info: (id: string) => `/web/services/article/articles/${id}/info`,
  providers: (id: string) => `/web/services/article/articles/${id}/providers`,
}
```

### 2. TypeScript Interfaces (`src/types/article.types.ts`)

**Updated Family interface** to match API response:
```typescript
export interface Family {
  CODE: string;                  // Family code from facode service
  DESCRIPTION: string;           // Family description
}
```

**Updated VATDefinition interface** to match API response:
```typescript
export interface VATDefinition {
  CODE: string;                  // VAT code from parameter service
  RATE: number;                  // VAT rate percentage
  DESCRIPTION: string;           // VAT description
}
```

### 3. Article Service (`src/services/article.service.ts`)

**Rewrote searchFamilies method** to handle the IBM i facode service response:
```typescript
async searchFamilies(request: FamilyLookupRequest = {}): Promise<ApiResponse<FamilyLookupResponse>> {
  try {
    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.lookups.families}`;
    console.log('Fetching families from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle IBM i facode service response format
    // Response format: { "facode_Getfaid_R": [...] }
    const families = data.facode_Getfaid_R || [];
    
    return {
      success: true,
      data: {
        families,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch families',
      },
    };
  }
}
```

**Rewrote getVATDefinitions method** to handle the IBM i parameter service response:
```typescript
async getVATDefinitions(): Promise<ApiResponse<VATLookupResponse>> {
  try {
    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.lookups.vat}`;
    console.log('Fetching VAT definitions from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle IBM i parameter service response format
    // Response format: { "parameter_Parameters_R": [...] }
    const vatDefinitions = data.parameter_Parameters_R || [];
    
    return {
      success: true,
      data: {
        vatDefinitions,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch VAT definitions',
      },
    };
  }
}
```

### 4. Article Form Component (`src/components/ArticleForm.tsx`)

**Updated Family field references** to use uppercase property names:

```typescript
// Family change handler
const handleFamilyChange = (item: { selectedItem: Family | null | undefined }) => {
  if (item.selectedItem) {
    setSelectedFamily(item.selectedItem);
    handleInputChange('familyCode', item.selectedItem.CODE);  // Changed from .code
  }
};

// Family ComboBox display
<ComboBox
  id="family"
  titleText="Family *"
  placeholder="Select family"
  items={families}
  itemToString={(item) => (item ? `${item.CODE} - ${item.DESCRIPTION}` : '')}  // Changed from .code, .description
  selectedItem={selectedFamily}
  onChange={handleFamilyChange}
  required
/>

// Finding family when loading article
const family = families.find((f) => f.CODE === article.familyCode);  // Changed from f.code
```

**Updated VAT field references** to use uppercase property names:

```typescript
// VAT change handler
const handleVATChange = (item: { selectedItem: VATDefinition | null | undefined }) => {
  if (item.selectedItem) {
    setSelectedVAT(item.selectedItem);
    handleInputChange('vatCode', item.selectedItem.CODE);  // Changed from .code
  }
};

// VAT ComboBox display
<ComboBox
  id="vat"
  titleText="VAT Code *"
  placeholder="Select VAT code"
  items={vatDefinitions}
  itemToString={(item) =>
    item ? `${item.CODE} - ${item.DESCRIPTION} (${item.RATE}%)` : ''  // Changed from .code, .description, .rate
  }
  selectedItem={selectedVAT}
  onChange={handleVATChange}
  required
/>

// Price calculation with VAT
const calculated = articleService.calculatePriceWithVAT(
  formData.salePrice,
  selectedVAT.RATE  // Changed from .rate
);

// Finding VAT when loading article
const vat = vatDefinitions.find((v) => v.CODE === article.vatCode);  // Changed from v.code
```

## Testing

To test the VAT integration:

1. **Start the development server:**
   ```bash
   cd article-management-web
   npm run dev
   ```

2. **Navigate to the Article Management page** from the landing page

3. **Click "Create Article"** - the VAT dropdown should populate with values from the parameter service

4. **Verify the dropdown shows:**
   - VAT codes (0, 1, 2, etc.)
   - Descriptions (Zero VAT Rate, Reduced VAT Rate, Standard VAT Rate)
   - Rates (0.00%, 10.00%, 20.00%)

5. **Check browser console** for the fetch log:
   ```
   Fetching VAT definitions from: http://10.3.61.2:10026/web/services/parameter/vat
   ```

## Proxy Configuration

The application uses Vite's proxy feature to avoid CORS issues during development.

**vite.config.ts:**
```typescript
server: {
  port: 3000,
  proxy: {
    // Proxy IBM i Web Services requests
    '/web': {
      target: 'http://10.3.61.2:10026',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This means:
- Development requests to `/web/services/...` are proxied to `http://10.3.61.2:10026/web/services/...`
- No CORS issues because the browser sees requests as same-origin
- The `baseURL` in `api.config.ts` is empty in development

## Environment Variables

You can override the base URL using environment variables:

**Development (`.env.development`):**
```
# Leave empty to use Vite proxy (recommended)
# VITE_API_BASE_URL=
```

**Production (`.env.production`):**
```
# Set full URL for production
VITE_API_BASE_URL=http://10.3.61.2:10026
```

## Error Handling

The service includes proper error handling:
- Network errors are caught and returned in the ApiResponse format
- HTTP errors (non-200 status) are handled
- Missing or malformed data is handled gracefully
- Console logging helps with debugging

## Notes

- The VAT service uses uppercase field names (CODE, RATE, DESCRIPTION) following IBM i conventions
- The article service uses lowercase field names for consistency with the frontend
- The integration maintains backward compatibility with the existing article management functionality
- All TypeScript types are properly updated to ensure type safety

---

**Made with Bob**