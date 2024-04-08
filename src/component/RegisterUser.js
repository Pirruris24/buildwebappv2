import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validation from './RegisterValidation';

const RegisterUser = () => {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState({});

  const handleInput = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(Validation(values));

    if (Object.keys(error).length === 0) {
      fetch(`http://localhost:8000/addBuildUser/${values.name}/${values.email}/${values.password}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res.ok) {
          navigate('/login');
        } else {
          throw new Error('Error adding user');
        }
      }).catch((error) => {
        console.error('Error adding user:', error);
      });
    }
  };

  return (
    <div className='index-page'>
      <div className="wrapper">
        <div className="page-header header-filter">
        <div className="squares square1"></div>
          <div className="squares square2"></div>
          <div className="squares square3"></div>
          <div className="squares square4"></div>
          <div className="squares square5"></div>
          <div className="squares square6"></div>
          <div className="squares square7"></div>
        </div>
      </div>
      <div className="container">
        <div className="content-center register d-flex align-items-center justify-content-center">
          <div className="text-center">
            <h1 className="h1-seo">Regístrate</h1>
            <form onSubmit={handleSubmit}>
              <div className='mb-3'>
                <input
                  type='text'
                  placeholder='Nombre'
                  name='name'
                  value={values.name}
                  onChange={handleInput}
                  className={`form-control ${error.name ? 'is-invalid' : ''}`}
                />
                {error.name && <span className='invalid-feedback'>{error.name}</span>}
              </div>
              <div className='mb-3'>
                <input
                  type='email'
                  placeholder='Email'
                  name='email'
                  value={values.email}
                  onChange={handleInput}
                  className={`form-control ${error.email ? 'is-invalid' : ''}`}
                />
                {error.email && <span className='invalid-feedback'>{error.email}</span>}
              </div>
              <div className='mb-3'>
                <input
                  type='password'
                  placeholder='Contraseña'
                  name='password'
                  value={values.password}
                  onChange={handleInput}
                  className={`form-control ${error.password ? 'is-invalid' : ''}`}
                />
                {error.password && <span className='invalid-feedback'>{error.password}</span>}
              </div>
              <button type='submit' className="btn-round btn btn-primary btn-lg">Register</button>
              <p />
              <Link to='/' className="btn-neutral btn btn-default">Home</Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;



/*

<div align="Center" style={{background:'#F5f5dc'}}>
      <h2 style={{color:'Tomato'}}>Register User</h2>
      {/* Add your registration form or content here} */

/*
    <label>
      User First Name:
      <input type="text" value={userFirstName} onChange={(e) => setUserFirstName(e.target.value)} />
    </label>
    <br />
    <label>
      User Last Name:
      <input type="text" value={userLastName} onChange={(e) => setUserLastName(e.target.value)} />
    </label>
    <br />
    <label>
      Password:
      <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
    </label>
    <br />

    <label>
      Organization:
      <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
    </label>
    <br />
    <button onClick={handleAddUser}>Add User</button>
    <div>
        <h2>Response from FastAPI:</h2>
      
      </div>
   
  </div>

////////////////////////////////////////////////////////////////////
const handleAddUser = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/addBuildUser/${userFirstName} ${userEmail} ${userPassword}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
 
      if (!response.ok) {
        throw new Error('Failed to add user');
      }
      if (response.ok) {
        
        const result = await response.json();
         console.log('User added:', result);
         navigate('/home');
      }
 
      
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };
*/