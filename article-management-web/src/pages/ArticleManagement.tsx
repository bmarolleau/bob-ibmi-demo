/**
 * ArticleManagement Page
 * Main page component that orchestrates the article management workflow
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button } from '@carbon/react';
import { Home } from '@carbon/icons-react';
import { ArticleList } from '../components/ArticleList';
import { ArticleForm } from '../components/ArticleForm';
import { ArticleInfo } from '../components/ArticleInfo';
import { Article, ArticleAction } from '../types/article.types';
import { articleService } from '../services/article.service';

type ViewMode = 'list' | 'create' | 'edit' | 'info' | 'delete';

export const ArticleManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAction = async (articleId: string, action: ArticleAction) => {
    setSelectedArticleId(articleId);

    // Load article details for edit/info/delete
    const response = await articleService.getArticle(articleId);
    if (response.success && response.data) {
      setSelectedArticle(response.data.article);

      switch (action) {
        case 'edit':
          setViewMode('edit');
          break;
        case 'info':
          setViewMode('info');
          break;
        case 'delete':
          setShowDeleteModal(true);
          break;
        case 'suppliers':
          // TODO: Implement suppliers view
          alert('Suppliers view not yet implemented');
          break;
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedArticleId(null);
    setSelectedArticle(null);
    setViewMode('create');
  };

  const handleSave = () => {
    setViewMode('list');
    setSelectedArticleId(null);
    setSelectedArticle(null);
    setRefreshKey((prev) => prev + 1); // Trigger list refresh
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedArticleId(null);
    setSelectedArticle(null);
  };

  const handleDelete = async () => {
    if (!selectedArticleId) return;

    const response = await articleService.deleteArticle(selectedArticleId);
    if (response.success) {
      setShowDeleteModal(false);
      setSelectedArticleId(null);
      setSelectedArticle(null);
      setRefreshKey((prev) => prev + 1); // Trigger list refresh
    } else {
      alert(response.error?.message || 'Failed to delete article');
    }
  };

  return (
    <div className="article-management">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button kind="ghost" renderIcon={Home}>
            Back to Home
          </Button>
        </Link>
      </div>
      {viewMode === 'list' && (
        <ArticleList
          key={refreshKey}
          onAction={handleAction}
          onCreateNew={handleCreateNew}
        />
      )}

      {viewMode === 'create' && (
        <ArticleForm
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {viewMode === 'edit' && selectedArticleId && (
        <ArticleForm
          articleId={selectedArticleId}
          mode="edit"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {viewMode === 'info' && selectedArticle && (
        <ArticleInfo
          article={selectedArticle}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        danger
        modalHeading="Delete Article"
        modalLabel="Confirmation"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setShowDeleteModal(false)}
        onRequestSubmit={handleDelete}
      >
        <p>
          Are you sure you want to delete article{' '}
          <strong>{selectedArticle?.id}</strong> -{' '}
          {selectedArticle?.description}?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Made with Bob
