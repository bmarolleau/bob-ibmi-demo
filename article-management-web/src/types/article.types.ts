/**
 * Article Management System - TypeScript Type Definitions
 * Based on IBM i ARTICLE physical file and related structures
 */

// ============================================================================
// IBM i API Raw Response Types
// ============================================================================

export interface IBMiArticleRaw {
  ARID: string;                  // Article ID (6 chars)
  ARDESC: string;                // Description (50 chars)
  ARSALEPR: number;              // Reference sale price
  ARWHSPR: number;               // Stock/warehouse price
  ARTIFA: string;                // Family code (3 chars)
  ARSTOCK: number;               // Current stock quantity
  ARMINQTY: number;              // Minimum stock level
  ARCUSQTY: number;              // Customer quantity
  ARPURQTY: number;              // Purchase quantity
  ARVATCD: string;               // VAT code (1 char)
  ARCREA: string;                // Creation date
  ARMOD: string;                 // Last modified timestamp (ISO format)
  ARMODID: string;               // Modified by user
  ARDEL: string;                 // Soft delete flag (' ' or 'X')
}

export interface IBMiArticleListResponse {
  article_GetArticles_R: IBMiArticleRaw[];
}

// ============================================================================
// Core Article Types (Frontend normalized)
// ============================================================================

export interface Article {
  id: string;                    // ARID - Article ID (6 chars)
  description: string;           // ARDESC - Description (50 chars)
  familyCode: string;            // ARTIFA - Family code (3 chars)
  familyDescription?: string;    // FAMDESC - Family description (from join)
  vatCode: string;               // ARVATCD - VAT code (1 char)
  vatRate?: number;              // VATRATE - VAT rate % (from join)
  vatDescription?: string;       // VATDESC - VAT description (from join)
  salePrice: number;             // ARSALEPR - Reference sale price
  warehousePrice: number;        // ARWHSPR - Stock/warehouse price
  stock: number;                 // ARSTOCK - Current stock quantity
  minimumQuantity: number;       // ARMINQTY - Minimum stock level
  deleted: boolean;              // ARDEL - Soft delete flag
  createdDate?: string;          // ARCREA - Creation date (ISO format)
  modifiedDate?: string;         // ARMOD - Last modified timestamp
  modifiedUser?: string;         // ARMODID - Modified by user
}

export interface ArticleInfo {
  articleId: string;             // ARID - Article ID
  text: string;                  // TEXT - Extended text (1520 chars)
}

// ============================================================================
// Related Entity Types
// ============================================================================

export interface Family {
  CODE: string;                  // Family code from facode service
  DESCRIPTION: string;           // Family description
}

export interface VATDefinition {
  CODE: string;                  // VAT code from parameter service
  RATE: number;                  // VAT rate percentage
  DESCRIPTION: string;           // VAT description
}

export interface Provider {
  id: string;                    // PRID - Provider ID
  name: string;                  // PRNAME - Provider name
}

export interface ArticleProvider {
  articleId: string;             // ARID - Article ID
  providerId: string;            // PRID - Provider ID
  providerReference: string;     // APREF - Provider's reference
  price: number;                 // APPRICE - Provider's price
  defaultProvider: boolean;      // APDEFAULT - Is default provider
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ArticleListRequest {
  page?: number;                 // Page number (1-based)
  pageSize?: number;             // Records per page (default: 14)
  positionTo?: string;           // Position to article ID
  includeDeleted?: boolean;      // Include soft-deleted records
}

export interface ArticleListResponse {
  articles: Article[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ArticleCreateRequest {
  itemId: string;                // ARID - Article/Item ID (6 chars, user-provided)
  description: string;
  familyCode: string;
  vatCode: string;
  salePrice: number;
  warehousePrice: number;
  stock: number;
  minimumQuantity: number;
}

export interface ArticleUpdateRequest {
  description?: string;
  familyCode?: string;
  vatCode?: string;
  salePrice?: number;
  warehousePrice?: number;
  stock?: number;
  minimumQuantity?: number;
}

export interface ArticleResponse {
  article: Article;
  priceWithVAT?: number;         // Calculated: salePrice * (1 + vatRate/100)
}

export interface ArticleInfoRequest {
  text: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export type ArticleAction = 'edit' | 'info' | 'delete' | 'suppliers';

export interface ArticleRowAction {
  articleId: string;
  action: ArticleAction;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ArticleFormState {
  mode: 'create' | 'edit' | 'view';
  article?: Article;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// Lookup/Selection Types
// ============================================================================

export interface FamilyLookupRequest {
  searchTerm?: string;
  limit?: number;
}

export interface FamilyLookupResponse {
  families: Family[];
}

export interface VATLookupResponse {
  vatDefinitions: VATDefinition[];
}

export interface ProviderLookupRequest {
  articleId: string;
}

export interface ProviderLookupResponse {
  providers: ArticleProvider[];
}

// ============================================================================
// Constants
// ============================================================================

export const ARTICLE_ACTIONS = {
  EDIT: 'edit',
  INFO: 'info',
  DELETE: 'delete',
  SUPPLIERS: 'suppliers',
} as const;

export const DEFAULT_PAGE_SIZE = 14;

export const VALIDATION_RULES = {
  ARTICLE_ID_LENGTH: 6,
  DESCRIPTION_MAX_LENGTH: 50,
  FAMILY_CODE_LENGTH: 3,
  VAT_CODE_LENGTH: 2,
  INFO_TEXT_MAX_LENGTH: 1520,
} as const;

// Made with Bob
