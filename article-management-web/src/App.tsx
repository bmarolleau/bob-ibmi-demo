/**
 * Main App Component
 * Root component with routing and Carbon theme
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Content, Theme } from '@carbon/react';
import { LandingPage } from './pages/LandingPage';
import { ArticleManagement } from './pages/ArticleManagement';
import './styles/App.scss';

const App: React.FC = () => {
  return (
    <Theme theme="g100">
      <Router>
        <Content>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/articles" element={<ArticleManagement />} />
          </Routes>
        </Content>
      </Router>
    </Theme>
  );
};

export default App;

// Made with Bob
