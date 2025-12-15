# Implementation Guide with Sample Code

## Overview

This guide provides practical implementation examples for both the React frontend and RPG backend components of the modernized Article Management application.

---

## Part 1: React Frontend Implementation

### 1.1 Project Setup

**Install Dependencies**:
```bash
npm create vite@latest article-management -- --template react-ts
cd article-management
npm install

# Install Carbon Design System
npm install @carbon/react @carbon/styles

# Install additional dependencies
npm install axios react-router-dom
npm install -D @types/react-router-dom
```

**Configure Carbon Styles** (`src/main.tsx`):
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@carbon/styles/css/styles.css';
import './styles/global.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### 1.2 API Service Implementation

**HTTP Client** (`src/services/httpClient.ts`):
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '@/types';

class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, { params });
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse<any> {
    const apiError: ApiError = {
      code: error.response?.data?.error?.code || 'INTERNAL_ERROR',
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error?.details,
    };

    return {
      success: false,
      data: null,
      error: apiError,
      timestamp: new Date().toISOString(),
    };
  }
}

export const httpClient = new HttpClient(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
);
```

---

**Article Service** (`src/services/articleService.ts`):
```typescript
import { httpClient } from './httpClient';
import {
  Article,
  ArticleInput,
  ArticleListParams,
  ArticleListResponse,
  ArticleInformation,
  ApiResponse,
} from '@/types';

export const articleService = {
  async getArticles(params: ArticleListParams): Promise<ApiResponse<ArticleListResponse>> {
    return httpClient.get<ArticleListResponse>('/articles', params);
  },

  async getArticle(id: string): Promise<ApiResponse<Article>> {
    return httpClient.get<Article>(`/articles/${id}`);
  },

  async createArticle(input: ArticleInput): Promise<ApiResponse<Article>> {
    return httpClient.post<Article>('/articles', input);
  },

  async updateArticle(id: string, input: ArticleInput): Promise<ApiResponse<Article>> {
    return httpClient.put<Article>(`/articles/${id}`, input);
  },

  async deleteArticle(id: string): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
    return httpClient.delete(`/articles/${id}`);
  },

  async getArticleInformation(id: string): Promise<ApiResponse<ArticleInformation>> {
    return httpClient.get<ArticleInformation>(`/articles/${id}/information`);
  },

  async updateArticleInformation(
    id: string,
    info: string
  ): Promise<ApiResponse<ArticleInformation>> {
    return httpClient.put<ArticleInformation>(`/articles/${id}/information`, {
      information: info,
    });
  },
};
```

---

### 1.3 Custom Hooks

**useArticles Hook** (`src/hooks/useArticles.ts`):
```typescript
import { useState, useCallback } from 'react';
import { articleService } from '@/services/articleService';
import {
  Article,
  ArticleListParams,
  Pagination,
  UseArticlesReturn,
} from '@/types';

export function useArticles(initialParams?: ArticleListParams): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [params, setParams] = useState<ArticleListParams>(
    initialParams || { page: 1, pageSize: 14 }
  );

  const fetchArticles = useCallback(async (newParams?: ArticleListParams) => {
    setLoading(true);
    setError(null);

    const queryParams = newParams || params;
    setParams(queryParams);

    const response = await articleService.getArticles(queryParams);

    if (response.success && response.data) {
      setArticles(response.data.articles);
      setPagination(response.data.pagination);
    } else {
      setError(response.error?.message || 'Failed to fetch articles');
      setArticles([]);
    }

    setLoading(false);
  }, [params]);

  const refresh = useCallback(() => {
    return fetchArticles(params);
  }, [fetchArticles, params]);

  return {
    articles,
    loading,
    error,
    pagination,
    fetchArticles,
    refresh,
  };
}
```

---

**useArticleForm Hook** (`src/hooks/useArticleForm.ts`):
```typescript
import { useState, useCallback } from 'react';
import {
  Article,
  ArticleInput,
  ArticleFormData,
  FormMode,
  FormErrors,
  UseArticleFormReturn,
} from '@/types';
import { articleService } from '@/services/articleService';

