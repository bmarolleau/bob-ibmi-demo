/**
 * Article Management System - TypeScript Type Definitions
 * Based on IBM i ARTICLE physical file and related structures
 */

// ============================================================================
// Core Article Types
// ============================================================================

export interface Article {
  id: string;                    // ARID - Article ID (6 chars)
  description: string;           // ARDESC - Description (50 chars)
  familyCode: string;            // ARTIFA - Family code (3 chars)
  familyDescription?: string;    // FAMDESC - Family description (from join)
  vatCode: string;               // ARVATCD - VAT code (2 chars)
  vatRate?: number;              // VATRATE - VAT rate % (from join)
  vatDescription?: string;       // VATDESC - VAT description (from join)
  salePrice: number;             // ARSALEPR - Reference sale price
  warehousePrice: number;        // ARWHSPR - Stock/warehouse price
  stock: number;                 // ARSTOCK - Current stock quantity
  minimumQuantity: number;       // ARMINQTY - Minimum stock level
  deleted: boolean;              // ARDEL - Soft delete flag
  createdDate?: string;          // ARCREDAT - Creation date (ISO format)
  createdTime?: string;          // ARCRETIM - Creation time
  createdUser?: string;          // ARCREUSR - Created by user
  modifiedDate?: string;         // ARMODDAT - Last modified date
  modifiedTime?: string;         // ARMODTIM - Last modified time
  modifiedUser?: string;         // ARMODUSR - Modified by user
}

export interface ArticleInfo {
  articleId: string;             // ARID - Article ID
  text: string;                  // TEXT - Extended text (1520 chars)
}

// ============================================================================
// Related Entity Types
// ============================================================================

export interface Family {
  code: string;                  // FACODE - Family code (3 chars)
  description: string;           // FADESC - Family description (30 chars)
}

export interface VATDefinition {
  code: string;                  // VATCODE - VAT code (2 chars)
  rate: number;                  // VATRATE - VAT rate percentage
  description: string;           // VATDESC - VAT description (30 chars)
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
