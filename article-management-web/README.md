# Article Management Web Application

Modern web interface for the IBM i Article Management System, built with React, TypeScript, and IBM Carbon Design System.

## 🚀 Features

- **Article List View**: Paginated table with search and filtering
- **Create/Edit Articles**: Full CRUD operations with validation
- **Article Information**: Extended text notes for articles
- **Family & VAT Lookups**: Dropdown selections with search
- **Real-time VAT Calculation**: Automatic price calculation with VAT
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: IBM Carbon Design System components

## 📋 Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Backend API**: REST API endpoints must be available (see API Requirements below)

## 🛠️ Installation

### 1. Clone or Navigate to the Project

```bash
cd article-management-web
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18
- TypeScript
- IBM Carbon Design System
- Axios for API calls
- React Router for navigation
- Vite for build tooling

### 3. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:

```env
VITE_API_BASE_URL=http://your-ibm-i-server:8080/api
```

## 🚀 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### Production Build

Build the application for production:

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 📁 Project Structure

```
article-management-web/
├── src/
│   ├── components/          # React components
│   │   ├── ArticleList.tsx      # Article list with pagination
│   │   ├── ArticleForm.tsx      # Create/Edit form
│   │   └── ArticleInfo.tsx      # Extended information view
│   ├── pages/               # Page components
│   │   └── ArticleManagement.tsx # Main page orchestrator
│   ├── services/            # API services
│   │   ├── api.config.ts        # API configuration
│   │   ├── api.client.ts        # Axios client with interceptors
│   │   └── article.service.ts   # Article business logic
│   ├── types/               # TypeScript definitions
│   │   └── article.types.ts     # Article-related types
│   ├── styles/              # SCSS styles
│   │   └── App.scss             # Main styles with Carbon imports
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite environment types
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

## 🔌 API Requirements

The application expects the following REST API endpoints to be available:

### Article Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | List articles (paginated) |
| GET | `/api/articles/:id` | Get article details |
| POST | `/api/articles` | Create new article |
| PUT | `/api/articles/:id` | Update article |
| DELETE | `/api/articles/:id` | Soft delete article |
| GET | `/api/articles/:id/info` | Get extended information |
| PUT | `/api/articles/:id/info` | Update extended information |
| GET | `/api/articles/:id/providers` | Get article suppliers |

### Lookup Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lookups/families` | Get family list |
| GET | `/api/lookups/vat` | Get VAT definitions |

### Query Parameters

**GET /api/articles**:
- `page`: Page number (default: 1)
- `pageSize`: Records per page (default: 14)
- `positionTo`: Position to article ID
- `includeDeleted`: Include soft-deleted records (default: false)

**GET /api/lookups/families**:
- `searchTerm`: Search filter
- `limit`: Maximum results (default: 50)

## 🎨 Customization

### Theme

The application uses Carbon's `g100` (dark) theme by default. To change the theme, edit `src/App.tsx`:

```tsx
<Theme theme="white">  // Options: white, g10, g90, g100
```

### API Base URL

Configure the API base URL in `.env`:

```env
VITE_API_BASE_URL=http://your-server:port/api
```

### Styling

Custom styles can be added to `src/styles/App.scss`. The file already imports Carbon Design System styles.

## 🧪 Development

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

### Hot Reload

The development server supports hot module replacement (HMR). Changes to components will be reflected immediately without losing application state.

## 📦 Building for Production

### Build Command

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified JavaScript and CSS
- Tree-shaking to remove unused code
- Code splitting for optimal loading
- Asset optimization

### Deployment

The `dist/` directory can be deployed to any static web server:

**Apache/Nginx**:
```bash
cp -r dist/* /var/www/html/
```

**IBM HTTP Server**:
```bash
cp -r dist/* /www/htdocs/
```

**Node.js Server**:
```bash
npm install -g serve
serve -s dist -p 3000
```

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 is already in use, Vite will automatically try the next available port. You can also specify a different port in `vite.config.ts`:

```ts
server: {
  port: 3001,
}
```

### API Connection Issues

1. Check that the backend API is running
2. Verify the `VITE_API_BASE_URL` in `.env`
3. Check browser console for CORS errors
4. Ensure the API server allows CORS from your frontend origin

### TypeScript Errors

If you see TypeScript errors after installation:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Technology Stack

- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **IBM Carbon Design System**: Enterprise UI components
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing
- **SCSS**: Styling with Carbon themes

## 🤝 Integration with IBM i

This frontend application is designed to work with RPG Service Programs exposed as REST APIs. See the modernization plan documentation for:

- RPG Service Program specifications
- REST API implementation guide
- Database schema requirements
- Backend integration examples

## 📄 License

This project is part of the IBM i Article Management System modernization.

## 🆘 Support

For issues or questions:
1. Check the modernization plan documentation
2. Review the API endpoint specifications
3. Verify backend service programs are compiled and running
4. Check browser console for detailed error messages

## 🎯 Next Steps

1. **Install dependencies**: `npm install`
2. **Configure environment**: Copy and edit `.env`
3. **Start development server**: `npm run dev`
4. **Implement backend APIs**: Follow the modernization plan
5. **Test the application**: Verify all CRUD operations work
6. **Build for production**: `npm run build`
7. **Deploy**: Copy `dist/` to your web server

---

**Happy Coding! 🚀**