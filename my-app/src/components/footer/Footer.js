import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>About Indian Culture</h5>
            <p>Discover the rich heritage, traditions, and diversity of Indian culture through our interactive platform.</p>
          </div>
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/explore">Explore States</a></li>
              <li><a href="/festivals">Festivals</a></li>
              <li><a href="/traditions">Traditions</a></li>
              <li><a href="/cuisine">Cuisine</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Connect With Us</h5>
            <div className="social-links">
              <a href="#" className="me-3"><i className="bi bi-facebook"></i></a>
              <a href="#" className="me-3"><i className="bi bi-twitter"></i></a>
              <a href="#" className="me-3"><i className="bi bi-instagram"></i></a>
              <a href="#" className="me-3"><i className="bi bi-youtube"></i></a>
            </div>
            <p className="mt-3">Email: contact@indianculture.com</p>
          </div>
        </div>
        <hr />
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} Indian Culture. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 