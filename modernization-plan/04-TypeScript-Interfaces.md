# TypeScript Interfaces and Types

## Overview

This document defines all TypeScript interfaces, types, and enums for the Article Management application, ensuring type safety throughout the React frontend.

---

## 1. Core Data Models

### Article Interface

```typescript
/**
 * Article entity representing a product/item in the system
 */
export interface Article {
  /** Article ID (6 characters) */
  id: string;
  
  /** Article description (max 50 characters) */
  description: string;
  
  /** Family code (3 characters) */
  familyCode: string;
  
  /** Family description (read-only, from lookup) */
  familyDescription: string;
  
  /** VAT code (1 character) */
  vatCode: string;
  
  /** VAT rate percentage (e.g., 20.00 for 20%) */
  vatRate: number;
  
  /** VAT description (read-only, from lookup) */
  vatDescription: string;
  
  /** Reference sale price */
  referenceSalePrice: number;
  
  /** Calculated price including VAT (read-only) */
  priceWithVAT: number;
  
  /** Stock/warehouse price */
  stockPrice: number;
  
  /** Current stock quantity */
  currentStock: number;
  
  /** Minimum stock threshold */
  minimumStock: number;
  
  /** Customer order quantity */
  customerOrderQty: number;
  
  /** Purchase order quantity */
  purchaseOrderQty: number;
  
  /** Creation date (ISO 8601 date string) */
  creationDate: string;
  
  /** Last modification timestamp (ISO 8601 datetime string) */
  lastModified: string;
  
  /** User ID who last modified the record */
  lastModifiedBy: string;
  
  /** Delete flag ('X' = deleted, '' = active) */
  deleteFlag: '' | 'X';
}

/**
 * Article input for create/update operations
 * Omits read-only and system-generated fields
 */
export interface ArticleInput {
  description: string;
  familyCode: string;
  vatCode: string;
  referenceSalePrice?: number;
  stockPrice?: number;
  currentStock?: number;
  minimumStock?: number;
}

/**
 * Article form data with validation state
 */
export interface ArticleFormData extends ArticleInput {
  errors: Partial<Record<keyof ArticleInput, string>>;
  isDirty: boolean;
  isValid: boolean;
}
```

---

### Family Interface

```typescript
/**
 * Family/Category entity for article classification
 */
export interface Family {
  /** Family code (3 characters) */
  code: string;
  
  /** Family description (max 50 characters) */
  description: string;
  
  /** Delete flag ('X' = deleted, '' = active) */
  deleteFlag: '' | 'X';
}

/**
 * Family option for dropdown/combobox
 */
export interface FamilyOption {
  id: string;
  label: string;
  value: string;
}
```

---

### VAT Code Interface

```typescript
/**
 * VAT (Value Added Tax) code definition
 */
export interface VATCode {
  /** VAT code (1 character) */
  code: string;
  
  /** VAT rate percentage (e.g., 20.00 for 20%) */
  rate: number;
  
  /** VAT description (max 20 characters) */
  description: string;
  
  /** Delete flag ('X' = deleted, '' = active) */
  deleteFlag: '' | 'X';
}

/**
 * VAT option for dropdown/combobox
 */
export interface VATOption {
  id: string;
  label: string;
  value: string;
  rate: number;
}
```

---

### Article Information Interface

```typescript
/**
 * Extended article information (notes/details)
 */
export interface ArticleInformation {
  /** Article ID reference */
  articleId: string;
  
  /** Extended information text (max 1520 characters) */
  information: string;
  
  /** Last modification timestamp */
  lastModified: string | null;
}
```

---

## 2. API Response Types

### Generic API Response

```typescript
/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  timestamp: string;
}

/**
 * API error structure
 */
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string>;
}

/**
 * Error codes returned by the API
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  FOREIGN_KEY_ERROR = 'FOREIGN_KEY_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}
```

---

### Pagination Types

```typescript
/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
```

---

### Article List Response

```typescript
/**
 * Response for article list endpoint
 */
export interface ArticleListResponse {
  articles: Article[];
  pagination: Pagination;
}

/**
 * Query parameters for article list
 */
export interface ArticleListParams extends PaginationParams {
  search?: string;
  positionTo?: string;
  sortBy?: 'id' | 'description' | 'family';
  sortOrder?: 'ASC' | 'DESC';
  includeDeleted?: boolean;
}
```

