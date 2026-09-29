import React from 'react';

const EmptyState = ({ icon = '📭', title, description, action }) => {
  return (
    <div className="ps-empty-state">
      <div className="ps-empty-icon">{icon}</div>
      {title && <h5>{title}</h5>}
      {description && <p>{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
};

export default EmptyState;
