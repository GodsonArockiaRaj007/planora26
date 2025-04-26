import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
      const querySnapshot = await getDocs(q);
      const fetchedCompanies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResults(fetchedCompanies);
    } catch (error) {
      console.error('Error fetching companies by city:', error);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Popular Cities</h2>
      <div style={styles.grid}>
        {cities.map((city, index) => (
          <div key={index} style={styles.cityCard} onClick={() => handleCityClick(city.name)}>
            <img
              src={city.image}
              alt={city.name}
              style={styles.image}
              onError={(e) => (e.target.style.display = 'none')}
            />
            <p>{city.name}</p>
          </div>
        ))}
      </div>

      {/* Show results if available */}
      {selectedCity && (
        <div style={styles.resultSection}>
          <h3 style={styles.resultHeading}>Companies in {selectedCity}</h3>
          {results.length === 0 ? (
            <p>No companies found in {selectedCity}</p>
          ) : (
            results.map((company) => (
              <div key={company.id} style={styles.resultCard}>
                <img
                  src={company.image || `${process.env.PUBLIC_URL}/images/default.jpg`}
                  alt={company.businessname}
                  style={styles.resultImage}
                />
                <div>
                  <h4>{company.businessname}</h4>
                  <p>{company.location}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#fff',
    padding: '40px 20px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '30px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  cityCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  image: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '10px',
    border: '1px solid #ccc',
  },
  resultSection: {
    marginTop: '40px',
    textAlign: 'left',
    maxWidth: '900px',
    marginInline: 'auto',
  },
  resultHeading: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  resultCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    marginBottom: '16px',
    backgroundColor: '#f9f9f9',
  },
  resultImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
};

export default PopularCities;
