# React Application Architecture - Article Management

## Overview

This document outlines the React application architecture for modernizing the ART200D IBM i screen using IBM Carbon Design System components.

---

## 1. Component Hierarchy

```
ArticleManagementApp
├── ArticleListPage (Screen 1)
│   ├── PageHeader
│   ├── ArticleSearchBar
│   ├── ArticleDataTable
│   │   ├── DataTableToolbar
│   │   ├── DataTableHeader
│   │   ├── DataTableBody
│   │   │   └── ArticleRow (multiple)
│   │   │       └── OverflowMenu (actions)
│   │   └── DataTablePagination
│   └── CreateArticleButton
│
├── ArticleFormModal (Screen 2)
│   ├── ModalHeader
│   ├── ModalBody
│   │   ├── TextInput (Article ID - readonly)
│   │   ├── TextInput (Description)
│   │   ├── ComboBox (Family with search)
│   │   ├── ComboBox (VAT Code)
│   │   ├── NumberInput (Reference Sale Price)
│   │   ├── NumberInput (Stock Price)
│   │   ├── NumberInput (Minimum Stock)
│   │   ├── NumberInput (Current Stock)
│   │   └── InlineNotification (calculated VAT)
│   └── ModalFooter
│       ├── Button (Cancel)
│       └── Button (Save)
│
├── ArticleInfoModal (Screen 3)
│   ├── ModalHeader
│   ├── ModalBody
│   │   ├── ArticleContextDisplay
│   │   └── TextArea (large, 1520 chars)
│   └── ModalFooter
│       ├── Button (Cancel)
│       └── Button (Save)
│
├── DeleteConfirmationModal
│   ├── ModalHeader
│   ├── ModalBody
│   └── ModalFooter
│
└── FamilySelectionModal (F4 Prompt equivalent)
    ├── ModalHeader
    ├── Search
    ├── DataTable (families)
    └── ModalFooter
```

---

## 2. Carbon Design System Components Mapping

### Screen 1: Article List

| Legacy Element | Carbon Component | Props/Config |
|----------------|------------------|--------------|
| Subfile grid | `DataTable` | sortable, selectable |
| Position to field | `Search` | placeholder="Position to..." |
| Option column | `OverflowMenu` | with action items |
| Column headers | `TableHeader` | sortable |
| Pagination | `Pagination` | pageSize=14, pageSizes=[14,25,50,100] |
| F6=Create button | `Button` | kind="primary", renderIcon={Add} |
| F3=Exit | Browser back/close | - |
| F12=Cancel | Button | kind="secondary" |

### Screen 2: Article Form

| Legacy Element | Carbon Component | Props/Config |
|----------------|------------------|--------------|
| Modal window | `Modal` | size="lg", modalHeading="Article definition" |
| Article ID | `TextInput` | readOnly={mode==='edit'}, labelText="Article ID" |
| Description | `TextInput` | required, maxLength={50}, invalid={error} |
| Family | `ComboBox` | items={families}, itemToString, onChange |
| VAT Code | `ComboBox` | items={vatCodes}, itemToString |
| Sale Price | `NumberInput` | min={0}, step={0.01}, allowEmpty={false} |
| Stock Price | `NumberInput` | min={0}, step={0.01} |
| Min Stock | `NumberInput` | min={0}, step={1} |
| Current Stock | `NumberInput` | min={0}, step={1} |
| VAT calculation | `InlineNotification` | kind="info", subtitle="Price with VAT: €120.00" |
| F4=Prompt | `Button` | size="sm", kind="ghost", renderIcon={Search} |
| Save button | `Button` | kind="primary" |
| Cancel button | `Button` | kind="secondary" |

### Screen 3: Article Information

| Legacy Element | Carbon Component | Props/Config |
|----------------|------------------|--------------|
| Modal window | `Modal` | size="lg", modalHeading="Article Information" |
| Context display | `StructuredListWrapper` | Article ID and description |
| Text area | `TextArea` | rows={15}, maxLength={1520}, enableCounter |
| Save button | `Button` | kind="primary" |
| Cancel button | `Button` | kind="secondary" |

---

## 3. Component Specifications

### ArticleListPage Component

**Purpose**: Main list view with search, filter, and action capabilities

**State Management**:
```typescript
interface ArticleListState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
  };
  searchTerm: string;
  sortColumn: string;
  sortDirection: 'ASC' | 'DESC';
  selectedArticle: Article | null;
  modalOpen: 'none' | 'create' | 'edit' | 'info' | 'delete';
}
```

