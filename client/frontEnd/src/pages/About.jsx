import { useEffect } from 'react';
import './About.css';

function About() {
  useEffect(() => {
    document.title = 'About Us - Hotel Reservation';
  }, []);

  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About Our Hotel</h1>
        <p className="hero-subtitle">Experience luxury and comfort like never before</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Welcome to Our Hotel</h2>
          <p>
            Founded with a vision to provide exceptional hospitality, our hotel has been 
            serving guests from around the world with dedication and passion. We believe in 
            creating memorable experiences that go beyond just comfortable accommodation.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Our mission is to provide world-class hospitality while maintaining 
            sustainable practices. We strive to make every guest feel at home away from home,
            offering personalized service and luxurious amenities.
          </p>
        </section>

        <section className="about-section">
          <h2>Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Premium Locations</h3>
              <p>Our hotels are situated in the most convenient and desirable locations.</p>
            </div>
            <div className="feature-card">
              <h3>Luxury Amenities</h3>
              <p>Enjoy state-of-the-art facilities including pool, spa, and fine dining with good service.</p>
            </div>
            <div className="feature-card">
              <h3>Exceptional Service</h3>
              <p>Our staff is dedicated to making your stay as comfortable as possible.</p>
            </div>
            <div className="feature-card">
              <h3>Best Price Guarantee</h3>
              <p>We offer competitive rates without compromising on quality.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Contact Us</h2>
          <div className="contact-info">
            <p><strong>Address:</strong> Caloocan City</p>
            <p><strong>Phone:</strong> +1 (555) 123-45678</p>
            <p><strong>Email:</strong> info@hotelreservation.com</p>
            <p><strong>Hours:</strong> 24/7 Customer Support</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
