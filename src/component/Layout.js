import React from 'react';
import Navbar from './NavBar';

const Layout = ({ children, isAuthenticated }) => {
  return (
    <>
    
      {isAuthenticated && <Navbar />}
      {children}
    </>
  );
};

export default Layout;
