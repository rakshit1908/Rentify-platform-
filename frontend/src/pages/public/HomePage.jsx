import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProperties } from '../../services/property.service';
import PropertyCard from '../../components/property/PropertyCard';
import heroImage from '../../assets/rentify_luxury_home_4x_large(1).png';
import demoPropertyImage from '../../assets/rentify-house.png';
import './HomePage.css';

// ============================================================
// RENTIFY HOME PAGE
// Premium real-estate landing page. API data is used for the
// featured homes; the supplied house image is the visual fallback.
// ============================================================

const HERO_IMAGE = heroImage;

const DEMO_PROPERTIES = [
  {
    id: 'demo-1',
    title: 'Modern 2 BHK House',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    rent: 15000,
    property_type: 'house',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    status: 'available',
    property_images: [{ image_url: demoPropertyImage, is_primary: true }],
  },
  {
    id: 'demo-2',
    title: 'Premium 3 BHK Villa',
    city: 'Noida',
    state: 'Uttar Pradesh',
    rent: 18000,
    property_type: 'villa',
    bedrooms: 3,
    bathrooms: 3,
    area: 1650,
    status: 'available',
    property_images: [{ image_url: demoPropertyImage, is_primary: true }],
  },
  {
    id: 'demo-3',
    title: 'Independent 1 BHK Home',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    rent: 12000,
    property_type: 'house',
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    status: 'available',
    property_images: [{ image_url: demoPropertyImage, is_primary: true }],
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [heroSearch, setHeroSearch] = useState({
    city: '',
    propertyType: '',
    minRent: '',
    maxRent: '',
  });
  const [searchMode, setSearchMode] = useState('home');

  // ============================================================
  // FEATURED PROPERTIES
  // Loads real listings from the backend. Demo cards are shown
  // only when the API has no listings yet, so the homepage never
  // looks empty during initial development.
  // ============================================================
  useEffect(() => {
    let active = true;
    fetchProperties({ sort: 'newest', page: 1, limit: 3 })
      .then((res) => {
        if (!active) return;
        const properties = res.data?.properties || [];
        setFeatured(properties.length ? properties.slice(0, 3) : DEMO_PROPERTIES);
      })
      .catch(() => {
        if (active) setFeatured(DEMO_PROPERTIES);
      })
      .finally(() => {
        if (active) setLoadingFeatured(false);
      });

    return () => { active = false; };
  }, []);

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (heroSearch.city.trim()) params.set('city', heroSearch.city.trim());
    if (heroSearch.propertyType) params.set('propertyType', heroSearch.propertyType);
    if (heroSearch.minRent) params.set('minRent', heroSearch.minRent);
    if (heroSearch.maxRent) params.set('maxRent', heroSearch.maxRent);
    const query = params.toString();
    return query ? `/properties?${query}` : '/properties';
  }, [heroSearch]);

  const handleHeroSearch = (event) => {
    event.preventDefault();
    navigate(searchQuery);
  };

  const selectSearchMode = (mode) => {
    setSearchMode(mode);
    setHeroSearch((current) => ({
      ...current,
      propertyType: mode === 'room' ? 'room' : current.propertyType === 'room' ? '' : current.propertyType,
    }));
  };

  return (
    <div className="rentify-home">
      {/* ========================================================
          HERO SECTION
          Main visual identity: the supplied Rentify house image,
          premium headline, search controls and primary CTAs.
      ======================================================== */}
      <section className="home-hero">
        <div className="home-hero__image" style={{ backgroundImage: `url("${HERO_IMAGE}")` }} aria-hidden="true" />
        <div className="home-hero__overlay" aria-hidden="true" />

        <div className="container home-hero__inner">
          <div className="home-hero__topline">
            <div className="home-hero__copy">
              <span className="home-hero__eyebrow">
                <span className="home-hero__eyebrow-dot" />
                India's Trusted House Rental Platform
              </span>

              <h1 className="home-hero__title">
                Find Your
                <span>Perfect Home.</span>
              </h1>

              <p className="home-hero__description">
                Discover verified rental homes, apartments and rooms from real owners in your city.
                Comfortable living, made simple.
              </p>
            </div>
            <div className="home-hero__community" aria-label="Trusted rental homes">
              <span className="home-hero__community-mark" aria-hidden="true">✓</span>
              <span><strong>Trusted homes</strong><small>Find your next place with confidence</small></span>
            </div>
          </div>

          <div className="home-search-wrap">
            <div className="home-search__tabs" role="group" aria-label="Choose what to search for">
              <button
                type="button"
                className={`home-search__tab ${searchMode === 'home' ? 'home-search__tab--active' : ''}`}
                onClick={() => selectSearchMode('home')}
                aria-pressed={searchMode === 'home'}
              >
                <span aria-hidden="true">⌂</span> Rent a Home
              </button>
              <button
                type="button"
                className={`home-search__tab ${searchMode === 'room' ? 'home-search__tab--active' : ''}`}
                onClick={() => selectSearchMode('room')}
                aria-pressed={searchMode === 'room'}
              >
                <span aria-hidden="true">▤</span> Find a Room
              </button>
            </div>

            <form className="home-search" onSubmit={handleHeroSearch}>
              <div className="home-search__fields">
                <label className="home-search__field home-search__field--location">
                  <span className="home-search__label">Location</span>
                  <span className="home-search__control">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-12A7 7 0 0 0 5 9c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>
                    <input
                      value={heroSearch.city}
                      onChange={(e) => setHeroSearch((s) => ({ ...s, city: e.target.value }))}
                      placeholder="Enter city, locality or landmark"
                      aria-label="Location"
                    />
                  </span>
                </label>

                <label className="home-search__field">
                  <span className="home-search__label">Property type</span>
                  <span className="home-search__control">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-7 9 7v9H3v-9Z"/><path d="M9 20v-5h6v5"/></svg>
                    <select
                      value={heroSearch.propertyType}
                      onChange={(e) => {
                        const propertyType = e.target.value;
                        setHeroSearch((s) => ({ ...s, propertyType }));
                        setSearchMode(propertyType === 'room' ? 'room' : 'home');
                      }}
                      aria-label="Property type"
                    >
                      <option value="">All homes</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment / Flat</option>
                      <option value="room">Room</option>
                      <option value="villa">Villa</option>
                    </select>
                  </span>
                </label>

                <label className="home-search__field home-search__field--rent">
                  <span className="home-search__label">Min rent</span>
                  <span className="home-search__control">
                    <span className="home-search__currency" aria-hidden="true">₹</span>
                    <select
                      value={heroSearch.minRent}
                      onChange={(e) => setHeroSearch((s) => ({ ...s, minRent: e.target.value }))}
                      aria-label="Minimum monthly rent"
                    >
                      <option value="">No minimum</option>
                      <option value="5000">₹5,000</option>
                      <option value="10000">₹10,000</option>
                      <option value="15000">₹15,000</option>
                      <option value="20000">₹20,000</option>
                      <option value="30000">₹30,000</option>
                      <option value="50000">₹50,000</option>
                    </select>
                  </span>
                </label>

                <label className="home-search__field home-search__field--rent">
                  <span className="home-search__label">Max rent</span>
                  <span className="home-search__control">
                    <span className="home-search__currency" aria-hidden="true">₹</span>
                    <select
                      value={heroSearch.maxRent}
                      onChange={(e) => setHeroSearch((s) => ({ ...s, maxRent: e.target.value }))}
                      aria-label="Maximum monthly rent"
                    >
                      <option value="">No maximum</option>
                      <option value="10000">₹10,000</option>
                      <option value="20000">₹20,000</option>
                      <option value="30000">₹30,000</option>
                      <option value="50000">₹50,000</option>
                      <option value="75000">₹75,000</option>
                      <option value="100000">₹1,00,000</option>
                    </select>
                  </span>
                </label>
              </div>

              <button type="submit" className="home-btn home-btn--primary home-search__submit">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg>
                Search Properties
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================
          TRUST STRIP
          Four quick reasons to choose Rentify.
      ======================================================== */}
      <section className="trust-strip" aria-label="Why Rentify">
        <div className="container trust-strip__grid">
          {[
            ['✓', 'Verified Properties', 'Genuine rental listings'],
            ['◎', 'Direct Owner Contact', 'No unnecessary middlemen'],
            ['⌖', 'Multiple Cities', 'Find homes across India'],
            ['◉', 'Secure & Simple', 'Easy and safe process'],
          ].map(([icon, title, desc]) => (
            <div className="trust-item" key={title}>
              <span className="trust-item__icon" aria-hidden="true">{icon}</span>
              <span>
                <strong>{title}</strong>
                <small>{desc}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          FEATURED HOMES
          Real API listings are preferred; demo image data keeps
          the visual design intact before the database is populated.
      ======================================================== */}
      <section className="home-section home-featured" id="featured">
        <div className="container">
          <div className="home-section__heading">
            <div>
              <span className="home-section__eyebrow">Featured Properties</span>
              <h2>Featured Homes</h2>
              <p>Explore beautiful rental properties from trusted owners.</p>
            </div>
            <Link to="/properties" className="home-section__link">View All Properties <span>→</span></Link>
          </div>

          <div className="featured-layout">
            <div className="featured-grid">
              {loadingFeatured
                ? [1, 2, 3].map((item) => <div className="featured-skeleton" key={item} />)
                : featured.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
            </div>

            {/* ====================================================
                OWNER CTA CARD
                Encourages property owners to join Rentify.
            ==================================================== */}
            <aside className="owner-cta">
              <div className="owner-cta__background" style={{ backgroundImage: `url("${HERO_IMAGE}")` }} />
              <div className="owner-cta__content">
                <span className="owner-cta__eyebrow">Have a property to rent?</span>
                <h3>List Your Property<br />on Rentify</h3>
                <p>Connect with genuine renters and find the right tenant easily.</p>
                <Link to="/auth/register" className="owner-cta__button">List Your Property <span>→</span></Link>
                <div className="owner-cta__benefits">
                  <span><b>✓</b> Free Listing</span>
                  <span><b>✓</b> More Reach</span>
                  <span><b>✓</b> Easy Manage</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ========================================================
          HOW IT WORKS
          Kept as an anchor target for the navbar.
      ======================================================== */}
      <section className="home-section how-section" id="how-it-works">
        <div className="container">
          <div className="home-section__heading home-section__heading--center">
            <div>
              <span className="home-section__eyebrow">Simple & Transparent</span>
              <h2>How Rentify Works</h2>
              <p>From finding a home to contacting the owner, everything stays simple.</p>
            </div>
          </div>

          <div className="how-grid">
            {[
              ['01', 'Search Homes', 'Choose your city, property type and budget to discover suitable rentals.'],
              ['02', 'Explore Details', 'View photos, amenities, location and property information in one place.'],
              ['03', 'Connect & Move', 'Contact the owner directly, send an inquiry and plan your move.'],
            ].map(([number, title, desc]) => (
              <article className="how-card" key={number}>
                <span className="how-card__number">{number}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          FINAL OWNER CTA
      ======================================================== */}
      <section className="final-cta">
        <div className="container final-cta__inner">
          <div>
            <span>For Property Owners</span>
            <h2>Have a home to rent?</h2>
            <p>Put your property in front of renters who are actively looking for a place to live.</p>
          </div>
          <Link to="/auth/register" className="home-btn home-btn--light">List Your Property <span>→</span></Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