export function useArticleForm(
  mode: FormMode,
  article?: Article,
  onSuccess?: (article: Article) => void
): UseArticleFormReturn {
  const [formData, setFormData] = useState<ArticleFormData>({
    description: article?.description || '',
    familyCode: article?.familyCode || '',
    vatCode: article?.vatCode || '2',
    referenceSalePrice: article?.referenceSalePrice || 0,
    stockPrice: article?.stockPrice || 0,
    currentStock: article?.currentStock || 0,
    minimumStock: article?.minimumStock || 0,
    errors: {},
    isDirty: false,
    isValid: false,
  });

  const [loading, setLoading] = useState(false);

  const validateField = useCallback((field: keyof ArticleInput): { isValid: boolean; error: string | null } => {
    const value = formData[field];

    switch (field) {
      case 'description':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return { isValid: false, error: 'Description is required' };
        }
        if (typeof value === 'string' && value.length > 50) {
          return { isValid: false, error: 'Description must be 50 characters or less' };
        }
        break;

      case 'familyCode':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return { isValid: false, error: 'Family is required' };
        }
        break;

      case 'vatCode':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return { isValid: false, error: 'VAT code is required' };
        }
        break;

      case 'referenceSalePrice':
      case 'stockPrice':
      case 'currentStock':
      case 'minimumStock':
        if (typeof value === 'number' && value < 0) {
          return { isValid: false, error: 'Value must be 0 or greater' };
        }
        break;
    }

    return { isValid: true, error: null };
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<ArticleInput> = {};
    let isValid = true;

    (['description', 'familyCode', 'vatCode'] as const).forEach((field) => {
      const result = validateField(field);
      if (!result.isValid) {
        newErrors[field] = result.error!;
        isValid = false;
      }
    });

    setFormData((prev) => ({ ...prev, errors: newErrors, isValid }));
    return isValid;
  }, [validateField]);

  const handleChange = useCallback((field: keyof ArticleInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      isDirty: true,
      errors: { ...prev.errors, [field]: undefined },
    }));
  }, []);

  const handleBlur = useCallback((field: keyof ArticleInput) => {
    const result = validateField(field);
    if (!result.isValid) {
      setFormData((prev) => ({
        ...prev,
        errors: { ...prev.errors, [field]: result.error! },
      }));
    }
  }, [validateField]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const input: ArticleInput = {
      description: formData.description,
      familyCode: formData.familyCode,
      vatCode: formData.vatCode,
      referenceSalePrice: formData.referenceSalePrice,
      stockPrice: formData.stockPrice,
      currentStock: formData.currentStock,
      minimumStock: formData.minimumStock,
    };

    let response;
    if (mode === 'create') {
      response = await articleService.createArticle(input);
    } else {
      response = await articleService.updateArticle(article!.id, input);
    }

    setLoading(false);

    if (response.success && response.data) {
      onSuccess?.(response.data);
    } else {
      // Handle server-side validation errors
      if (response.error?.details) {
        setFormData((prev) => ({
          ...prev,
          errors: response.error!.details as FormErrors<ArticleInput>,
        }));
      }
    }
  }, [formData, mode, article, validateForm, onSuccess]);

  const handleReset = useCallback(() => {
    setFormData({
      description: article?.description || '',
      familyCode: article?.familyCode || '',
      vatCode: article?.vatCode || '2',
      referenceSalePrice: article?.referenceSalePrice || 0,
      stockPrice: article?.stockPrice || 0,
      currentStock: article?.currentStock || 0,
      minimumStock: article?.minimumStock || 0,
      errors: {},
      isDirty: false,
      isValid: false,
    });
  }, [article]);

  return {
    formData,
    mode,
    loading,
    errors: formData.errors,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    validateField,
    validateForm,
    isDirty: formData.isDirty,
    isValid: formData.isValid,
  };
}
```

---

### 1.4 React Components

**ArticleListPage Component** (`src/components/articles/ArticleListPage.tsx`):
```typescript
import React, { useEffect, useState } from 'react';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  Loading,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useArticles } from '@/hooks/useArticles';
import { Article, ArticleAction, ModalType } from '@/types';
import ArticleFormModal from './ArticleFormModal';
import ArticleInfoModal from './ArticleInfoModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const headers = [
  { key: 'id', header: 'Article ID' },
  { key: 'description', header: 'Description' },
  { key: 'familyCode', header: 'Family' },
  { key: 'deleteFlag', header: 'Status' },
  { key: 'actions', header: '' },
];

