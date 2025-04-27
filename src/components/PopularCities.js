// src/components/PopularCities.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const cities = [
  { name: 'Chennai', image: `${process.env.PUBLIC_URL}/images/chennai.jpg` },
  { name: 'Madurai', image: `${process.env.PUBLIC_URL}/images/madurai.jpg` },
  { name: 'Kanchi', image: `${process.env.PUBLIC_URL}/images/kanchi.jpg` },
  { name: 'Thanjavur', image: `${process.env.PUBLIC_URL}/images/thanjavur.jpg` },
  { name: 'Coimbatore', image: `${process.env.PUBLIC_URL}/images/coimbatore.jpg` },
  { name: 'Tirunelveli', image: `${process.env.PUBLIC_URL}/images/tirunelveli.jpg` },
  { name: 'Trichy', image: `${process.env.PUBLIC_URL}/images/trichy.jpg` },
  { name: 'Hosur', image: `${process.env.PUBLIC_URL}/images/hosur.jpg` },
  { name: 'Kodaikanal', image: `${process.env.PUBLIC_URL}/images/kodaikanal.jpg` },
];

const PopularCities = () => {
  const [results, setResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  const handleCityClick = async (cityName) => {
    setSelectedCity(cityName);
    try {
      const q = query(collection(db, 'postorder'), where('location', '==', cityName));
      const snap = await getDocs(q);
      setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching companies by city:', error);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Popular Cities</h2>

      <div style={styles.grid}>
        {cities.map((city, idx) => (
          <div
            key={idx}
            style={styles.cityCard}
            onClick={() => handleCityClick(city.name)}
          >
            <img
              src={city.image}
              alt={city.name}
              style={styles.cityImage}
              onError={e => (e.target.style.display = 'none')}
            />
            <p style={styles.cityName}>{city.name}</p>
          </div>
        ))}
      </div>

      {selectedCity && (
        <div style={styles.resultSection}>
          <h3 style={styles.resultHeading}>Companies in {selectedCity}</h3>
          {results.length === 0 ? (
            <p style={styles.noResults}>No companies found in {selectedCity}</p>
          ) : (
            <div style={styles.scrollRow}>
              {results.map(company => (
                <Link
                  key={company.id}
                  to={`/company/${company.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={styles.resultCard}>
                    <img
                      src={company.image || `${process.env.PUBLIC_URL}/images/default.jpg`}
                      alt={company.businessname}
                      style={styles.resultImage}
                      onError={e => (e.target.style.display = 'none')}
                    />
                    <h4 style={styles.resultName}>{company.businessname || 'No Name'}</h4>
                    <p style={styles.location}>{company.location || 'Unknown Location'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#003f66',
    padding: '40px 20px',
    color: '#fff',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 600,
    marginBottom: '30px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto 40px',
  },
  cityCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  cityImage: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '8px',
  },
  cityName: {
    color: '#003f66',
    fontWeight: 600,
    fontSize: '14px',
    textAlign: 'center',
  },
  resultSection: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  resultHeading: {
    fontSize: '22px',
    fontWeight: 600,
    marginBottom: '20px',
  },
  noResults: {
    fontStyle: 'italic',
  },
  scrollRow: {
    display: 'flex',
    gap: '20px',
    overflowX: 'auto',
    paddingBottom: '10px',
  },
  // Fixed-size company boxes:
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '200px',      // fixed width
    height: '260px',     // fixed height
    flex: '0 0 auto',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px',
    textAlign: 'center',
  },
  resultImage: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  resultName: {
    color: '#003f66',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    marginBottom: '6px',
  },
  location: {
    color: '#666',
    fontSize: '14px',
    margin: 0,
  },
};

export default PopularCities;
