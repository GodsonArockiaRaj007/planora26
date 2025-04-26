import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CompanyGrid = () => {
  const [companies, setCompanies] = useState([]);
  const [visibleCompanies, setVisibleCompanies] = useState([]);
  const [loadCount, setLoadCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'postorder'));
        const companyList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(companyList);
        setVisibleCompanies(companyList.slice(0, loadCount));
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  const handleScroll = useCallback((e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        setLoadCount(prevCount => prevCount + 8);
        setIsLoading(false);
      }, 1000);
    }
  }, [isLoading]);

  useEffect(() => {
    setVisibleCompanies(companies.slice(0, loadCount));
  }, [loadCount, companies]);

  const handleCompanyClick = (id) => {
    navigate(`/company/${id}`);
  };

  return (
    <div
      style={styles.wrapper}
      onScroll={handleScroll}
      className="company-grid-container"
    >
      <h2 style={styles.heading}>All Companies</h2>
      <div style={styles.grid}>
        {visibleCompanies.map((company) => (
          <div
            key={company.id}
            style={styles.card}
            onClick={() => handleCompanyClick(company.id)}
          >
            <img
              src={company.image}
              alt={company.businessname}
              style={styles.image}
              onError={(e) => (e.target.style.display = 'none')}
            />
            <p style={styles.name}>{company.businessname}</p>
          </div>
        ))}
      </div>

      {isLoading && (
        <div style={styles.loading}>Loading more companies...</div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    padding: '40px 20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    margin: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '100%',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '30px',
  },
  grid: {
    display: 'inline-flex',
    gap: '30px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    minWidth: '160px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  image: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginBottom: '10px',
  },
  name: {
    fontSize: '16px',
    fontWeight: '500',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#888',
    marginTop: '20px',
  },
};

export default CompanyGrid;
