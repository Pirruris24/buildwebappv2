import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterUser from './component/RegisterUser';
import Login from './component/Login';
import AnotherComponent from './component/AnotherComponent';
import Home from './component/Home';
import AdminBuildDB from './component/AdminBuildDB';
import DataTransformation from './component/AdminBuildDataTransformation';
import MyComponent from './component/MyComponent';
import Layout from './component/Layout'; // Import the Layout component
import Navbar from './component/NavBar'; // Import the Navbar component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/registeruser" element={<RegisterUser />} />

        {isAuthenticated ? (
          <>
            <Route path="/maps" element={<Layout><Navbar isAuthenticated={isAuthenticated} /><AnotherComponent /></Layout>} />
            <Route path="/builddb" element={<Layout><Navbar isAuthenticated={isAuthenticated} /><AdminBuildDB /></Layout>} />
            <Route path="/datatransformation" element={<Layout><Navbar isAuthenticated={isAuthenticated} /><DataTransformation /></Layout>} />
            <Route path="/mycomponent" element={<Layout><Navbar isAuthenticated={isAuthenticated} /><MyComponent /></Layout>} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
