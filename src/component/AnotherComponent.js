import React, { useState } from 'react'
import ReactDOM from "react-dom/client";
import crimemap from '../assets/crimemap.png'
import businessmap from '../assets/bussinesmap.png'
import hotelmap from '../assets/hotelmap.png'
//import allbusinessmap from '../assets/allbussinesmap.png'
import allcrimemap from '../assets/allcrimemap.png'
import allhotelmap from '../assets/allhotelmap.png'
import allpolicemap from '../assets/allpolicemap.png'
import allpharmacymap from '../assets/allpharmacymap.png'
import allhospitalsmap from '../assets/allhospitalsmap.png'
import MapContainer from '../component/MyComponent';
import Navbar from './NavBar';

export default function AnotherComponent() {

 
  //FETCH CRIME MAP DATA//
  const [municipioCrime, setDataCrime] = useState([]);
  // const [updated, setUpdated] = useState(municipioCrime);


  const handleChangeCrime = (eventCrime) => {
    setDataCrime(eventCrime.target.value);
  };
  const handleClickCrime = () => {
    // 👇 "municipioCrime" stores input field value
    // setUpdated(municipioCrime);
    fetch(`http://localhost:8000/crimeMap/${municipioCrime}`)
      .then((responseCrime) => responseCrime.json())
      .then((responseDataCrime) => {
        setDataCrime(responseDataCrime);
      })
      .catch((error) => {

      });
  };

  // FETCHA NEGOCIOS DATA//
  const [municipioNegocios, setDataNegocios] = useState([]);
  // const [updated1, setUpdated1] = useState(municipioNegocios);


  const handleChangeNegocios = (eventNegocios) => {
    setDataNegocios(eventNegocios.target.value);
  };
  const handleClickNegocios = () => {
    // 👇 "municipioNegocios" stores input field value
    //setUpdated1(municipioNegocios);
    fetch(`http://localhost:8000/businessMap/${municipioNegocios}`)
      .then((responseNegocios) => responseNegocios.json())
      .then((responseDataNegocios) => {
        setDataNegocios(responseDataNegocios);
      })
      .catch((error) => {

      });

  };



  // FETCHA HOTELS DATA//
  const [municipioHotels, setDataHotels] = useState([]);
  // const [updated1, setUpdated1] = useState(municipioNegocios);


  const handleChangeHotels = (eventHotels) => {
    setDataHotels(eventHotels.target.value);
  };
  const handleClickHotels = () => {
    // 👇 "municipioNegocios" stores input field value
    //setUpdated1(municipioNegocios);
    fetch(`http://localhost:8000/hotelMapByZone/${municipioHotels}`)
      .then((responseHotel) => responseHotel.json())
      .then((responseDataHotel) => {
        setDataNegocios(responseDataHotel);
      })
      .catch((error) => {

      });

  };


  //TRANSPORTATION MAP/CLUSTER


  /*const handleClickTransportationMap = () => {
    // 👇 "message" stores input field value
    fetch(`http://localhost:8000/publicTransportZMG/`)
      .catch((error) => {
        alert(error);
      });
  };*/

  /*const handleClickAllBusiness = () => {
    // 👇 "message" stores input field value
    fetch(`http://localhost:8000/businessMap/`)
      .catch((error) => {
        alert(error);
      });
  };*/


  const handleClickAllCrimes = () => {
    // 👇 "message" stores input field value
    fetch(`http://localhost:8000/crimeMap/`)
      .catch((error) => {
        alert("Error");
      });
  };

  const handleClickAllHotels = () => {
    // 👇 "message" stores input field value
    fetch(`http://localhost:8000/hotelMap/`)
      .catch((error) => {
        alert("Error");
      });
  };


  const handleClickAllPolice = () => {
    // 👇 "message" stores input field value
    fetch(`http://localhost:8000/policeMap/`)
      .catch((error) => {
        alert("Error");
      });
  };


  const handleClickAllPharmacy = () => {
    // 👇 "message" stores input field value
    fetch(`http://localhost:8000/pharmacyMap/`)
      .catch((error) => {
        alert("Error");
      });
  };


  const handleClickAllHospitals = () => {
    // 👇 "message" stores input field value
    fetch(`http://localhost:8000/hospitalMap/`)
      .catch((error) => {
        alert("Error");
      });
  };

  return (
    <div className="index-page" style={{ overflowX: 'hidden' }}>
     
      <h1 className="h1-seo" style={{ margin: '20px' }}>BUILD</h1>
      <p style={{ margin: '20px' }}>
        *Todos los índices y clusters fueron obtenidos en base a{" "}
        <a href="https://www.inegi.org.mx/" target="_blank" rel="noopener noreferrer">
          INEGI
        </a>.
      </p>
      <div className='map-section'>
        <div className='map-components'>
          <label htmlFor='text'>
            <h2 >Hoteles Por Zonas En Jalisco</h2>
            Buscar Actualizacion:{' '}
            <button class="btn btn-success" onClick={handleClickAllHotels}>Actualizar</button>
          </label>
        </div>
        {/* SET IMAGE FOR CRIME BARS MAP*/}
        <img src={allhotelmap} classname="img-map" className='img-map' alt="" />
      </div>
      <div className='map-section'>
        <div className='map-components'>
          <label htmlFor='text'>
            <h2 >Estaciones De Policia En Jalisco</h2>
            Buscar Actualizacion:{' '}
            <button class="btn btn-success" onClick={handleClickAllPolice}>Actualizar</button>
          </label>
        </div>
        {/* SET IMAGE FOR CRIME BARS MAP*/}
        <img src={allpolicemap} classname="img-map" className='img-map' alt="" />
      </div>
      <div className='map-section'>
        <div className='map-components'>
          <label htmlFor='text'>
            <h2 >Farmacias Por Zonas En Jalisco</h2>
            Buscar Actualizacion:{' '}
            <button class="btn btn-success" onClick={handleClickAllPharmacy}>Actualizar</button>
          </label>
        </div>
        {/* SET IMAGE FOR CRIME BARS MAP*/}
        <img src={allpharmacymap} classname="img-map" className='img-map' alt="" />
      </div>
      <div className='map-section'>
        <div className='map-components'>
          <label htmlFor='text'>
            <h2 >Hospitales Por Zonas En Jalisco</h2>
            Buscar Actualizacion:{' '}
            <button class="btn btn-success" onClick={handleClickAllHospitals}>Actualizar</button>
          </label>
        </div>
        {/* SET IMAGE FOR CRIME BARS MAP*/}
        <img src={allhospitalsmap} classname="img-map" className='img-map' alt="" />
      </div>

      

      <div className='map-section'>
        <div className='map-components'>
          <label htmlFor='text'>
            <h2 >Tasa De Criminalidad En Jalisco</h2>
            Buscar Actualizacion:{' '}
            <button class="btn btn-success" onClick={handleClickAllCrimes}>Actualizar</button>
          </label>
        </div>
        {/* SET IMAGE FOR ALL BUSINESS MAP*/}
        <img src={allcrimemap} classname="img-map" className='img-map' alt="" />
      </div>

      {/* SEARCH FIELD FOR BUSINESS MAP STARTS*/}

      <div className='map-section'>
        <div className='map-components'>
          <label htmlFor='text'>
            <h2>Negocios Por Zonas</h2>
            Municipio:{' '}
            <input class="form-control" value={municipioNegocios} onChange={handleChangeNegocios} />
            <button class="btn btn-success" onClick={handleClickNegocios}>Buscar</button>
            {/*<h2>Message: {municipioNegocios}</h2> */}
            {/*<h2>Updated: {updated1}</h2> */}
          </label>
        </div>
        {/* SET IMAGE FOR BUSINESS MAP*/}
        <img src={businessmap} classname="img-map" className='img-map' alt="" />
        {/* SEARCH FIELD FOR BUSINESS MAP ENDS*/}
      </div>


    {/* SEARCH FIELD FOR HOTEL MAP STARTS*/}

    <div className='map-section'>
        <div className='map-components'>
          <label htmlFor='text'>
            <h2>Hoteles Por Zonas</h2>
            Municipio:{' '}
            <input class="form-control" value={municipioHotels} onChange={handleChangeHotels} />
            <button class="btn btn-success" onClick={handleClickHotels}>Buscar</button>
            {/*<h2>Message: {municipioNegocios}</h2> */}
            {/*<h2>Updated: {updated1}</h2> */}
          </label>
        </div>
        {/* SET IMAGE FOR BUSINESS MAP*/}
        <img src={hotelmap} classname="img-map" className='img-map' alt="" />
        {/* SEARCH FIELD FOR BUSINESS MAP ENDS*/}
      </div>


      <div className='map-section'>
        <div className='map-components'>
          {/* SEARCH FIELD FOR CRIME BARS STARTS*/}
          <label htmlFor='text'>
            <h2 >Criminalidad Por Zonas</h2>
            Municipio:{' '}
            <input class="form-control" value={municipioCrime} onChange={handleChangeCrime} />
            <button class="btn btn-success" onClick={handleClickCrime}>Buscar</button>
            {/* <h2>Message: {municipioCrimeBars}</h2>*/}
            {/* <h2>Updated: {updated2}</h2>*/}

          </label>


        </div>
        {/* SET IMAGE FOR CRIME BARS MAP*/}
        <img src={crimemap} classname="img-map" className='img-map' alt="" />
      </div>
      <h2 style={{ margin: '10px', alignSelf: 'center', display: 'block', textAlign: 'center' }}>Predicción Zona Más Segura Más Cercana A La Ubicación</h2>
        {/* Use the MapContainer component */}
        <div>
          <MapContainer />
      </div>
    </div>

  );
}

//const root = ReactDOM.createRoot(document.getElementById('root'));
//root.render(<AnotherComponent />);
//export default AnotherComponent;
