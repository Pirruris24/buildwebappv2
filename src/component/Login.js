import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, } from 'react-router-dom';

function Login({setIsAuthenticated}) {


    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setValues({ ...values, [name]: value });
    };

    //const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post(`http://localhost:8000/login/${values.email} ${values.password}`);
            
            setIsAuthenticated(true); 
            navigate('/maps');
            

        } catch (error) {
            console.error('Error logging in:', error);
            setError('An error occurred while logging in');
        }
    };




    return (
        <div className="index-page">
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
                <div className="content-center register">
                    <h1 className="h1-seo">Iniciar Sesión</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={values.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                class="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={values.password}
                                onChange={handleInputChange}
                                placeholder="Contraseña"
                                class="form-control"
                                required
                            />
                        </div>
                        {error && <div className="text-danger">{error}</div>}
                        <button type="submit" class="btn-round btn btn-primary btn-lg">Iniciar Sesión</button>
                        <p>Estás aceptando los Términos y condiciones</p>
                        <Link to="/registeruser" class="btn btn-info">Crear Cuenta</Link>
                        <p />
                        <Link to="/" class="btn-neutral btn btn-default">Home</Link>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
