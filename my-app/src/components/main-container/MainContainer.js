import React from 'react';
import Carousel from '../Carousel';

function MainContainer() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 56px)', // Subtract navbar height
      overflow: 'hidden'
    }}>
      {/* Carousel Container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}>
        <Carousel />
      </div>

      {/* Content Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1000
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          padding: '2rem',
          maxWidth: '800px'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Welcome to India's Cultural Heritage
          </h1>
          <p style={{
            fontSize: '1.8rem',
            fontWeight: '500',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            Discover the rich traditions and diverse culture of our nation
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainContainer;
