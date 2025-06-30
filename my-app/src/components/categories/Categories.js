import React from 'react';
import cuisinesIcon from '../assets/cuisines_icon.jpg';
import danceIcon from '../assets/dance_icon.jpg';
import festivalIcon from '../assets/festival_icon.jpg';
import monumentsIcon from '../assets/monuments_icon.jpg';
import tradDressIcon from '../assets/trad_dress_icon.jpeg';
import unescoIcon from '../assets/unesco_icon.jpg';
import './Categories.css';

const Categories = () => {
  const categories = [
    {
      id: 1,
      title: 'Dance Forms',
      description: 'Explore the rich diversity of Indian classical and folk dance forms',
      image: danceIcon,
      count: '8 Classical Forms',
      color: '#FF6B6B'
    },
    {
      id: 2,
      title: 'Festivals',
      description: 'Celebrate the vibrant festivals that bring communities together',
      image: festivalIcon,
      count: '50+ Festivals',
      color: '#4ECDC4'
    },
    {
      id: 3,
      title: 'Monuments',
      description: 'Discover architectural marvels and historical monuments',
      image: monumentsIcon,
      count: '100+ Monuments',
      color: '#45B7D1'
    },
    {
      id: 4,
      title: 'UNESCO Heritage Sites',
      description: 'Explore India\'s cultural and natural heritage sites',
      image: unescoIcon,
      count: '40+ Sites',
      color: '#96CEB4'
    },
    {
      id: 5,
      title: 'Traditional Dresses',
      description: 'Experience the beauty of regional clothing and textiles',
      image: tradDressIcon,
      count: '28 States',
      color: '#FFEAA7'
    },
    {
      id: 6,
      title: 'Cuisines',
      description: 'Savor the diverse flavors of regional Indian cuisines',
      image: cuisinesIcon,
      count: '100+ Dishes',
      color: '#DDA0DD'
    }
  ];

  return (
    <section className="categories-section">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="categories-header text-center mb-5">
              <h2 className="categories-title">Explore Indian Culture</h2>
              <p className="categories-subtitle">
                Discover the rich tapestry of India's cultural heritage through various categories
              </p>
            </div>
          </div>
        </div>
        
        <div className="row g-4">
          {categories.map((category) => (
            <div key={category.id} className="col-lg-4 col-md-6 col-sm-12">
              <div className="category-card">
                <div className="category-image-container">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="category-image"
                    loading="lazy"
                  />
                  <div 
                    className="category-overlay"
                    style={{ backgroundColor: `${category.color}80` }}
                  ></div>
                </div>
                <div className="category-content">
                  <h3 className="category-title">{category.title}</h3>
                  <p className="category-description">{category.description}</p>
                  <div className="category-meta">
                    <span className="category-count">{category.count}</span>
                    <button className="btn btn-outline-primary btn-sm">
                      Explore More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories; 