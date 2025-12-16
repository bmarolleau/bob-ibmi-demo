/**
 * Main App Component
 * Root component with routing and Carbon theme
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Content, Theme } from '@carbon/react';
import { ArticleManagement } from './pages/ArticleManagement';
import './styles/App.scss';

const App: React.FC = () => {
  return (
    <Theme theme="g100">
      <Router>
        <Content>
          <Routes>
            <Route path="/" element={<Navigate to="/articles" replace />} />
            <Route path="/articles" element={<ArticleManagement />} />
          </Routes>
        </Content>
      </Router>
    </Theme>
  );
};

export default App;

// Made with Bob