---

### Family List Response

```typescript
/**
 * Response for family list endpoint
 */
export interface FamilyListResponse {
  families: Family[];
}

/**
 * Query parameters for family list
 */
export interface FamilyListParams {
  search?: string;
  includeDeleted?: boolean;
}
```

---

### VAT Code List Response

```typescript
/**
 * Response for VAT code list endpoint
 */
export interface VATCodeListResponse {
  vatCodes: VATCode[];
}

/**
 * Query parameters for VAT code list
 */
export interface VATCodeListParams {
  includeDeleted?: boolean;
}
```

---

### VAT Calculation Response

```typescript
/**
 * Response for VAT calculation utility
 */
export interface VATCalculationResponse {
  basePrice: number;
  vatCode: string;
  vatRate: number;
  vatAmount: number;
  priceWithVAT: number;
}

/**
 * Request for VAT calculation
 */
export interface VATCalculationRequest {
  price: number;
  vatCode: string;
}
```

---

## 3. UI State Types

### Modal State

```typescript
/**
 * Modal types in the application
 */
export enum ModalType {
  NONE = 'none',
  CREATE = 'create',
  EDIT = 'edit',
  INFO = 'info',
  DELETE = 'delete',
  FAMILY_SELECT = 'family_select',
}

/**
 * Modal state
 */
export interface ModalState {
  type: ModalType;
  isOpen: boolean;
  data?: any;
}
```

---

### Table State

```typescript
/**
 * Data table sort configuration
 */
export interface TableSort {
  columnKey: string;
  direction: 'ASC' | 'DESC';
}

/**
 * Data table filter configuration
 */
export interface TableFilter {
  columnKey: string;
  value: string;
}

/**
 * Data table state
 */
export interface TableState {
  sort: TableSort | null;
  filters: TableFilter[];
  selectedRows: string[];
}
```

---

### Loading State

```typescript
/**
 * Loading state for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

/**
 * Loading state with error handling
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
```

---

## 4. Form Types

### Form Mode

```typescript
/**
 * Form operation mode
 */
export enum FormMode {
  CREATE = 'create',
  EDIT = 'edit',
  VIEW = 'view',
}
```

---

### Validation Types

```typescript
/**
 * Field validation rule
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

/**
 * Field validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Form validation errors
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>;
```

---

## 5. Action Types

### Article Actions

```typescript
/**
 * Article row action types
 */
export enum ArticleAction {
  EDIT = 'edit',
  INFO = 'info',
  DELETE = 'delete',
  SUPPLIERS = 'suppliers',
}

/**
 * Article action handler
 */
export interface ArticleActionHandler {
  action: ArticleAction;
  article: Article;
}
```

---

## 6. Context Types

### Article Context

```typescript
/**
 * Article context value
 */
export interface ArticleContextValue {
  // State
  articles: Article[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchArticles: (params: ArticleListParams) => Promise<void>;
  getArticle: (id: string) => Promise<Article>;
  createArticle: (input: ArticleInput) => Promise<Article>;
  updateArticle: (id: string, input: ArticleInput) => Promise<Article>;
  deleteArticle: (id: string) => Promise<void>;
  
  // Article Information
  getArticleInfo: (id: string) => Promise<ArticleInformation>;
  updateArticleInfo: (id: string, info: string) => Promise<void>;
  
  // Utilities
  calculateVAT: (price: number, vatCode: string) => Promise<VATCalculationResponse>;
}
```

---

### Lookup Context

```typescript
/**
 * Lookup data context value
 */
export interface LookupContextValue {
  // Families
  families: Family[];
  familiesLoading: boolean;
  fetchFamilies: (params?: FamilyListParams) => Promise<void>;
  getFamilyDescription: (code: string) => string;
  
  // VAT Codes
  vatCodes: VATCode[];
  vatCodesLoading: boolean;
  fetchVATCodes: (params?: VATCodeListParams) => Promise<void>;
  getVATRate: (code: string) => number;
  getVATDescription: (code: string) => string;
}
```

---

## 7. Hook Return Types

