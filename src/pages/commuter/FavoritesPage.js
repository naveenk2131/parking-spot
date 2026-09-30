import React from 'react';
import EmptyState from '../../components/EmptyState';

const FavoritesPage = () => (
  <div className="animate-fade-in">
    <div className="ps-page-header"><h1>Favorites</h1><p>Quickly access your saved parking locations.</p></div>
    <div className="ps-card"><div className="ps-card-body">
      <EmptyState icon="⭐" title="No favorites yet" description="Star parking locations to save them here for quick access." />
    </div></div>
  </div>
);

export default FavoritesPage;
