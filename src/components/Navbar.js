// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaEnvelope
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
        await getDocs(q); // Not used for display in navbar currently
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
      setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-main">
        <div className="nav-left">
          <div className="navbar-logo">PlanOra</div>
        </div>

        <div className="nav-center">
          <div className="navbar-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <div className="search-results">
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : companies.length ? (
                  companies.map((c) => (
                    <div
                      key={c.id}
                      className="result-item"
                      onClick={() => handleSelect(c)}
                    >
                      {c.businessname}
                    </div>
                  ))
                ) : (
                  <div className="no-results">No matches found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="nav-right">
          <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <li onClick={() => { navigate('/home'); setMenuOpen(false); }}>Home</li>
            <li onClick={() => { navigate('/orders'); setMenuOpen(false); }}>Orders</li>
            <li onClick={() => { navigate('/post-order'); setMenuOpen(false); }}>Post Order</li>
            <li onClick={() => { navigate('/profile'); setMenuOpen(false); }}><FaUser /> Profile</li>
            <li onClick={() => { navigate('/messages'); setMenuOpen(false); }}><FaEnvelope /> Messages</li>
            <li onClick={() => { navigate('/cart'); setMenuOpen(false); }}><FaShoppingCart /> Cart</li>
          </ul>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(prev => !prev)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        .navbar {
          background: #003f66;
          color: #fff;
          padding: 0.5rem 1rem;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .navbar-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .nav-left {
          flex: 1;
        }

        .nav-center {
          flex: 2;
          display: flex;
          justify-content: center;
        }

        .nav-right {
          flex: 2;
          display: flex;
          justify-content: flex-end;
        }

        .navbar-logo {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .navbar-search {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 0.3rem 0.75rem;
        }

        .navbar-search input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          margin-left: 0.5rem;
          font-size: 0.9rem;
          outline: none;
        }

        .search-icon {
          color: #ddd;
        }

        .search-results {
          position: absolute;
          top: 110%;
          left: 0;
          width: 100%;
          background: #fff;
          color: #333;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          max-height: 200px;
          overflow-y: auto;
          z-index: 1001;
        }

        .result-item, .loading, .no-results {
          padding: 0.5rem;
          border-bottom: 1px solid #eee;
          cursor: pointer;
        }

        .result-item:hover {
          background: #f0f0f0;
        }

        .hamburger {
          display: none;
          font-size: 1.5rem;
          color: #fff;
          cursor: pointer;
        }

        .nav-links {
          list-style: none;
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-links li {
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .nav-links li:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .nav-center {
            order: 3;
            width: 100%;
            margin-top: 10px;
          }

          .nav-right {
            width: 100%;
            justify-content: center;
          }

          .nav-links {
            display: ${menuOpen ? 'flex' : 'none'};
            flex-direction: column;
            width: 100%;
            margin-top: 1rem;
          }

          .hamburger {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