### useArticles Hook

```typescript
/**
 * Return type for useArticles hook
 */
export interface UseArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  fetchArticles: (params: ArticleListParams) => Promise<void>;
  refresh: () => Promise<void>;
}
```

---

### useArticleForm Hook

```typescript
/**
 * Return type for useArticleForm hook
 */
export interface UseArticleFormReturn {
  formData: ArticleFormData;
  mode: FormMode;
  loading: boolean;
  errors: FormErrors<ArticleInput>;
  
  // Field handlers
  handleChange: (field: keyof ArticleInput, value: any) => void;
  handleBlur: (field: keyof ArticleInput) => void;
  
  // Form actions
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
  
  // Validation
  validateField: (field: keyof ArticleInput) => ValidationResult;
  validateForm: () => boolean;
  
  // Utilities
  isDirty: boolean;
  isValid: boolean;
}
```

---

### useArticleInfo Hook

```typescript
/**
 * Return type for useArticleInfo hook
 */
export interface UseArticleInfoReturn {
  information: string;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  
  // Actions
  handleChange: (value: string) => void;
  handleSave: () => Promise<void>;
  handleReset: () => void;
}
```

---

## 8. Component Props Types

### ArticleListPage Props

```typescript
export interface ArticleListPageProps {
  initialParams?: ArticleListParams;
  onArticleSelect?: (article: Article) => void;
}
```

---

### ArticleDataTable Props

```typescript
export interface ArticleDataTableProps {
  articles: Article[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSort: (sort: TableSort) => void;
  onAction: (handler: ArticleActionHandler) => void;
}
```

---

### ArticleFormModal Props

```typescript
export interface ArticleFormModalProps {
  open: boolean;
  mode: FormMode;
  article?: Article;
  onClose: () => void;
  onSave: (article: ArticleInput) => Promise<void>;
}
```

---

### ArticleInfoModal Props

```typescript
export interface ArticleInfoModalProps {
  open: boolean;
  article: Article;
  onClose: () => void;
  onSave: (articleId: string, info: string) => Promise<void>;
}
```

---

### DeleteConfirmationModal Props

```typescript
export interface DeleteConfirmationModalProps {
  open: boolean;
  article: Article;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}
```

---

### FamilySelectionModal Props

```typescript
export interface FamilySelectionModalProps {
  open: boolean;
  selectedCode?: string;
  onClose: () => void;
  onSelect: (family: Family) => void;
}
```

---

## 9. Service Types

### Article Service

```typescript
/**
 * Article service interface
 */
export interface IArticleService {
  getArticles(params: ArticleListParams): Promise<ApiResponse<ArticleListResponse>>;
  getArticle(id: string): Promise<ApiResponse<Article>>;
  createArticle(input: ArticleInput): Promise<ApiResponse<Article>>;
  updateArticle(id: string, input: ArticleInput): Promise<ApiResponse<Article>>;
  deleteArticle(id: string): Promise<ApiResponse<{ id: string; deleted: boolean }>>;
  getArticleInformation(id: string): Promise<ApiResponse<ArticleInformation>>;
  updateArticleInformation(id: string, info: string): Promise<ApiResponse<ArticleInformation>>;
}
```

---

### Family Service

```typescript
/**
 * Family service interface
 */
export interface IFamilyService {
  getFamilies(params?: FamilyListParams): Promise<ApiResponse<FamilyListResponse>>;
  getFamily(code: string): Promise<ApiResponse<Family>>;
}
```

---

### VAT Service

```typescript
/**
 * VAT service interface
 */
export interface IVATService {
  getVATCodes(params?: VATCodeListParams): Promise<ApiResponse<VATCodeListResponse>>;
  getVATCode(code: string): Promise<ApiResponse<VATCode>>;
  calculateVAT(request: VATCalculationRequest): Promise<ApiResponse<VATCalculationResponse>>;
}
```

---

## 10. Utility Types

### HTTP Client Types

```typescript
/**
 * HTTP request configuration
 */
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

/**
 * HTTP client interface
 */
export interface IHttpClient {
  get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T>(url: string, data: any): Promise<ApiResponse<T>>;
  put<T>(url: string, data: any): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
}
```

---