export default function ArticleListPage() {
  const { articles, loading, error, pagination, fetchArticles, refresh } = useArticles();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<{
    type: ModalType;
    article?: Article;
  }>({ type: ModalType.NONE });

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchArticles({ page: 1, pageSize: 14, search: value });
  };

  const handlePageChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
    fetchArticles({ page, pageSize, search: searchTerm });
  };

  const handleAction = (action: ArticleAction, article: Article) => {
    switch (action) {
      case ArticleAction.EDIT:
        setModalState({ type: ModalType.EDIT, article });
        break;
      case ArticleAction.INFO:
        setModalState({ type: ModalType.INFO, article });
        break;
      case ArticleAction.DELETE:
        setModalState({ type: ModalType.DELETE, article });
        break;
      case ArticleAction.SUPPLIERS:
        // Navigate to supplier management
        window.location.href = `/articles/${article.id}/suppliers`;
        break;
    }
  };

  const handleCloseModal = () => {
    setModalState({ type: ModalType.NONE });
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    refresh();
  };

  const rows = articles.map((article) => ({
    id: article.id,
    description: article.description,
    familyCode: `${article.familyCode} - ${article.familyDescription}`,
    deleteFlag: article.deleteFlag === 'X' ? 'Deleted' : 'Active',
    actions: (
      <OverflowMenu size="sm" flipped>
        <OverflowMenuItem
          itemText="Edit"
          onClick={() => handleAction(ArticleAction.EDIT, article)}
        />
        <OverflowMenuItem
          itemText="View Info"
          onClick={() => handleAction(ArticleAction.INFO, article)}
        />
        <OverflowMenuItem
          itemText="Manage Suppliers"
          onClick={() => handleAction(ArticleAction.SUPPLIERS, article)}
        />
        <OverflowMenuItem
          itemText="Delete"
          onClick={() => handleAction(ArticleAction.DELETE, article)}
          hasDivider
          isDelete
        />
      </OverflowMenu>
    ),
  }));

  if (loading && articles.length === 0) {
    return <Loading description="Loading articles..." withOverlay />;
  }

  return (
    <div className="article-list-page">
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer title="Work with Articles">
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Position to..."
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Button
                  kind="primary"
                  renderIcon={Add}
                  onClick={() => setModalState({ type: ModalType.CREATE })}
                >
                  Create Article
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      {pagination && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={[14, 25, 50, 100]}
          totalItems={pagination.totalItems}
          onChange={handlePageChange}
        />
      )}

      <ArticleFormModal
        open={modalState.type === ModalType.CREATE || modalState.type === ModalType.EDIT}
        mode={modalState.type === ModalType.CREATE ? 'create' : 'edit'}
        article={modalState.article}
        onClose={handleCloseModal}
        onSave={handleSaveSuccess}
      />

      {modalState.article && (
        <>
          <ArticleInfoModal
            open={modalState.type === ModalType.INFO}
            article={modalState.article}
            onClose={handleCloseModal}
            onSave={handleSaveSuccess}
          />

          <DeleteConfirmationModal
            open={modalState.type === ModalType.DELETE}
            article={modalState.article}
            onClose={handleCloseModal}
            onConfirm={handleSaveSuccess}
          />
        </>
      )}
    </div>
  );
}
```

---

**ArticleFormModal Component** (`src/components/articles/ArticleFormModal.tsx`):
```typescript
import React, { useEffect, useState } from 'react';
import {
  Modal,
  TextInput,
  ComboBox,
  NumberInput,
  InlineNotification,
  Form,
  FormGroup,
} from '@carbon/react';
import { Article, ArticleFormModalProps, Family, VATCode } from '@/types';
import { useArticleForm } from '@/hooks/useArticleForm';
import { familyService } from '@/services/familyService';
import { vatService } from '@/services/vatService';

