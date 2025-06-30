import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import './Explore.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const [statesData, setStatesData] = useState(null);
  const [heritageSites, setHeritageSites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [stateColors, setStateColors] = useState({});
  const [highlightedState, setHighlightedState] = useState(null);
  const mapRef = useRef(null);
  const geoJsonRef = useRef(null);

  // Get search query from location state
  const searchQuery = location.state?.searchQuery || '';

  // Generate random colors for states
  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
      '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
      '#F1C40F', '#E74C3C', '#1ABC9C', '#34495E', '#7F8C8D'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch states data
        const statesResponse = await fetch('http://localhost:3001/states');
        if (!statesResponse.ok) throw new Error('Failed to fetch states data');
        const statesData = await statesResponse.json();
        setStatesData(statesData);

        // Generate colors for each state
        const colors = {};
        statesData.features.forEach(feature => {
          colors[feature.properties.name] = getRandomColor();
        });
        setStateColors(colors);

        // Fetch heritage sites
        const heritageResponse = await fetch('http://localhost:3001/heritage-sites');
        if (!heritageResponse.ok) throw new Error('Failed to fetch heritage sites');
        const heritageData = await heritageResponse.json();
        setHeritageSites(heritageData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effect to handle search query
  useEffect(() => {
    console.log('Search query changed:', searchQuery); // Debug log
    if (searchQuery && statesData && geoJsonRef.current) {
      const searchTerm = searchQuery.toLowerCase();
      console.log('Searching for:', searchTerm); // Debug log
      
      const foundState = statesData.features.find(feature => 
        feature.properties.name.toLowerCase().includes(searchTerm) ||
        feature.properties.languages.toLowerCase().includes(searchTerm) ||
        feature.properties.dance_form.toLowerCase().includes(searchTerm) ||
        feature.properties.cuisine.toLowerCase().includes(searchTerm) ||
        feature.properties.festivals.toLowerCase().includes(searchTerm)
      );

      console.log('Found state:', foundState); // Debug log

      if (foundState) {
        // Set the selected state
        setSelectedState(foundState.properties);
        setHighlightedState(foundState.properties.name);

        // Find the layer for the searched state
        const layers = geoJsonRef.current.getLayers();
        const targetLayer = layers.find(layer => 
          layer.feature.properties.name === foundState.properties.name
        );

        if (targetLayer) {
          // Reset all layers to default style
          layers.forEach(layer => {
            layer.setStyle(getStateStyle(layer.feature));
          });

          // Highlight the searched state
          targetLayer.setStyle({
            fillColor: stateColors[foundState.properties.name],
            weight: 3,
            opacity: 1,
            color: 'black',
            dashArray: '3',
            fillOpacity: 0.9
          });

          // Center the map on the searched state
          const bounds = targetLayer.getBounds();
          if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 6
            });
          }
        }
      }
    }
  }, [searchQuery, statesData, stateColors]);

  // Effect to handle map bounds fitting
  useEffect(() => {
    if (mapRef.current && statesData) {
      const map = mapRef.current;
      const bounds = L.geoJSON(statesData).getBounds();
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 6
        });
      }
    }
  }, [statesData]);

  const handleStateClick = (stateName) => {
    navigate(`/state/${stateName}`);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Loading map data...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error Loading Map Data</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please make sure the server is running and try again.</p>
      </div>
    </div>
  );
  
  if (!statesData) return null;

  const getStateStyle = (feature) => {
    const isHighlighted = highlightedState === feature.properties.name;
    return {
      fillColor: stateColors[feature.properties.name],
      weight: isHighlighted ? 3 : 2,
      opacity: 1,
      color: isHighlighted ? 'black' : 'white',
      dashArray: '3',
      fillOpacity: isHighlighted ? 0.9 : 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    const properties = feature.properties;
    const stateName = properties.name.replace(/\s+/g, '_'); // Format state name for Wikipedia URL
    
    layer.bindPopup(`
      <div class="popup-content">
        <h3>${properties.name}</h3>
      </div>
    `);

    layer.on({
      click: (e) => {
        const layer = e.target;
        setSelectedState(properties);
        setHighlightedState(properties.name);
        
        // Update style for all layers
        const layers = geoJsonRef.current.getLayers();
        layers.forEach(l => {
          if (l !== layer) {
            l.setStyle(getStateStyle(l.feature));
          }
        });
        
        // Set style for clicked layer
        layer.setStyle({
          fillColor: stateColors[properties.name],
          weight: 3,
          opacity: 1,
          color: 'black',
          dashArray: '3',
          fillOpacity: 0.9
        });
      }
    });
  };

  return (
    <div className="explore-container">
      <div className="map-section">
        <div className="map-container">
          <MapContainer
            ref={mapRef}
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <GeoJSON 
              ref={geoJsonRef}
              data={statesData}
              style={getStateStyle}
              onEachFeature={onEachFeature}
            />
            {heritageSites && heritageSites.features.map((site, index) => (
              <Marker
                key={index}
                position={[
                  site.geometry.coordinates[1],
                  site.geometry.coordinates[0]
                ]}
              >
                <Popup>
                  <div className="popup-content">
                    <h3>{site.properties.name}</h3>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="right-panel">
          <div className="explore-header">
            <h1>Explore Indian States</h1>
            {searchQuery && (
              <p className="search-results">
                Showing results for: <strong>{searchQuery}</strong>
              </p>
            )}
          </div>
          {selectedState && (
            <div className="state-details">
              <h3>{selectedState.name}</h3>
              <div className="state-info">
                <p><strong>Languages:</strong> {selectedState.languages}</p>
                <p><strong>Dance Forms:</strong> {selectedState.dance_form}</p>
                <p><strong>Cuisine:</strong> {selectedState.cuisine}</p>
                <p><strong>Festivals:</strong> {selectedState.festivals}</p>
                <p><strong>Traditional:</strong> {selectedState.traditiona}</p>
                <p><strong>Historical:</strong> {selectedState.historical}</p>
              </div>
              <div className="state-links mt-3">
                <button 
                  onClick={() => handleStateClick(selectedState.name)}
                  className="btn btn-primary me-2"
                >
                  Learn More
                </button>
                <a 
                  href={`https://en.wikipedia.org/wiki/${selectedState.name.replace(/\s+/g, '_')}`}
                  className="btn btn-outline-secondary"
                  target="_blank"
                >
                  View on Wikipedia
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Explore;