/**
 * ArticleInfo Component
 * Extended text information for articles
 * Corresponds to ART200D Screen 3 (Article Information)
 */

import React, { useState, useEffect } from 'react';
import {
  Form,
  Stack,
  TextArea,
  Button,
  ButtonSet,
  InlineNotification,
  InlineLoading,
} from '@carbon/react';
import { articleService } from '../services/article.service';
import { Article } from '../types/article.types';

interface ArticleInfoProps {
  article: Article;
  onSave: () => void;
  onCancel: () => void;
}

export const ArticleInfo: React.FC<ArticleInfoProps> = ({
  article,
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticleInfo();
  }, [article.id]);

  const loadArticleInfo = async () => {
    setLoading(true);
    const response = await articleService.getArticleInfo(article.id);

    if (response.success && response.data) {
      setText(response.data.text || '');
    } else if (response.error?.code !== 'NOT_FOUND') {
      setError(response.error?.message || 'Failed to load article information');
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError(null);

    const response = await articleService.updateArticleInfo(article.id, { text });

    if (response.success) {
      onSave();
    } else {
      setError(response.error?.message || 'Failed to save article information');
    }

    setSaving(false);
  };

  if (loading) {
    return <InlineLoading description="Loading article information..." />;
  }

  return (
    <div className="article-info">
      <h3>Article Information</h3>
      <div className="article-header">
        <strong>{article.id}</strong> - {article.description}
      </div>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <Stack gap={6}>
          <TextArea
            id="article-text"
            labelText="Extended Information"
            placeholder="Enter additional notes and details about this article..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={15}
            maxLength={1520}
            helperText={`${text.length} / 1520 characters`}
          />

          <ButtonSet>
            <Button kind="secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </ButtonSet>
        </Stack>
      </Form>
    </div>
  );
};

// Made with Bob
