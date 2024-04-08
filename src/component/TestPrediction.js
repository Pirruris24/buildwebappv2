import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

class MapContainer extends Component {

  constructor(props) {
    
    super(props);
    
    this.state = {
      markers: [],
      apiResponse: null,
      storedData: null,
    };
  }
  onMapClick = async (mapProps, map, clickEvent) => {
    const newMarker = {
      lat: clickEvent.latLng.lat(),
      lng: clickEvent.latLng.lng(),
    };

    // Update the markers state
    this.setState((prevState) => ({
      markers: [...prevState.markers, newMarker],
    }));


    // Make an API request with the clicked coordinates
    try {
      const response = await fetch(
        `http://localhost:8000/predictZone/${newMarker.lng}/${newMarker.lat}`
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      // Update the state with the API response
      this.setState({
        apiResponse: data,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  render() {
   
    return (
    <div>
      
      <div>
              {/* Display the API response */}
        {this.state.apiResponse && (
        <div>
          <h3>API Response:</h3>
          <pre>{Object.keys(this.state.apiResponse).map((key) => (
            <div key={key}>
              <strong>{key}:</strong> {this.state.apiResponse[key]}
            </div>
          ))}</pre>
        </div>
            )}
      
      </div>
        
      
      <Map
        google={this.props.google}
        onClick={this.onMapClick}
        style={{ width: '1200px', height: '800px', position: 'relative' }}
        align="Center"
        initialCenter={{ lat: 20.672960406343122, lng: -103.36882906094334}}
      >
        
        {this.state.markers.map((marker, index) => (
            <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} />)
          )}
      </Map>
      </div>
      
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyBo4lZTBQoFu5dtT7-RSyrp0v7Puat_uuw',
})(MapContainer);

 