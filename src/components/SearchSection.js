import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const categories = [
  { name: 'Photography', image: '/images/photography.jpg' },
  { name: 'Food', image: '/images/food.jpg' },
  { name: 'Music', image: '/images/music.jpg' },
  { name: 'Catering', image: '/images/catering.jpg' },
  { name: 'Venue', image: '/images/venue.jpg' },
  { name: 'Return Gift', image: '/images/gifts.jpg' },
  { name: 'Travel', image: '/images/travel.jpg' },
  { name: 'DJ', image: '/images/dj.jpg' },
  { name: 'Cakes & Bakery', image: '/images/cakes.jpg' },
  { name: 'Decoration', image: '/images/decoration.jpg' },
  { name: 'Orchestra', image: '/images/orchestra.jpg' },
  { name: 'Wedding', image: '/images/wedding.jpg' },
  { name: 'Beautician', image: '/images/beautician.jpg' },
  { name: 'Other', image: '/images/other.jpg' }
];

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleCategories = searchTerm
    ? filteredCategories
    : showAll
      ? categories
      : categories.slice(0, 8);

  const handleCategoryClick = async (categoryName) => {
    setSelectedCategory(categoryName);
    try {
      const q = query(
        collection(db, 'postorder'),
        where('eventname', '==', categoryName)
      );
      const querySnapshot = await getDocs(q);

      const fetchedResults = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setResults(fetchedResults);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleCompanyClick = (id) => {
    navigate(`/company/${id}`);
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.heading}>Select Category</h1>
      <input
        type="text"
        placeholder="Search for category"
        style={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={styles.gridContainer}>
        {visibleCategories.map((cat, i) => (
          <div key={i} style={styles.card} onClick={() => handleCategoryClick(cat.name)}>
            <img src={cat.image} alt={cat.name} style={styles.image} />
            <p style={styles.label}>{cat.name}</p>
          </div>
        ))}
      </div>

      {/* Show More/Show Less button only if no search term */}
      {!searchTerm && (
        <div style={{ marginTop: '20px', marginBottom: '30px', textAlign: 'center' }}>
          <button style={styles.showAllBtn} onClick={() => setShowAll(prev => !prev)}>
            {showAll ? 'Show Less ▲' : 'Show All ▼'}
          </button>
        </div>
      )}

      {/* Results Section */}
      <div style={styles.resultContainer}>
        {results.length > 0 && <h2 style={styles.resultHeading}>Companies Offering {selectedCategory}</h2>}
        {results.length === 0 && selectedCategory && (
          <p style={styles.noResults}>No companies found for "{selectedCategory}"</p>
        )}
        <div style={styles.scrollRow}>
          {results.map((item) => (
            <div key={item.id} style={styles.resultCard} onClick={() => handleCompanyClick(item.id)}>
              <img src={item.image || '/images/default.jpg'} alt={item.businessname} style={styles.resultImage} />
              <div>
                <h3 style={styles.companyName}>{item.businessname || 'No Name'}</h3>
                <p style={styles.location}>{item.location || 'Unknown Location'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#003f66',
    padding: '20px',
    margin: '0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    minHeight: '50vh'
  },
  heading: {
    color: '#ffffff',
    marginBottom: '10px'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '20px',
    fontSize: '16px'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '10px'
  },
  card: {
    width: '100%',
    height: '150px',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '12px',
    textAlign: 'center',
    padding: '10px',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  image: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '10px'
  },
  label: {
    color: '#003f66',
    fontWeight: '600',
    fontSize: '14px'
  },
  showAllBtn: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  resultContainer: {
    marginTop: '30px'
  },
  resultHeading: {
    color: '#ffffff',
    marginBottom: '15px'
  },
  noResults: {
    color: '#ffffff',
    fontStyle: 'italic'
  },
  scrollRow: {
    display: 'flex',
    gap: '20px',
    overflowX: 'auto',
    paddingBottom: '10px'
  },
  resultCard: {
    minWidth: '200px',
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    cursor: 'pointer'
  },
  resultImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  companyName: {
    color: '#003f66',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  location: {
    color: '#666'
  }
};

export default SearchSection;