**Key Features**:
- Real-time search/filter (position-to functionality)
- Sortable columns (ID, Description, Family)
- Row actions via overflow menu
- Pagination with configurable page sizes
- Loading states and error handling
- Responsive design (mobile-friendly)

**Carbon Components Used**:
- `DataTable` with `TableToolbar`, `TableBatchActions`
- `Search` for position-to functionality
- `Button` for create action
- `Pagination`
- `Loading` skeleton
- `InlineNotification` for errors

---

### ArticleFormModal Component

**Purpose**: Create or edit article details

**Props**:
```typescript
interface ArticleFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  article?: Article;
  onClose: () => void;
  onSave: (article: Article) => Promise<void>;
}
```

**State Management**:
```typescript
interface ArticleFormState {
  formData: ArticleFormData;
  errors: Record<string, string>;
  families: Family[];
  vatCodes: VATCode[];
  loading: boolean;
  familySearchOpen: boolean;
}
```

**Validation Rules**:
- Description: Required, max 50 chars
- Family: Must exist in family list
- VAT Code: Must exist in VAT list
- Prices: Numeric, >= 0
- Stock quantities: Integer, >= 0

**Calculated Fields**:
- Price with VAT = Sale Price × (1 + VAT Rate / 100)

**Carbon Components Used**:
- `Modal` with `ModalHeader`, `ModalBody`, `ModalFooter`
- `Form` with `FormGroup`
- `TextInput` for text fields
- `ComboBox` for dropdowns with search
- `NumberInput` for numeric fields
- `InlineNotification` for VAT calculation display
- `Button` for actions

---

### ArticleInfoModal Component

**Purpose**: Manage extended article information text

**Props**:
```typescript
interface ArticleInfoModalProps {
  open: boolean;
  article: Article;
  onClose: () => void;
  onSave: (articleId: string, info: string) => Promise<void>;
}
```

**State Management**:
```typescript
interface ArticleInfoState {
  infoText: string;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}
```

**Carbon Components Used**:
- `Modal`
- `StructuredListWrapper` for article context
- `TextArea` with character counter
- `Button` for save/cancel

---

### ArticleDataTable Component

**Purpose**: Reusable data table with sorting, filtering, and actions

**Columns Configuration**:
```typescript
const columns = [
  {
    key: 'actions',
    header: '',
    width: '48px',
  },
  {
    key: 'articleId',
    header: 'Article ID',
    sortable: true,
  },
  {
    key: 'description',
    header: 'Description',
    sortable: true,
  },
  {
    key: 'familyCode',
    header: 'Family',
    sortable: true,
  },
  {
    key: 'deleteFlag',
    header: 'Status',
    render: (value) => value === 'X' ? 'Deleted' : 'Active',
  },
];
```

**Row Actions**:
- Edit (Option 2)
- View Info (Option 3)
- Delete (Option 4)
- Manage Suppliers (Option 6)

---

## 4. State Management Strategy

### Recommended: React Context + Custom Hooks

**ArticleContext**:
```typescript
interface ArticleContextValue {
  articles: Article[];
  loading: boolean;
  error: string | null;
  fetchArticles: (params: FetchParams) => Promise<void>;
  createArticle: (article: ArticleInput) => Promise<Article>;
  updateArticle: (id: string, article: ArticleInput) => Promise<Article>;
  deleteArticle: (id: string) => Promise<void>;
  getArticleInfo: (id: string) => Promise<string>;
  updateArticleInfo: (id: string, info: string) => Promise<void>;
}
```

**Custom Hooks**:
- `useArticles()`: Access article context
- `useArticleForm()`: Form state and validation
- `useArticleInfo()`: Article information management
- `useFamilies()`: Family lookup data
- `useVATCodes()`: VAT code lookup data

---

## 5. Routing Structure

```
/articles                    → ArticleListPage
/articles/create            → ArticleListPage with create modal
/articles/:id/edit          → ArticleListPage with edit modal
/articles/:id/info          → ArticleListPage with info modal
/articles/:id/suppliers     → Supplier management page (ART201)
```

**Note**: Using modal-based routing keeps the list context visible, similar to the original green screen experience.

---

## 6. Responsive Design Considerations

### Desktop (>1024px)
- Full data table with all columns
- Modal width: 768px
- Side-by-side form layout where appropriate

### Tablet (768px - 1024px)
- Condensed table columns
- Modal width: 90vw
- Stacked form layout

