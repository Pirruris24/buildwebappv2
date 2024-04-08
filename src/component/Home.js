import React from 'react';
import { useNavigate } from 'react-router-dom';
import  './../assets/css/blk-design-system-react.css';

function Home() {
    const navigate = useNavigate();

    const handleClickLogIn = () => {
        navigate('/login');
    };

    const handleClickRegisterUser = () => {
        navigate('/registeruser');
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
                <div className='container'>
                    <div className="content-center brand">
                        <h1 className="h1-seo">BUILD</h1>
                        {/*<h3 className="d-none d-sm-block">Sistema para ayudar al turista a hospedarse de una manera más cómoda y segura</h3>*/}
                        <p>Estimados Visitantes,</p>

                        <p>En nuestro sitio web, garantizar su seguridad y bienestar es nuestra principal prioridad. 
                        Para ayudarle a tomar decisiones informadas al seleccionar alojamientos, 
                        utilizamos un conjunto integral de criterios para identificar las áreas más seguras. 
                        Nuestros criterios incluyen los siguientes factores:</p>
                        <h4 style={{ color: 'white' }}>Criterios de Seguridad:</h4>
                                <ol>
                                    <li>Índice de Crimen: Calculamos un índice de crimen basado en varios puntos de datos de delitos en la zona, brindándole información sobre el nivel de seguridad de cada ubicación.</li>
                                    <li>Comisarías de Policía: Consideramos la proximidad de las comisarías de policía al hotel, asegurando un acceso rápido a los servicios policiales si es necesario.</li>
                                    <li>Hospitales Cercanos: El acceso a instalaciones de atención médica es crucial. Evaluamos la distancia a hospitales cercanos, asegurando que la asistencia médica esté disponible rápidamente.</li>
                                    <li>Farmacias: Además, evaluamos la disponibilidad de farmacias en las cercanías, asegurando el acceso a medicamentos esenciales y productos de atención médica.</li>
                                </ol>
                        <p>Al incorporar estos criterios en nuestro proceso de evaluación, nos esforzamos por ofrecerle 
                        tranquilidad y una estancia segura durante su visita. Su seguridad es importante para nosotros, 
                        y estamos comprometidos a brindarle una mejor opcion de hospedamiento para su seguridad.</p>
                        <button className='btn btn-success' onClick={handleClickLogIn}>Iniciar Sesión</button>
                        <button className='btn-neutral btn btn-default' onClick={handleClickRegisterUser}>Registrar Usuario</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
