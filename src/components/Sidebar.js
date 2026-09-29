import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ navItems, title }) => {
  return (
    <aside className="ps-sidebar">
      {title && (
        <div className="sidebar-section-label mb-2">{title}</div>
      )}
      <nav>
        {navItems.map((section, si) => (
          <div key={si} className="mb-1">
            {section.label && (
              <div className="sidebar-section-label mt-3">{section.label}</div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
