/**
 * Article Service
 * Business logic layer for article-related API calls
 */

import { apiClient } from './api.client';
import { API_CONFIG, API_ENDPOINTS } from './api.config';
import {
  Article,
  ArticleListRequest,
  ArticleListResponse,
  ArticleCreateRequest,
  ArticleUpdateRequest,
  ArticleResponse,
  ArticleInfo,
  ArticleInfoRequest,
  FamilyLookupRequest,
  FamilyLookupResponse,
  VATLookupResponse,
  ProviderLookupResponse,
  ApiResponse,
  DEFAULT_PAGE_SIZE,
  IBMiArticleRaw,
  IBMiArticleListResponse,
} from '../types/article.types';

class ArticleService {
  /**
   * Transform IBM i raw article data to frontend Article format
   */
  private transformArticle(raw: IBMiArticleRaw): Article {
    return {
      id: raw.ARID.trim(),
      description: raw.ARDESC.trim(),
      familyCode: raw.ARTIFA.trim(),
      vatCode: raw.ARVATCD.trim(),
      salePrice: raw.ARSALEPR,
      warehousePrice: raw.ARWHSPR,
      stock: raw.ARSTOCK,
      minimumQuantity: raw.ARMINQTY,
      deleted: raw.ARDEL.trim() !== '',
      createdDate: raw.ARCREA,
      modifiedDate: raw.ARMOD,
      modifiedUser: raw.ARMODID.trim(),
    };
  }

