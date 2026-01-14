/**
 * ArticleList Component
 * Displays paginated list of articles with search and actions
 * Corresponds to ART200D Screen 1 (Subfile)
 */

import React, { useState, useEffect } from 'react';
import {
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
  Button,
  Pagination,
  InlineLoading,
  InlineNotification,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { articleService } from '../services/article.service';
import {
  Article,
  ArticleAction,
  DEFAULT_PAGE_SIZE,
} from '../types/article.types';

interface ArticleListProps {
  onAction: (articleId: string, action: ArticleAction) => void;
  onCreateNew: () => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({ onAction, onCreateNew }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Table headers
  const headers = [
    { key: 'id', header: 'Id' },
    { key: 'description', header: 'Description' },
    { key: 'familyCode', header: 'Fam' },
    { key: 'deleted', header: 'Del' },
    { key: 'actions', header: 'Actions' },
  ];

  // Load articles
  const loadArticles = async () => {
    setLoading(true);
    setError(null);

    const response = await articleService.getArticles({
      page: currentPage,
      pageSize,
      positionTo: searchTerm || undefined,
      includeDeleted: false,
    });

    if (response.success && response.data) {
      setArticles(response.data.articles);
      setTotalItems(response.data.pagination.totalRecords);
    } else {
      setError(response.error?.message || 'Failed to load articles');
    }

    setLoading(false);
  };

  // Load on mount and when page/search changes
  useEffect(() => {
    loadArticles();
  }, [currentPage, pageSize]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(1);
        loadArticles();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = ({ page, pageSize: newPageSize }: { page: number; pageSize: number }) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  // Format rows for DataTable
  const rows = articles.map((article) => ({
    id: article.id,
    description: article.description,
    familyCode: article.familyCode,
    deleted: article.deleted ? 'Y' : '',
    article, // Store full article for actions
  }));

  return (
    <div className="article-list">
      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <DataTable rows={rows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            title="Work with Articles"
            description="Type options, press Enter"
            {...getTableContainerProps()}
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Position to..."
                  onChange={(_event, value) => setSearchTerm(value || '')}
                  value={searchTerm}
                />
                <Button
                  kind="primary"
                  renderIcon={Add}
                  onClick={onCreateNew}
                >
                  Create
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={headers.length}>
                      <InlineLoading description="Loading articles..." />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length}>
                      No articles found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'actions') {
                          return (
                            <TableCell key={cell.id}>
                              <OverflowMenu flipped>
                                <OverflowMenuItem
                                  itemText="Edit"
                                  onClick={() => onAction(row.id, 'edit')}
                                />
                                <OverflowMenuItem
                                  itemText="Info"
                                  onClick={() => onAction(row.id, 'info')}
                                />
                                <OverflowMenuItem
                                  itemText="Delete"
                                  onClick={() => onAction(row.id, 'delete')}
                                  hasDivider
                                  isDelete
                                />
                                <OverflowMenuItem
                                  itemText="Suppliers"
                                  onClick={() => onAction(row.id, 'suppliers')}
                                />
                              </OverflowMenu>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <Pagination
              backwardText="Previous page"
              forwardText="Next page"
              itemsPerPageText="Items per page:"
              page={currentPage}
              pageSize={pageSize}
              pageSizes={[10, 14, 20, 50]}
              totalItems={totalItems}
              onChange={handlePageChange}
            />
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

// Made with Bob