### Mobile (<768px)
- Card-based list view instead of table
- Full-screen modals
- Single-column form layout
- Simplified actions (swipe gestures)

---

## 7. Accessibility Features

### WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- Tab order follows logical flow
- Enter key submits forms
- Escape key closes modals
- Arrow keys navigate table rows

**Screen Reader Support**:
- Proper ARIA labels on all interactive elements
- Form field associations with labels
- Error announcements
- Loading state announcements

**Visual Accessibility**:
- Minimum 4.5:1 contrast ratio
- Focus indicators on all interactive elements
- Error states with color + icon + text
- Resizable text up to 200%

---

## 8. Performance Optimization

### Data Loading
- Implement virtual scrolling for large datasets
- Debounce search input (300ms)
- Cache family and VAT code lookups
- Optimistic UI updates

### Code Splitting
```typescript
const ArticleFormModal = lazy(() => import('./ArticleFormModal'));
const ArticleInfoModal = lazy(() => import('./ArticleInfoModal'));
const SupplierManagement = lazy(() => import('./SupplierManagement'));
```

### Memoization
- Memoize table row components
- Memoize computed values (VAT calculations)
- Use React.memo for pure components

---

## 9. Error Handling Strategy

### Error Types

**Network Errors**:
- Display toast notification
- Retry mechanism with exponential backoff
- Offline mode detection

**Validation Errors**:
- Inline field-level errors
- Form-level error summary
- Prevent submission until resolved

**Business Logic Errors**:
- Modal with detailed error message
- Suggested actions for resolution
- Error logging for support

### Error Display Components

```typescript
// Field-level error
<TextInput
  id="description"
  labelText="Description"
  invalid={!!errors.description}
  invalidText={errors.description}
/>

// Form-level error
<InlineNotification
  kind="error"
  title="Validation Error"
  subtitle="Please correct the errors below"
/>

// Global error
<ToastNotification
  kind="error"
  title="Failed to save article"
  subtitle="Please try again or contact support"
  timeout={5000}
/>
```

---

## 10. Testing Strategy

### Unit Tests
- Component rendering
- Form validation logic
- Utility functions
- Custom hooks

### Integration Tests
- Form submission flow
- API integration
- State management
- Navigation

### E2E Tests
- Complete user workflows
- Create article flow
- Edit article flow
- Delete article flow
- Search and filter

---

## 11. Carbon Design System Theme

### Color Palette
```scss
// IBM Carbon White Theme (recommended)
$carbon--theme: $carbon--theme--white;

// Custom overrides for legacy green screen feel (optional)
$ui-01: #f4f4f4;  // Background
$ui-02: #ffffff;  // Card background
$interactive-01: #0f62fe;  // Primary button
$interactive-02: #393939;  // Secondary button
$text-01: #161616;  // Primary text
$text-02: #525252;  // Secondary text
```

### Typography
- IBM Plex Sans for UI
- IBM Plex Mono for article IDs and codes

### Spacing
- Use Carbon's 8px grid system
- Consistent padding and margins

---

## 12. Component File Structure

```
src/
├── components/
│   ├── articles/
│   │   ├── ArticleListPage.tsx
│   │   ├── ArticleDataTable.tsx
│   │   ├── ArticleFormModal.tsx
│   │   ├── ArticleInfoModal.tsx
│   │   ├── DeleteConfirmationModal.tsx
│   │   ├── FamilySelectionModal.tsx
│   │   └── __tests__/
│   ├── common/
│   │   ├── PageHeader.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorBoundary.tsx
│   └── layout/
│       ├── AppShell.tsx
│       └── Navigation.tsx
├── hooks/
│   ├── useArticles.ts
│   ├── useArticleForm.ts
│   ├── useArticleInfo.ts
│   ├── useFamilies.ts
│   └── useVATCodes.ts
├── context/
│   ├── ArticleContext.tsx
│   └── AppContext.tsx
├── services/
│   ├── articleService.ts
│   ├── familyService.ts
│   └── vatService.ts
├── types/
│   ├── article.types.ts
│   ├── family.types.ts
│   └── vat.types.ts
├── utils/
│   ├── validation.ts
│   ├── formatting.ts
│   └── calculations.ts
└── styles/
    ├── global.scss
    └── variables.scss
```

---

## Next Steps

1. Review and approve component architecture
2. Define REST API endpoints (see API-Specification.md)
3. Create TypeScript interfaces (see TypeScript-Interfaces.md)
4. Implement React components
5. Integrate with backend services