### Type Guards

```typescript
/**
 * Type guard to check if value is an Article
 */
export function isArticle(value: any): value is Article {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.description === 'string'
  );
}

/**
 * Type guard to check if value is an ApiError
 */
export function isApiError(value: any): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  );
}
```

---

## 11. Constants and Enums

### Field Lengths

```typescript
/**
 * Maximum field lengths
 */
export const FIELD_LENGTHS = {
  ARTICLE_ID: 6,
  DESCRIPTION: 50,
  FAMILY_CODE: 3,
  VAT_CODE: 1,
  INFORMATION: 1520,
  USER_ID: 11,
} as const;
```

---

### Default Values

```typescript
/**
 * Default values for forms
 */
export const DEFAULT_ARTICLE: Partial<Article> = {
  description: '',
  familyCode: '',
  vatCode: '2',
  referenceSalePrice: 0,
  stockPrice: 0,
  currentStock: 0,
  minimumStock: 0,
  customerOrderQty: 0,
  purchaseOrderQty: 0,
  deleteFlag: '',
};

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  pageSize: 14,
};
```

---

## 12. Type Exports

```typescript
// Re-export all types for convenient importing
export type {
  // Core models
  Article,
  ArticleInput,
  ArticleFormData,
  Family,
  FamilyOption,
  VATCode,
  VATOption,
  ArticleInformation,
  
  // API types
  ApiResponse,
  ApiError,
  Pagination,
  PaginatedResponse,
  
  // Response types
  ArticleListResponse,
  FamilyListResponse,
  VATCodeListResponse,
  VATCalculationResponse,
  
  // Request types
  ArticleListParams,
  FamilyListParams,
  VATCodeListParams,
  VATCalculationRequest,
  
  // UI state types
  ModalState,
  TableState,
  TableSort,
  TableFilter,
  LoadingState,
  AsyncState,
  
  // Form types
  FormErrors,
  ValidationRule,
  ValidationResult,
  
  // Context types
  ArticleContextValue,
  LookupContextValue,
  
  // Hook return types
  UseArticlesReturn,
  UseArticleFormReturn,
  UseArticleInfoReturn,
  
  // Component props
  ArticleListPageProps,
  ArticleDataTableProps,
  ArticleFormModalProps,
  ArticleInfoModalProps,
  DeleteConfirmationModalProps,
  FamilySelectionModalProps,
  
  // Service interfaces
  IArticleService,
  IFamilyService,
  IVATService,
  IHttpClient,
};

// Re-export enums
export {
  ErrorCode,
  ModalType,
  FormMode,
  ArticleAction,
};
```

---

## Usage Examples

### Example 1: Using Article Type

```typescript
import { Article, ArticleInput } from '@/types';

const article: Article = {
  id: '000001',
  description: 'Sample Article',
  familyCode: 'ABC',
  familyDescription: 'Sample Family',
  vatCode: '2',
  vatRate: 20.00,
  vatDescription: 'Standard Rate',
  referenceSalePrice: 100.00,
  priceWithVAT: 120.00,
  stockPrice: 80.00,
  currentStock: 150,
  minimumStock: 50,
  customerOrderQty: 0,
  purchaseOrderQty: 0,
  creationDate: '2024-01-15',
  lastModified: '2024-12-15T10:30:00Z',
  lastModifiedBy: 'JSMITH',
  deleteFlag: '',
};
```

### Example 2: Using API Response Type

```typescript
import { ApiResponse, Article } from '@/types';

async function fetchArticle(id: string): Promise<Article> {
  const response: ApiResponse<Article> = await articleService.getArticle(id);
  
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch article');
  }
  
  return response.data;
}
```

### Example 3: Using Form Types

```typescript
import { ArticleFormData, FormErrors, ArticleInput } from '@/types';

const [formData, setFormData] = useState<ArticleFormData>({
  description: '',
  familyCode: '',
  vatCode: '2',
  referenceSalePrice: 0,
  stockPrice: 0,
  currentStock: 0,
  minimumStock: 0,
  errors: {},
  isDirty: false,
  isValid: false,
});
```

---

This comprehensive type system ensures type safety throughout the application and provides excellent IDE support with autocomplete and type checking.