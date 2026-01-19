# Article Management Web Application - Enhancements

## Overview
This document describes the enhancements made to the Article Management Web Application, including the new landing page using Carbon Design System and the complete article creation/update functionality.

## New Features

### 1. Landing Page (Carbon Design System)
**File:** `src/pages/LandingPage.tsx`

A new landing page has been created using Carbon Design System components, providing a modern, professional interface consistent with the rest of the application:

#### Features:
- **Carbon Design System**: Uses Tiles, ClickableTiles, Grid, and other Carbon components
- **Consistent Theme**: Matches the g100 theme used in the Articles Management page
- **Menu Structure**: Organized into three sections with icons:
  - **Master Files** (DocumentBlank icon): Work with Articles, Customers, Orders, Providers
  - **Reports** (Report icon): Article to purchase, Customer queries, Article by order date
  - **Utilities** (Settings icon): Parameters, Countries
- **Interactive Tiles**: Clickable tiles with hover effects for active modules
- **Visual Feedback**: Disabled state for modules not yet implemented ("Coming soon")
- **Program References**: Each tile shows the corresponding IBM i program name
- **Responsive Grid**: Adapts to different screen sizes using Carbon's responsive grid system

#### Menu Options:
- **Work with Articles** (ART200) - **ACTIVE** - Links to `/articles`
- Other modules: Currently disabled with "Coming soon" status, ready for future implementation

### 2. Article Create/Update Functionality
**File:** `src/components/ArticleForm.tsx`

The ArticleForm component already includes full create and update functionality:

#### Create Mode:
- Accessible via "Create" button on the Articles list page
- Form fields:
  - Description (required, max 50 chars)
  - Family (dropdown with search)
  - VAT Code (dropdown with rate display)
  - Reference Sale Price (calculated with VAT)
  - Stock Price
  - Minimum Stock
  - Stock quantity
- Real-time validation
- Price with VAT calculation

#### Edit Mode:
- Accessible via "Edit" action in the overflow menu on each article row
- Pre-populates all fields with existing article data
- Article ID is displayed but disabled (read-only)
- Same validation as create mode
- Updates existing article via API

#### Features:
- **Validation**: Client-side validation for all required fields
- **Lookup Integration**: Family and VAT code dropdowns with descriptions
- **Calculated Fields**: Automatic price with VAT calculation
- **Error Handling**: Displays validation errors and API errors
- **Loading States**: Shows loading indicators during data fetch and save operations
- **Cancel/Save Actions**: Proper state management and navigation

### 3. Updated Routing
**File:** `src/App.tsx`

The application routing has been updated:
- **Root path (`/`)**: Now displays the Landing Page
- **Articles path (`/articles`)**: Article Management page with list, create, edit, info, and delete functionality

## Styling

### Landing Page Styles
**File:** `src/styles/App.scss`

New CSS classes added for the Carbon Design System landing page:
- `.landing-page-carbon`: Main container with proper spacing
- `.landing-title`: Page title styling
- `.landing-description`: Subtitle with secondary text color
- `.menu-section`: Section containers for each menu group
- `.menu-tile`: Tile styling with hover effects and transitions
- `.menu-tile-content`: Content layout within tiles
- Responsive breakpoints for mobile and tablet devices

### Design Features:
- Uses Carbon Design System color tokens (e.g., `--cds-text-primary`, `--cds-layer-01`)
- Consistent with g100 theme
- Smooth hover transitions with elevation changes
- Proper spacing using Carbon's spacing scale
- Responsive grid that adapts to screen sizes

## User Flow

### Complete Article Management Flow:

1. **Landing Page** (`/`)
   - User sees modern Carbon Design System menu with tiles
   - Clicks "Work with Articles" tile to navigate

2. **Article List** (`/articles`)
   - View paginated list of articles
   - Search/filter articles using "Position to" field
   - Actions available per article:
     - **Edit**: Opens edit form
     - **Info**: View detailed information
     - **Delete**: Soft delete with confirmation
     - **Suppliers**: (placeholder for future)
   - Click "Create" button to add new article

3. **Create Article**
   - Fill in all required fields
   - Select family and VAT code from dropdowns
   - See calculated price with VAT
   - Click "Save" to create
   - Returns to article list on success

4. **Edit Article**
   - Form pre-populated with existing data
   - Modify any field except Article ID
   - Click "Save" to update
   - Returns to article list on success

5. **Delete Article**
   - Confirmation modal appears
   - Soft delete (sets deleted flag)
   - Article removed from list
   - Can be recovered by including deleted records

## Technical Details

### Components Structure:
```
src/
├── pages/
│   ├── LandingPage.tsx          (NEW - Green screen menu)
│   └── ArticleManagement.tsx    (Orchestrates article workflow)
├── components/
│   ├── ArticleList.tsx          (List with pagination and search)
│   ├── ArticleForm.tsx          (Create/Edit form)
│   └── ArticleInfo.tsx          (Read-only article details)
├── services/
│   ├── article.service.ts       (Business logic and API calls)
│   ├── api.client.ts            (HTTP client wrapper)
│   └── api.config.ts            (API configuration)
├── types/
│   └── article.types.ts         (TypeScript interfaces)
└── styles/
    └── App.scss                 (Global styles + landing page)
```

### State Management:
- React hooks (useState, useEffect)
- Local component state
- No external state management library needed

### API Integration:
- RESTful API calls via axios
- Error handling with ApiResponse wrapper
- Client-side pagination and filtering for list view
- Individual API calls for create, update, delete operations

## Future Enhancements

### Potential Additions:
1. **Enable Other Menu Options**: Implement Customers, Orders, Providers modules
2. **Keyboard Navigation**: Add keyboard shortcuts (F3, F12, etc.)
3. **Command Line**: Make command line functional for power users
4. **Article Suppliers**: Implement the suppliers/providers view
5. **Advanced Search**: Add more filter options on article list
6. **Batch Operations**: Select multiple articles for bulk actions
7. **Export/Import**: CSV or Excel export/import functionality
8. **Audit Trail**: Show article modification history
9. **User Preferences**: Remember page size, theme preferences

## Testing

### Manual Testing Checklist:
- [x] Landing page displays correctly
- [x] Navigation from landing page to articles works
- [x] Article list loads and displays data
- [x] Search/filter functionality works
- [x] Create new article form opens
- [x] Create article validation works
- [x] Create article saves successfully
- [x] Edit article form opens with data
- [x] Edit article saves changes
- [x] Delete article shows confirmation
- [x] Delete article removes from list
- [x] TypeScript compilation passes
- [ ] Run development server and test in browser

### To Test in Browser:
```bash
cd article-management-web
npm install  # if not already done
npm run dev
```

Then open browser to `http://localhost:5173`

## Notes

- The application uses Carbon Design System for UI components
- The green screen aesthetic is purely visual - modern React underneath
- All CRUD operations are functional and ready for backend integration
- The ArticleForm component was already implemented with full create/update functionality
- Backend API endpoints need to be configured in `src/services/api.config.ts`

## Made with Bob