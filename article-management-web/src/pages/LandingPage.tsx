/**
 * LandingPage Component
 * Main menu for the application using Carbon Design System
 * Provides navigation to different application modules
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tile,
  ClickableTile,
  Grid,
  Column,
  Heading,
  Section,
} from '@carbon/react';
import {
  DocumentBlank,
  Report,
  Settings,
  ArrowRight,
} from '@carbon/icons-react';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  program: string;
  path?: string;
  disabled?: boolean;
}

interface MenuGroup {
  title: string;
  icon: React.ComponentType<any>;
  items: MenuItem[];
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const menuGroups: MenuGroup[] = [
    {
      title: 'Master Files',
      icon: DocumentBlank,
      items: [
        {
          id: '1',
          title: 'Work with Articles',
          description: 'Manage article catalog, prices, and inventory',
          program: 'ART200',
          path: '/articles',
        },
        {
          id: '2',
          title: 'Work with Customers',
          description: 'Manage customer information and contacts',
          program: 'CUS200',
          disabled: true,
        },
        {
          id: '3',
          title: 'Work with Customer Orders',
          description: 'Process and track customer orders',
          program: 'ORD201',
          disabled: true,
        },
        {
          id: '4',
          title: 'Work with Providers',
          description: 'Manage supplier information and relationships',
          program: 'PRO200',
          disabled: true,
        },
      ],
    },
    {
      title: 'Reports',
      icon: Report,
      items: [
        {
          id: '10',
          title: 'Article to Purchase',
          description: 'View articles that need to be ordered',
          program: 'PRO203',
          disabled: true,
        },
        {
          id: '11',
          title: 'Customer with Open Orders',
          description: 'List customers with pending orders',
          program: 'CUSQRY',
          disabled: true,
        },
        {
          id: '12',
          title: 'Article by Last Order Date',
          description: 'Articles sorted by most recent order',
          program: 'ARTQRY',
          disabled: true,
        },
      ],
    },
    {
      title: 'Utilities',
      icon: Settings,
      items: [
        {
          id: '20',
          title: 'Work with Parameters',
          description: 'Configure application settings',
          program: 'PAR200',
          disabled: true,
        },
        {
          id: '21',
          title: 'Work with Countries',
          description: 'Manage country codes and information',
          program: 'COU200',
          disabled: true,
        },
      ],
    },
  ];

  const handleMenuSelect = (item: MenuItem) => {
    if (item.path && !item.disabled) {
      navigate(item.path);
    }
  };

  return (
    <div className="landing-page-carbon">
      <Section level={1}>
        <Heading className="landing-title">Arcad Sample Application</Heading>
        <p className="landing-description">
          Select a module to begin working with the application
        </p>
      </Section>

      <Grid className="landing-grid">
        {menuGroups.map((group) => (
          <Column key={group.title} lg={16} md={8} sm={4} className="menu-section">
            <Section level={2}>
              <div className="menu-section-header">
                <group.icon size={24} />
                <Heading className="menu-section-title">{group.title}</Heading>
              </div>
              <Grid narrow>
                {group.items.map((item) => (
                  <Column key={item.id} lg={8} md={4} sm={4}>
                    {item.disabled ? (
                      <Tile className="menu-tile disabled">
                        <div className="menu-tile-content">
                          <div className="menu-tile-header">
                            <h4>{item.title}</h4>
                            <span className="menu-tile-program">{item.program}</span>
                          </div>
                          <p className="menu-tile-description">{item.description}</p>
                          <span className="menu-tile-status">Coming soon</span>
                        </div>
                      </Tile>
                    ) : (
                      <ClickableTile
                        className="menu-tile"
                        onClick={() => handleMenuSelect(item)}
                      >
                        <div className="menu-tile-content">
                          <div className="menu-tile-header">
                            <h4>{item.title}</h4>
                            <span className="menu-tile-program">{item.program}</span>
                          </div>
                          <p className="menu-tile-description">{item.description}</p>
                          <div className="menu-tile-action">
                            <span>Open</span>
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </ClickableTile>
                    )}
                  </Column>
                ))}
              </Grid>
            </Section>
          </Column>
        ))}
      </Grid>
    </div>
  );
};

// Made with Bob