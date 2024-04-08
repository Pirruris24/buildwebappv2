import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated }) {
  
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="/">BUILD</a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link className="nav-link active" to="/maps">Mapas</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/datatransformation">Transformacion De Data</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/builddb">Base De Datos</Link>
              </li>
            </>
          ) : null}
        </ul>
        <div>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      </div>
    </nav>
  );
}

export default Navbar;
