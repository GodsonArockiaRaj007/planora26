import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaUser, FaAngleDown, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'webchat'),
          where('receiverId', '==', user.uid),
          orderBy('time', 'desc')
        );
        const snap = await getDocs(q);
        const msgData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Group messages by senderId (only latest message per sender)
        const grouped = {};
        msgData.forEach(msg => {
          if (!grouped[msg.senderId]) {
            grouped[msg.senderId] = msg;
          }
        });

        setMessages(Object.values(grouped));
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [user]);

  const handleSearch = async (e) => {
    const qText = e.target.value;
    setSearchQuery(qText);

    if (!qText) {
      setCompanies([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'postorder'),
        where('businessname', '>=', qText),
        where('businessname', '<=', qText + '\uf8ff')
      );
      const snap = await getDocs(q);
      const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(results);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company) => {
    navigate(`/company/${company.id}`);
    setSearchQuery('');
    setCompanies([]);
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>PlanOra</div>

      <div style={{ ...styles.searchBox, position: 'relative' }}>
        <FaSearch style={{ marginRight: 8, color: '#999' }} />
        <input
          type="text"
          placeholder="Search for a company..."
          value={searchQuery}
          onChange={handleSearch}
          style={styles.searchInput}
        />

        {searchQuery && (
          <div style={styles.resultsContainer}>
            {loading ? (
              <div style={styles.loadingText}>Loading...</div>
            ) : companies.length ? (
              companies.map(c => (
                <div
                  key={c.id}
                  style={styles.resultItem}
                  onClick={() => handleSelect(c)}
                >
                  {c.businessname}
                </div>
              ))
            ) : (
              <div style={styles.noResults}>No matches found</div>
            )}
          </div>
        )}
      </div>

      <div style={styles.links}>
        <a href="#" style={{ ...styles.link, ...styles.activeLink }}>Home</a>
        <a href="#" style={styles.link}>Orders</a>
        {/* Add Post Order Link here */}
        <a
          href="#"
          onClick={() => navigate('/post-order')}
          style={styles.link}
        >
          Post Order
        </a>
        <a href="#" style={styles.link}><FaShoppingCart /></a>
        <div onClick={() => navigate('/profile')} style={{ ...styles.link, cursor: 'pointer' }}><FaUser /></div>

        {/* Message Icon (navigate to messages page on click) */}
        <div style={styles.linkWrapper}>
          <FaEnvelope
            style={{ ...styles.link, cursor: 'pointer' }}
            onClick={() => navigate('/messages')} // Navigate to /messages
          />
        </div>

        <a href="#" style={styles.link}><FaAngleDown /></a>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #430000, #000000)',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 999,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: '6px 12px',
    borderRadius: 20,
    flex: 1,
    maxWidth: 300,
    marginRight: 30,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    marginTop: 4,
    maxHeight: 200,
    overflowY: 'auto',
    zIndex: 1000,
  },
  resultItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #444',
    color: '#fff',
  },
  loadingText: {
    padding: 12,
    textAlign: 'center',
    color: '#ccc',
  },
  noResults: {
    padding: 12,
    textAlign: 'center',
    color: '#ccc',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: 14,
    padding: '6px 12px',
    borderRadius: 20,
    transition: 'background 0.3s',
  },
  activeLink: {
    backgroundColor: '#0d6efd',
  },
  linkWrapper: {
    position: 'relative',
  },
};

export default Navbar;
