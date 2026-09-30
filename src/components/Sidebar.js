import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ navItems }) => {
  return (
    <aside className="ps-sidebar">
      {navItems.map((section, si) => (
        <div key={si} className="ps-sidebar-section">
          {section.label && (
            <div className="ps-sidebar-label">{section.label}</div>
          )}
          {section.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `ps-sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
