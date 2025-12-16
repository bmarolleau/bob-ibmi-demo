/**
 * API Client
 * Axios instance with interceptors for error handling and request/response transformation
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, HTTP_STATUS } from './api.config';
import { ApiError, ApiResponse } from '../types/article.types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
          return {
            code: 'BAD_REQUEST',
            message: data?.message || 'Invalid request data',
            field: data?.field,
            details: data?.details,
          };

        case HTTP_STATUS.UNAUTHORIZED:
          return {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          };

        case HTTP_STATUS.FORBIDDEN:
          return {
            code: 'FORBIDDEN',
            message: 'Access denied',
          };

        case HTTP_STATUS.NOT_FOUND:
          return {
            code: 'NOT_FOUND',
            message: data?.message || 'Resource not found',
          };

        case HTTP_STATUS.CONFLICT:
          return {
            code: 'CONFLICT',
            message: data?.message || 'Resource conflict',
          };

        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          return {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An internal server error occurred',
          };

        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: data?.message || 'An unexpected error occurred',
          };
      }
    } else if (error.request) {
      // Request made but no response received
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      };
    } else {
      // Error in request setup
      return {
        code: 'REQUEST_ERROR',
        message: error.message || 'Failed to make request',
      };
    }
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Made with Bob
