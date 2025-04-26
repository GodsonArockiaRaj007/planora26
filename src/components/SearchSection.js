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
  { name: 'Return Gift', image: '/images/return-gift.jpg' },
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

  const topCategories = searchTerm ? filteredCategories : categories.slice(0, 8);
  const remainingCategories = searchTerm ? [] : categories.slice(8);

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
        {topCategories.map((cat, i) => (
          <div key={i} style={styles.card} onClick={() => handleCategoryClick(cat.name)}>
            <img src={cat.image} alt={cat.name} style={styles.image} />
            <p style={styles.label}>{cat.name}</p>
          </div>
        ))}
      </div>

      {!searchTerm && (
        <div style={{ marginTop: '10px', marginBottom: '20px' }}>
          <button style={styles.showAllBtn} onClick={() => setShowAll(prev => !prev)}>
            {showAll ? 'Show Less ▲' : 'Show All ▼'}
          </button>
        </div>
      )}

      {showAll && !searchTerm && (
        <div style={styles.gridContainer}>
          {remainingCategories.map((cat, i) => (
            <div key={i} style={styles.card} onClick={() => handleCategoryClick(cat.name)}>
              <img src={cat.image} alt={cat.name} style={styles.image} />
              <p style={styles.label}>{cat.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Show Results */}
      <div style={styles.resultContainer}>
        {results.length > 0 && <h2>Companies Offering {selectedCategory}</h2>}
        {results.length === 0 && selectedCategory && (
          <p>No companies found for "{selectedCategory}"</p>
        )}
        <div style={styles.scrollRow}>
          {results.map((item) => (
            <div key={item.id} style={styles.resultCard} onClick={() => handleCompanyClick(item.id)}>
              <img src={item.image || '/images/default.jpg'} alt={item.businessname} style={styles.resultImage} />
              <div>
                <h3>{item.businessname || 'No Name'}</h3>
                <p>{item.location || 'Unknown Location'}</p>
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
    backgroundColor: '#ffffff',
    padding: '20px',
    margin: '0 30px',
    marginTop: '-50px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  heading: {
    color: '#222',
    marginBottom: '10px'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '20px'
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
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '12px',
    textAlign: 'center',
    padding: '10px',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  image: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '10px'
  },
  label: {
    color: '#333',
    fontWeight: '500'
  },
  showAllBtn: {
    padding: '10px 16px',
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  resultContainer: {
    marginTop: '30px'
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
    backgroundColor: '#fafafa',
    alignItems: 'center',
    cursor: 'pointer'
  },
  resultImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px'
  }
};

export default SearchSection;
