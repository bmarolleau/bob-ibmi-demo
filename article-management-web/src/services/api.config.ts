/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  // Use empty string for development (uses Vite proxy)
  // Set VITE_API_BASE_URL for production deployment
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Article endpoints - IBM i Web Services
  articles: {
    list: '/web/services/article/articles',  // GET endpoint that returns article_GetArticles_R array
    detail: (id: string) => `/web/services/article/articles/${id}`,
    create: '/web/services/article/articles',
    update: (id: string) => `/web/services/article/articles/${id}`,
    delete: (id: string) => `/web/services/article/articles/${id}`,
    info: (id: string) => `/web/services/article/articles/${id}/info`,
    providers: (id: string) => `/web/services/article/articles/${id}/providers`,
  },
  
  // Lookup endpoints
  lookups: {
    families: '/web/services/facode/family',  // Real family service endpoint
    vat: '/web/services/parameter/vat',  // Real VAT service endpoint
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Made with Bob
