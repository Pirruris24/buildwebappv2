import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      markers: [],
      apiResponse: null,
      storedData: null,
      activeMarker: {},
      selectedPlace: {},
      userClickedCoordinates: { lat: 0, lng: 0 },
      combinedCoordinates: '',

    };
  }

  updateCombinedCoordinates = (lat, lng) => {
    const newCombinedCoordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    this.setState({
      combinedCoordinates: newCombinedCoordinates,
    });
  };

  onMapClick = async (mapProps, map, clickEvent) => {
    const newMarker = {
      lat: clickEvent.latLng.lat(),
      lng: clickEvent.latLng.lng(),
    };

    // Update the markers state
    this.setState({
      markers: [newMarker],
      activeMarker: null, // Close any open info windows
      userClickedCoordinates: newMarker,
    });

    this.updateCombinedCoordinates(newMarker.lat, newMarker.lng);

  };



  handleManualInput = async () => {

    // Clear previous markers
    this.setState({
      markers: [],
    });

    const enteredLat = parseFloat(this.state.enteredLat);
    const enteredLng = parseFloat(this.state.enteredLng);

    // Check if enteredLat and enteredLng are valid numbers
    if (!isNaN(enteredLat) && !isNaN(enteredLng)) {
      const newMarker = {
        lat: enteredLat,
        lng: enteredLng,
        color: 'blue', // You can set a different color for manually entered markers
      };

      // Update the markers state
      this.setState((prevState) => ({
        markers: [...prevState.markers, newMarker],
      }));

      this.updateCombinedCoordinates(newMarker.lat, newMarker.lng);

      // Make an API request with the entered coordinates
      try {
        const response = await fetch(
          `http://localhost:8000/predictZone/${enteredLng}/${enteredLat}`
        );

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();

        // Update the state with the API response
        this.setState({
          apiResponse: data,
        });

        // Update the marker position based on the prediction result
        const predictedMarker = {
          lat: parseFloat(data.latitud),
          lng: parseFloat(data.longitud),
        };

        // Add the new marker with the predicted coordinates
        this.setState((prevState) => ({
          markers: [
            ...prevState.markers,
            { ...newMarker, color: 'yellow' }, // Blue marker
            { ...predictedMarker, color: 'green' }, // Green marker
          ],
        }));

        this.updateCombinedCoordinates(predictedMarker.lat, predictedMarker.lng);

        // Assuming you have a reference to the map, you can use it to pan to the new marker
        const newMarkerLatLng = new window.google.maps.LatLng(
          predictedMarker.lat,
          predictedMarker.lng
        );
        this.map.panTo(newMarkerLatLng);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      alert('Please enter valid latitude and longitude values.');
    }
  };

  // New function to handle API call on "Calcular" button click
  handleCalcularClick = async () => {
    // Get the last clicked coordinates
    const { lng, lat } = this.state.userClickedCoordinates;

    // Make an API request with the clicked coordinates
    try {
      const response = await fetch(
        `http://localhost:8000/predictZone/${lng}/${lat}`
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      // Update the state with the API response
      this.setState({
        apiResponse: data,
      });

      this.fetchNearbyHotels(data.latitud, data.longitud);
      // Update the marker position based on the prediction result




      const predictedMarker = {
        lat: parseFloat(data.latitud),
        lng: parseFloat(data.longitud),
      };

      // Add the new marker with the predicted coordinates
      this.setState((prevState) => ({
        markers: [
          ...prevState.markers,
          { ...predictedMarker, color: 'green' }, // Green marker
        ],
      }));

      this.updateCombinedCoordinates(predictedMarker.lat, predictedMarker.lng);

      // Assuming you have a reference to the map, you can use it to pan to the new marker
      const newMarkerLatLng = new window.google.maps.LatLng(
        predictedMarker.lat,
        predictedMarker.lng
      );
      this.map.panTo(newMarkerLatLng);
    } catch (error) {
      console.error('Error fetching data:', error);
    }



    

    
  };

  fetchNearbyHotels = async (lat, lng) => {
    // Make an API request to fetch nearby hotels
    try {
      const response = await fetch(
        `http://localhost:8000/fetchNearbyHotels/${lng}/${lat}`
      );
  
      if (!response.ok) {
        throw new Error('API request failed');
      }
  
      const data = await response.json();
  
      // Update the state with the nearby hotels data
      this.setState({
        nearbyHotels: data,
      });
    } catch (error) {
      console.error('Error fetching nearby hotels data:', error);
    }
  };

  onMarkerClick = (props, marker, e) => {
    this.setState({
      activeMarker: marker,
      selectedPlace: props,

    });
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  render() {
    return (
      <div className='component-container'>
        <div>
          
          {/*<div>
           
            {this.state.apiResponse && (
              <div>
                <h3>API Response:</h3>
                <pre>
                  {Object.keys(this.state.apiResponse).map((key) => (
                    <div key={key}>
                      <strong>{key}:</strong> {this.state.apiResponse[key]}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>*/}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Display the API response */}
            {this.state.nearbyHotels && (
              <div>
                <h3>Hotel Response:</h3>
                <pre>
                  {Object.keys(this.state.nearbyHotels).map((key) => (
                    <div key={key}>
                      <strong>{parseInt(key) + 1}:</strong> {this.state.nearbyHotels[key]}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>

            <div>
              <label style={{ margin: '20px' }}>
                Coordenadas:
                <input
                  type="text"
                  class="form-control"
                  name="combinedCoordinates"
                  value={this.state.combinedCoordinates}
                  onChange={this.handleInputChange}
                />
              </label>
            </div>
            <div>
              <label style={{ margin: '20px' }}>
                 Latitud:
                <input
                  type="text"
                  name="enteredLat"
                  class="form-control"
                  value={this.state.enteredLat}
                  onChange={this.handleInputChange}

                />
              </label>
              <label>
                 Longitud:
                <input
                  type="text"
                  name="enteredLng"
                  class="form-control"
                  value={this.state.enteredLng}
                  onChange={this.handleInputChange}

                />
              </label>
              <button onClick={this.handleManualInput} className='btn btn-default ' style={{margin:'10px'}}>Añadir Marcador</button>
                <button class="btn btn-success" onClick={this.handleCalcularClick} >Calcular Zona</button>

            </div>

          </div>
          <div style={{bottom:'0'}}>
            <Map
              google={this.props.google}
              onClick={this.onMapClick}
              style={{ width: '100%', height: '800px', position: 'relative' }}
              align="Center"
              zoom={14}
              initialCenter={{ lat: 20.672960406343122, lng: -103.36882906094334 }}
            >
              {this.state.markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  /*icon={{
                    url: `https://maps.google.com/mapfiles/ms/icons/${marker.color}-dot.png`,
                    anchor: new window.google.maps.Point(32, 32),
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}*/
                  onClick={this.onMarkerClick}
                />


              ))}

            </Map>
          </div>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyBo4lZTBQoFu5dtT7-RSyrp0v7Puat_uuw',
})(MapContainer);