  /**
   * Get paginated list of articles
   */
  async getArticles(request: ArticleListRequest = {}): Promise<ApiResponse<ArticleListResponse>> {
    try {
      // Call IBM i Web Services endpoint
      const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.articles.list}`;
      console.log('Fetching articles from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: IBMiArticleListResponse = await response.json();
      
      // Transform IBM i format to frontend format
      const articles = data.article_GetArticles_R.map(raw => this.transformArticle(raw));
      
      // Apply client-side filtering and pagination
      let filteredArticles = articles;
      
      // Filter by positionTo (search)
      if (request.positionTo) {
        const searchTerm = request.positionTo.toUpperCase();
        filteredArticles = articles.filter(article =>
          article.id.toUpperCase().includes(searchTerm) ||
          article.description.toUpperCase().includes(searchTerm)
        );
      }
      
      // Filter deleted if needed
      if (!request.includeDeleted) {
        filteredArticles = filteredArticles.filter(article => !article.deleted);
      }
      
      // Calculate pagination
      const page = request.page || 1;
      const pageSize = request.pageSize || DEFAULT_PAGE_SIZE;
      const totalRecords = filteredArticles.length;
      const totalPages = Math.ceil(totalRecords / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          articles: paginatedArticles,
          pagination: {
            currentPage: page,
            pageSize: pageSize,
            totalRecords: totalRecords,
            totalPages: totalPages,
            hasMore: page < totalPages,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch articles',
        },
      };
    }
  }

  /**
   * Get single article by ID
   */
  async getArticle(id: string): Promise<ApiResponse<ArticleResponse>> {
    return apiClient.get<ArticleResponse>(API_ENDPOINTS.articles.detail(id));
  }

  /**
   * Create new article using form parameters
   */
  async createArticle(data: ArticleCreateRequest): Promise<ApiResponse<ArticleResponse>> {
    try {
      const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.articles.create}`;
      console.log('Creating article at:', url);
      
      // Convert data to URLSearchParams for form encoding
      const formData = new URLSearchParams();
      formData.append('itemId', data.itemId);
      formData.append('description', data.description);
      formData.append('familyCode', data.familyCode);
      formData.append('vatCode', data.vatCode);
      formData.append('salePrice', data.salePrice.toString());
      formData.append('warehousePrice', data.warehousePrice.toString());
      formData.append('stock', data.stock.toString());
      formData.append('minimumQuantity', data.minimumQuantity.toString());
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          result = JSON.parse(text);
        } else {
          // Empty response but successful - return success with created item ID
          result = { article: { id: data.itemId } };
        }
      } else {
        // Non-JSON response - assume success if status is OK
        result = { article: { id: data.itemId } };
      }
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create article',
        },
      };
    }
  }

  /**
   * Update existing article using form parameters
   */
  async updateArticle(id: string, data: ArticleUpdateRequest): Promise<ApiResponse<ArticleResponse>> {
    try {
      const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.articles.update(id)}`;
      console.log('Updating article at:', url);
      
      // Convert data to URLSearchParams for form encoding
      const formData = new URLSearchParams();
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.familyCode !== undefined) formData.append('familyCode', data.familyCode);
      if (data.vatCode !== undefined) formData.append('vatCode', data.vatCode);
      if (data.salePrice !== undefined) formData.append('salePrice', data.salePrice.toString());
      if (data.warehousePrice !== undefined) formData.append('warehousePrice', data.warehousePrice.toString());
      if (data.stock !== undefined) formData.append('stock', data.stock.toString());
      if (data.minimumQuantity !== undefined) formData.append('minimumQuantity', data.minimumQuantity.toString());
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          result = JSON.parse(text);
        } else {
          // Empty response but successful - return success with updated item ID
          result = { article: { id } };
        }
      } else {
        // Non-JSON response - assume success if status is OK
        result = { article: { id } };
      }
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update article',
        },
      };
    }
  }

  /**
   * Soft delete article
   */
  async deleteArticle(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.articles.delete(id));
  }

  /**
   * Get article extended information
   */
  async getArticleInfo(id: string): Promise<ApiResponse<ArticleInfo>> {
    return apiClient.get<ArticleInfo>(API_ENDPOINTS.articles.info(id));
  }

  /**
   * Update article extended information
   */
  async updateArticleInfo(id: string, data: ArticleInfoRequest): Promise<ApiResponse<ArticleInfo>> {
    return apiClient.put<ArticleInfo>(API_ENDPOINTS.articles.info(id), data);
  }

  /**
   * Get article providers/suppliers
   */
  async getArticleProviders(id: string): Promise<ApiResponse<ProviderLookupResponse>> {
    return apiClient.get<ProviderLookupResponse>(API_ENDPOINTS.articles.providers(id));
  }

  /**
   * Search families for lookup/prompt from facode service
   */
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

  /**
   * Get all VAT definitions from parameter service
   */
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

  /**
   * Calculate price with VAT
   */
  calculatePriceWithVAT(salePrice: number, vatRate: number): number {
    return salePrice * (1 + vatRate / 100);
  }

  /**
   * Validate article data
   */
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

    if (data.familyCode !== undefined) {
      if (!data.familyCode.trim()) {
        errors.push('Family code is required');
      }
      if (data.familyCode.length !== 3) {
        errors.push('Family code must be exactly 3 characters');
      }
    }

    if (data.vatCode !== undefined) {
      if (!data.vatCode.trim()) {
        errors.push('VAT code is required');
      }
      if (data.vatCode.length > 1) {
        errors.push('VAT code must be 1 character');
      }
    }

    if (data.salePrice !== undefined && data.salePrice < 0) {
      errors.push('Sale price must be positive');
    }

    if (data.warehousePrice !== undefined && data.warehousePrice < 0) {
      errors.push('Warehouse price must be positive');
    }

    if (data.stock !== undefined && data.stock < 0) {
      errors.push('Stock must be positive');
    }

    if (data.minimumQuantity !== undefined && data.minimumQuantity < 0) {
      errors.push('Minimum quantity must be positive');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format article for display
   */
  formatArticle(article: Article): Article {
    return {
      ...article,
      salePrice: Number(article.salePrice.toFixed(2)),
      warehousePrice: Number(article.warehousePrice.toFixed(2)),
      stock: Math.floor(article.stock),
      minimumQuantity: Math.floor(article.minimumQuantity),
    };
  }
}

// Export singleton instance
export const articleService = new ArticleService();

// Made with Bob
