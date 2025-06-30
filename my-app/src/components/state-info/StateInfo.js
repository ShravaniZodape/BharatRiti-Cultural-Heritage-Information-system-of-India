import React from 'react';
import { Link } from 'react-router-dom';
import './StateInfo.css';

const StateInfo = ({ stateData }) => {
  if (!stateData) {
    return null;
  }

  return (
    <div className="state-info">
      <div className="state-header">
        <h2>{stateData.name}</h2>
        <p className="state-description">{stateData.description}</p>
      </div>
      
      <div className="state-details">
        <div className="detail-section">
          <h3>Languages</h3>
          <ul>
            {stateData.languages.map((language, index) => (
              <li key={index}>{language}</li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <h3>Dance Forms</h3>
          <ul>
            {stateData.danceForms.map((dance, index) => (
              <li key={index}>{dance}</li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <h3>Cuisine</h3>
          <ul>
            {stateData.cuisine.map((dish, index) => (
              <li key={index}>{dish}</li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <h3>Festivals</h3>
          <ul>
            {stateData.festivals.map((festival, index) => (
              <li key={index}>{festival}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="state-actions">
        <Link to={`/states/${stateData.name.toLowerCase()}`} className="btn btn-primary">
          Learn More
        </Link>
        <a
          href={stateData.wikipediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary"
        >
          Visit Wikipedia
        </a>
      </div>
    </div>
  );
};

export default StateInfo; 