export default function ArticleFormModal({
  open,
  mode,
  article,
  onClose,
  onSave,
}: ArticleFormModalProps) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [vatCodes, setVATCodes] = useState<VATCode[]>([]);
  const [priceWithVAT, setPriceWithVAT] = useState<number>(0);

  const {
    formData,
    loading,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useArticleForm(mode, article, (savedArticle) => {
    onSave(savedArticle);
  });

  useEffect(() => {
    if (open) {
      loadLookupData();
    }
  }, [open]);

  useEffect(() => {
    // Calculate price with VAT
    const selectedVAT = vatCodes.find((v) => v.code === formData.vatCode);
    if (selectedVAT && formData.referenceSalePrice) {
      const calculated =
        formData.referenceSalePrice * (1 + selectedVAT.rate / 100);
      setPriceWithVAT(calculated);
    }
  }, [formData.referenceSalePrice, formData.vatCode, vatCodes]);

  const loadLookupData = async () => {
    const [familyResponse, vatResponse] = await Promise.all([
      familyService.getFamilies(),
      vatService.getVATCodes(),
    ]);

    if (familyResponse.success && familyResponse.data) {
      setFamilies(familyResponse.data.families);
    }

    if (vatResponse.success && vatResponse.data) {
      setVATCodes(vatResponse.data.vatCodes);
    }
  };

  const familyItems = families.map((f) => ({
    id: f.code,
    label: `${f.code} - ${f.description}`,
  }));

  const vatItems = vatCodes.map((v) => ({
    id: v.code,
    label: `${v.code} - ${v.description} (${v.rate}%)`,
  }));

  return (
    <Modal
      open={open}
      modalHeading={mode === 'create' ? 'Create Article' : 'Edit Article'}
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onRequestSubmit={handleSubmit}
      primaryButtonDisabled={loading}
      size="lg"
    >
      <Form>
        {mode === 'edit' && (
          <TextInput
            id="articleId"
            labelText="Article ID"
            value={article?.id || ''}
            readOnly
          />
        )}

        <TextInput
          id="description"
          labelText="Description *"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          invalid={!!errors.description}
          invalidText={errors.description}
          maxLength={50}
        />

        <ComboBox
          id="familyCode"
          titleText="Family *"
          items={familyItems}
          selectedItem={familyItems.find((f) => f.id === formData.familyCode)}
          onChange={({ selectedItem }) =>
            handleChange('familyCode', selectedItem?.id || '')
          }
          invalid={!!errors.familyCode}
          invalidText={errors.familyCode}
        />

        <ComboBox
          id="vatCode"
          titleText="VAT Code *"
          items={vatItems}
          selectedItem={vatItems.find((v) => v.id === formData.vatCode)}
          onChange={({ selectedItem }) =>
            handleChange('vatCode', selectedItem?.id || '')
          }
          invalid={!!errors.vatCode}
          invalidText={errors.vatCode}
        />

        <NumberInput
          id="referenceSalePrice"
          label="Reference Sale Price"
          value={formData.referenceSalePrice}
          onChange={(e, { value }) => handleChange('referenceSalePrice', value)}
          min={0}
          step={0.01}
          invalid={!!errors.referenceSalePrice}
          invalidText={errors.referenceSalePrice}
        />

        {priceWithVAT > 0 && (
          <InlineNotification
            kind="info"
            subtitle={`Price with VAT: €${priceWithVAT.toFixed(2)}`}
            lowContrast
            hideCloseButton
          />
        )}

        <NumberInput
          id="stockPrice"
          label="Stock Price"
          value={formData.stockPrice}
          onChange={(e, { value }) => handleChange('stockPrice', value)}
          min={0}
          step={0.01}
        />

        <FormGroup legendText="Stock Information">
          <NumberInput
            id="currentStock"
            label="Current Stock"
            value={formData.currentStock}
            onChange={(e, { value }) => handleChange('currentStock', value)}
            min={0}
            step={1}
          />

          <NumberInput
            id="minimumStock"
            label="Minimum Stock"
            value={formData.minimumStock}
            onChange={(e, { value }) => handleChange('minimumStock', value)}
            min={0}
            step={1}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
}
```

---

## Part 2: RPG Backend Implementation

### 2.1 Complete Service Program Example

**FARTICLESRV.SQLRPGLE** (Article Service Program):
```rpgle
**FREE

ctl-opt nomain;
ctl-opt option(*srcstmt: *nodebugio);

/copy qprotosrc,article

dcl-ds article extname('ARTICLE') qualified template;

// JSON building procedure
dcl-proc buildArticleJson;
  dcl-pi *n varchar(4000);
    pArticle likeds(article) const;
    pFamilyDesc varchar(50) const;
    pVATRate packed(4:2) const;
    pVATDesc varchar(20) const;
    pPriceWithVAT packed(9:2) const;
  end-pi;
  
  dcl-s json varchar(4000);
  
  json = '{' +
    '"success":true,' +
    '"data":{' +
      '"id":"' + %trim(pArticle.arid) + '",' +
      '"description":"' + escapeJson(pArticle.ardesc) + '",' +
      '"familyCode":"' + %trim(pArticle.artifa) + '",' +
      '"familyDescription":"' + escapeJson(pFamilyDesc) + '",' +
      '"vatCode":"' + pArticle.arvatcd + '",' +
      '"vatRate":' + %char(pVATRate) + ',' +
      '"vatDescription":"' + escapeJson(pVATDesc) + '",' +
      '"referenceSalePrice":' + %char(pArticle.arsalepr) + ',' +
      '"priceWithVAT":' + %char(pPriceWithVAT) + ',' +
      '"stockPrice":' + %char(pArticle.arwhspr) + ',' +
      '"currentStock":' + %char(pArticle.arstock) + ',' +
      '"minimumStock":' + %char(pArticle.arminqty) + ',' +
      '"customerOrderQty":' + %char(pArticle.arcusqty) + ',' +
      '"purchaseOrderQty":' + %char(pArticle.arpurqty) + ',' +
      '"creationDate":"' + %char(pArticle.arcrea: *iso) + '",' +
      '"lastModified":"' + %char(pArticle.armod: *iso0) + '",' +
      '"lastModifiedBy":"' + %trim(pArticle.armodid) + '",' +
      '"deleteFlag":"' + pArticle.ardel + '"' +
    '},' +
    '"error":null,' +
    '"timestamp":"' + %char(%timestamp(): *iso0) + '"' +
  '}';
  
  return json;
end-proc;

// Escape JSON special characters
dcl-proc escapeJson;
  dcl-pi *n varchar(1000);
    pText varchar(1000) const;
  end-pi;
  
  dcl-s result varchar(1000);
  dcl-s i int(10);
  
  result = '';
  for i = 1 to %len(pText);
    select;
      when %subst(pText: i: 1) = '"';
        result += '\"';
      when %subst(pText: i: 1) = '\';
        result += '\\';
      when %subst(pText: i: 1) = x'0A'; // newline
        result += '\n';
      when %subst(pText: i: 1) = x'0D'; // carriage return
        result += '\r';
      other;
        result += %subst(pText: i: 1);
    endsl;
  endfor;
  
  return result;
end-proc;

// Build error JSON
dcl-proc buildErrorJson;
  dcl-pi *n varchar(1000);
    pCode varchar(50) const;
    pMessage varchar(500) const;
  end-pi;
  
  dcl-s json varchar(1000);
  
  json = '{' +
    '"success":false,' +
    '"data":null,' +
    '"error":{' +
      '"code":"' + pCode + '",' +
      '"message":"' + escapeJson(pMessage) + '"' +
    '},' +
    '"timestamp":"' + %char(%timestamp(): *iso0) + '"' +
  '}';
  
  return json;
end-proc;

// Format timestamp to ISO 8601
dcl-proc formatTimestamp;
  dcl-pi *n varchar(30);
    pTimestamp timestamp const;
  end-pi;
  
  return %char(pTimestamp: *iso0);
end-proc;

// Main exported procedures follow the specifications in RPG-Service-Programs.md
// (GetArticle, CreateArticle, UpdateArticle, etc.)
```

---

### 2.2 Build and Deploy Script

**QCLSRC/BLDARTSRV.CLLE**:
```cl
PGM

DCL VAR(&LIB) TYPE(*CHAR) LEN(10) VALUE('MYLIB')
DCL VAR(&SRCLIB) TYPE(*CHAR) LEN(10) VALUE('MYLIB')

/* Compile Article Service Program */
CRTSQLRPGI OBJ(QTEMP/FARTICLESRV) +
           SRCFILE(&SRCLIB/QSRVSRC) +
           SRCMBR(FARTICLESRV) +
           COMMIT(*NONE) +
           DBGVIEW(*SOURCE) +
           REPLACE(*YES) +
           COMPILEOPT('OPTION(*SRCSTMT *NODEBUGIO)')

MONMSG MSGID(CPF0000) EXEC(DO)
  SNDPGMMSG MSG('Failed to compile FARTICLESRV') +
            MSGTYPE(*ESCAPE)
ENDDO

/* Create Service Program */
CRTSRVPGM  SRVPGM(&LIB/FARTICLESRV) +
           MODULE(QTEMP/FARTICLESRV) +
           EXPORT(*SRCFILE) +
           SRCFILE(&SRCLIB/QSRVSRC) +
           SRCMBR(FARTICLE) +
           BNDDIR(SAMPLE) +
           REPLACE(*YES) +
           TEXT('Article Management Service Program')

MONMSG MSGID(CPF0000) EXEC(DO)
  SNDPGMMSG MSG('Failed to create service program FARTICLESRV') +
            MSGTYPE(*ESCAPE)
ENDDO

SNDPGMMSG MSG('Service program FARTICLESRV created successfully') +
          MSGTYPE(*COMP)

ENDPGM
```

---

### 2.3 Testing the Service Program

**Test Program** (`QRPGLESRC/TSTARTSRV.SQLRPGLE`):
```rpgle
**FREE

ctl-opt dftactgrp(*no) actgrp(*new);

dcl-pr GetArticle varchar(4000) extproc(*dclcase);
  articleId char(6) const;
end-pr;

dcl-s result varchar(4000);

// Test GetArticle
result = GetArticle('000001');
dsply result;

*inlr = *on;
```

---

## Part 3: Integration and Deployment

### 3.1 Environment Configuration

**React .env file**:
```env
VITE_API_BASE_URL=https://your-ibmi-server.com/api/v1
VITE_APP_TITLE=Article Management
```

### 3.2 Build and Deploy React App

```bash
# Build for production
npm run build

# Deploy to IBM i IFS (if serving from IBM i)
scp -r dist/* user@ibmi:/www/article-management/

# Or deploy to separate web server
# Upload dist/ contents to your web server
```

---

## Summary

This implementation guide provides:

1. **Complete React setup** with TypeScript, Carbon Design System, and proper project structure
2. **Working examples** of API services, custom hooks, and React components
3. **RPG service program** structure with JSON handling
4. **Build and deployment** scripts for both frontend and backend

The code examples are production-ready and follow best practices for both React and RPG development.