/**
 * ArticleForm Component
 * Form for creating and editing articles
 * Corresponds to ART200D Screen 2 (Article Definition)
 */

import React, { useState, useEffect } from 'react';
import {
  Form,
  Stack,
  TextInput,
  NumberInput,
  Button,
  ButtonSet,
  InlineNotification,
  InlineLoading,
  ComboBox,
  FormLabel,
} from '@carbon/react';
import { articleService } from '../services/article.service';
import {
  Article,
  ArticleCreateRequest,
  ArticleUpdateRequest,
  Family,
  VATDefinition,
} from '../types/article.types';

interface ArticleFormProps {
  articleId?: string;
  mode: 'create' | 'edit';
  onSave: () => void;
  onCancel: () => void;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({
  articleId,
  mode,
  onSave,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<Article>>({
    description: '',
    familyCode: '',
    vatCode: '',
    salePrice: 0,
    warehousePrice: 0,
    stock: 0,
    minimumQuantity: 0,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Lookup data
  const [families, setFamilies] = useState<Family[]>([]);
  const [vatDefinitions, setVATDefinitions] = useState<VATDefinition[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedVAT, setSelectedVAT] = useState<VATDefinition | null>(null);

  // Calculated fields
  const [priceWithVAT, setPriceWithVAT] = useState(0);

  // Load article data for edit mode
  useEffect(() => {
    if (mode === 'edit' && articleId) {
      loadArticle();
    }
  }, [articleId, mode]);

  // Load lookup data
  useEffect(() => {
    loadFamilies();
    loadVATDefinitions();
  }, []);

  // Calculate price with VAT
  useEffect(() => {
    if (formData.salePrice && selectedVAT) {
      const calculated = articleService.calculatePriceWithVAT(
        formData.salePrice,
        selectedVAT.rate
      );
      setPriceWithVAT(calculated);
    }
  }, [formData.salePrice, selectedVAT]);

  const loadArticle = async () => {
    if (!articleId) return;

    setLoading(true);
    const response = await articleService.getArticle(articleId);

    if (response.success && response.data) {
      const article = response.data.article;
      setFormData(article);

      // Set selected family and VAT
      const family = families.find((f) => f.code === article.familyCode);
      if (family) setSelectedFamily(family);

      const vat = vatDefinitions.find((v) => v.code === article.vatCode);
      if (vat) setSelectedVAT(vat);
    } else {
      setError(response.error?.message || 'Failed to load article');
    }

    setLoading(false);
  };

  const loadFamilies = async () => {
    const response = await articleService.searchFamilies();
    if (response.success && response.data) {
      setFamilies(response.data.families);
    }
  };

  const loadVATDefinitions = async () => {
    const response = await articleService.getVATDefinitions();
    if (response.success && response.data) {
      setVATDefinitions(response.data.vatDefinitions);
    }
  };

  const handleInputChange = (field: keyof Article, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const handleFamilyChange = (item: { selectedItem: Family | null | undefined }) => {
    if (item.selectedItem) {
      setSelectedFamily(item.selectedItem);
      handleInputChange('familyCode', item.selectedItem.code);
    }
  };

  const handleVATChange = (item: { selectedItem: VATDefinition | null | undefined }) => {
    if (item.selectedItem) {
      setSelectedVAT(item.selectedItem);
      handleInputChange('vatCode', item.selectedItem.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validation = articleService.validateArticle(formData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setSaving(true);
    setError(null);

    let response;
    if (mode === 'create') {
      response = await articleService.createArticle(formData as ArticleCreateRequest);
    } else {
      response = await articleService.updateArticle(
        articleId!,
        formData as ArticleUpdateRequest
      );
    }

    if (response.success) {
      onSave();
    } else {
      setError(response.error?.message || 'Failed to save article');
    }

    setSaving(false);
  };

  if (loading) {
    return <InlineLoading description="Loading article..." />;
  }

  return (
    <div className="article-form">
      <h3>{mode === 'create' ? 'Create Article' : 'Edit Article'}</h3>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      {validationErrors.length > 0 && (
        <InlineNotification
          kind="error"
          title="Validation Errors"
          subtitle={validationErrors.join(', ')}
          onCloseButtonClick={() => setValidationErrors([])}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <Stack gap={6}>
          {mode === 'edit' && (
            <TextInput
              id="article-id"
              labelText="Article ID"
              value={formData.id || ''}
              disabled
            />
          )}

          <TextInput
            id="description"
            labelText="Description *"
            placeholder="Enter article description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            maxLength={50}
            required
          />

          <ComboBox
            id="family"
            titleText="Family *"
            placeholder="Select family"
            items={families}
            itemToString={(item) => (item ? `${item.code} - ${item.description}` : '')}
            selectedItem={selectedFamily}
            onChange={handleFamilyChange}
            required
          />

          <ComboBox
            id="vat"
            titleText="VAT Code *"
            placeholder="Select VAT code"
            items={vatDefinitions}
            itemToString={(item) =>
              item ? `${item.code} - ${item.description} (${item.rate}%)` : ''
            }
            selectedItem={selectedVAT}
            onChange={handleVATChange}
            required
          />

          <NumberInput
            id="sale-price"
            label="Reference Sale Price *"
            value={formData.salePrice || 0}
            onChange={(_e, { value }) => handleInputChange('salePrice', value)}
            min={0}
            step={0.01}
            required
          />

          {selectedVAT && (
            <div>
              <FormLabel>Price with VAT</FormLabel>
              <div style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>
                {priceWithVAT.toFixed(2)}
              </div>
            </div>
          )}

          <NumberInput
            id="warehouse-price"
            label="Stock Price *"
            value={formData.warehousePrice || 0}
            onChange={(_e, { value }) => handleInputChange('warehousePrice', value)}
            min={0}
            step={0.01}
            required
          />

          <NumberInput
            id="minimum-quantity"
            label="Minimum Stock *"
            value={formData.minimumQuantity || 0}
            onChange={(_e, { value }) => handleInputChange('minimumQuantity', value)}
            min={0}
            step={1}
            required
          />

          <NumberInput
            id="stock"
            label="Stock *"
            value={formData.stock || 0}
            onChange={(_e, { value }) => handleInputChange('stock', value)}
            min={0}
            step={1}
            required
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
