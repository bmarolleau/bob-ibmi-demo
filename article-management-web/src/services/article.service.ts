/**
 * Article Service
 * Business logic layer for article-related API calls
 */

import { apiClient } from './api.client';
import { API_ENDPOINTS } from './api.config';
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
  ProviderLookupRequest,
  ProviderLookupResponse,
  ApiResponse,
  DEFAULT_PAGE_SIZE,
} from '../types/article.types';

class ArticleService {
  /**
   * Get paginated list of articles
   */
  async getArticles(request: ArticleListRequest = {}): Promise<ApiResponse<ArticleListResponse>> {
    const params = {
      page: request.page || 1,
      pageSize: request.pageSize || DEFAULT_PAGE_SIZE,
      positionTo: request.positionTo,
      includeDeleted: request.includeDeleted || false,
    };

    return apiClient.get<ArticleListResponse>(API_ENDPOINTS.articles.list, { params });
  }

  /**
   * Get single article by ID
   */
  async getArticle(id: string): Promise<ApiResponse<ArticleResponse>> {
    return apiClient.get<ArticleResponse>(API_ENDPOINTS.articles.detail(id));
  }

  /**
   * Create new article
   */
  async createArticle(data: ArticleCreateRequest): Promise<ApiResponse<ArticleResponse>> {
    return apiClient.post<ArticleResponse>(API_ENDPOINTS.articles.create, data);
  }

  /**
   * Update existing article
   */
  async updateArticle(id: string, data: ArticleUpdateRequest): Promise<ApiResponse<ArticleResponse>> {
    return apiClient.put<ArticleResponse>(API_ENDPOINTS.articles.update(id), data);
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
   * Search families for lookup/prompt
   */
  async searchFamilies(request: FamilyLookupRequest = {}): Promise<ApiResponse<FamilyLookupResponse>> {
    const params = {
      searchTerm: request.searchTerm,
      limit: request.limit || 50,
    };

    return apiClient.get<FamilyLookupResponse>(API_ENDPOINTS.lookups.families, { params });
  }

  /**
   * Get all VAT definitions
   */
  async getVATDefinitions(): Promise<ApiResponse<VATLookupResponse>> {
    return apiClient.get<VATLookupResponse>(API_ENDPOINTS.lookups.vat);
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
      if (data.vatCode.length !== 2) {
        errors.push('VAT code must be exactly 2 characters');
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
