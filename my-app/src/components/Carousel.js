import React from 'react';
import bg_1 from './assets/bg_1.jpeg';
import bg_2 from './assets/bg_2.jpg';
import bg_3 from './assets/bg_3.avif';
import bg_4 from './assets/bg_4.avif';
import bg_5 from './assets/bg_5.webp';

function Carousel() {
  return (
    <div
      id="carouselExampleFade"
      className="carousel slide carousel-fade"
      data-bs-ride="carousel"
      data-bs-interval="3000" // Auto-slide every 3 sec
      data-bs-pause="false" // Prevents pausing on click
      data-bs-wrap="true"
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      <div className="carousel-inner" style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}>
        <div className="carousel-item active" style={{ 
          height: '100%',
          position: 'relative'
        }}>
          <img
            src={bg_1}
            alt="Slide 1"
            className="d-block w-100"
            style={{ 
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
        <div className="carousel-item" style={{ 
          height: '100%',
          position: 'relative'
        }}>
          <img
            src={bg_2}
            alt="Slide 2"
            className="d-block w-100"
            style={{ 
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
        <div className="carousel-item" style={{ 
          height: '100%',
          position: 'relative'
        }}>
          <img
            src={bg_3}
            alt="Slide 3"
            className="d-block w-100"
            style={{ 
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
        <div className="carousel-item" style={{ 
          height: '100%',
          position: 'relative'
        }}>
          <img
            src={bg_4}
            alt="Slide 4"
            className="d-block w-100"
            style={{ 
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
        <div className="carousel-item" style={{ 
          height: '100%',
          position: 'relative'
        }}>
          <img
            src={bg_5}
            alt="Slide 5"
            className="d-block w-100"
            style={{ 
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Carousel;
