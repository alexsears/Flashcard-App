import React from 'react';
import ManagerIcon from './ManagerIcon';

const Layout = ({ children }) => {
  return (
    <div>
      <nav>
        <ManagerIcon />
      </nav>
      {children}
    </div>
  );
};

export default Layout;