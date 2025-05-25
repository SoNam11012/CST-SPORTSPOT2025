import Head from "next/head";
import Script from "next/script";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About CST-SportSpot</title>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/custom.css" />
      </Head>

      <nav className="navbar navbar-expand-lg navbar-dark sticky-top bg-success">
        <div className="container">
          <a className="navbar-brand" href="/">
            <i className="fas fa-basketball-ball me-2"></i>CST-SportSpot
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/venue">Venues</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="/about">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/how">How It Works</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/questions">FAQ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <header className="about-header text-white text-center py-5">
        <div className="container">
          <h1 className="display-4">About CST-SportSpot</h1>
          <p className="lead">Your Campus Sports Booking Solution</p>
        </div>
      </header>

      <section className="about-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <h2>CST-SportSpot</h2>
              <p className="lead">
                An innovative online platform designed specifically for the
                College of Science and Technology community.
              </p>
              <p>
                CST-SportSpot streamlines the often complicated process of
                reserving sports venues, making it accessible to all students
                and faculty members. Our user-friendly service ensures that
                booking your favorite sports facility is just a few clicks away.
              </p>
              <div className="mission-box mt-4">
                <h3>Our Mission</h3>
                <p>
                  We believe that access to quality sports facilities should be
                  simple and hassle-free. Our mission is to encourage physical
                  activity and sports participation among the CST community by
                  removing booking barriers and providing a transparent,
                  real-time reservation system.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <img
                src="https://github.com/SoNam11012/CST-SportSpot/blob/main/bbcourt.jpg?raw=true"
                alt="CST Basketball Court"
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="about-section bg-light">
        <div className="container">
          <h2 className="text-center mb-5">What We Offer</h2>
          <div className="row">
            {/* Feature Cards Here (map if desired) */}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <h2 className="text-center mb-5">How It Works</h2>
          <div className="row">
            {/* Step Cards Here */}
          </div>
        </div>
      </section>

      <section className="about-section bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Why Choose CST-SportSpot?</h2>
          <div className="row">
            {/* Why Choose Cards Here */}
          </div>
        </div>
      </section>

      <footer className="footer bg-dark text-light py-5" id="contact">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <h3 className="footer-logo mb-3">
                <i className="fas fa-basketball-ball me-2"></i>SportSpot
              </h3>
              <p>
                SportSpot is your one-stop solution for booking sports venues.
                We connect you with the best indoor and outdoor venues for all
                your sports needs.
              </p>
              <div className="d-flex mt-3">
                <a href="#" className="social-link">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <div className="col-md-6 col-lg-2">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/venue">Venues</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/how">How It Works</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="/questions">FAQ</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h3 className="footer-title">Contact Us</h3>
              <p><i className="fas fa-map-marker-alt me-2"></i> CST, Phuentsholing</p>
              <p><i className="fas fa-phone me-2"></i> +97577123456</p>
              <p><i className="fas fa-envelope me-2"></i> info@cstsportspot.com</p>
            </div>
            <div className="col-md-6 col-lg-3">
              <h3 className="footer-title">Newsletter</h3>
              <p>Subscribe to our newsletter for updates</p>
              <div className="input-group">
                <input type="email" className="form-control" placeholder="Your Email" />
                <button className="btn btn-accent" type="button">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-12 text-center">
              <p>&copy; 2025 CST-SportSpot. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></Script>
    </>
  );
}
