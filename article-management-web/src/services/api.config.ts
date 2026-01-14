/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/web/services/article',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Article endpoints - IBM i Web Services
  articles: {
    list: '/articles',  // GET endpoint that returns article_GetArticles_R array
    detail: (id: string) => `/articles/${id}`,
    create: '/articles',
    update: (id: string) => `/articles/${id}`,
    delete: (id: string) => `/articles/${id}`,
    info: (id: string) => `/articles/${id}/info`,
    providers: (id: string) => `/articles/${id}/providers`,
  },
  
  // Lookup endpoints
  lookups: {
    families: '/lookups/families',
    vat: '/lookups/vat',
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
