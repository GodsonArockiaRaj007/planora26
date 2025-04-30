import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const CompanyGrid = () => {
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Refs to track manual scroll state and timeout
  const isManualScrolling = useRef(false);
  const manualScrollTimeout = useRef(null);

  // Fetch & sort companies once
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'postorder'));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const A = (a.businessname || '').toLowerCase();
            const B = (b.businessname || '').toLowerCase();
            return A.localeCompare(B);
          });
        setCompanies(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Continuous auto‐scroll with seamless infinite loop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollStep = 1; // Speed of scrolling (adjust as necessary)
    let animationFrameId;

    const step = () => {
      if (!isManualScrolling.current) {
        el.scrollLeft += scrollStep;
        // Reset scrollLeft to half scrollWidth for seamless loop
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (manualScrollTimeout.current) clearTimeout(manualScrollTimeout.current);
    };
  }, [companies]);

  const scrollLeft = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Pause auto-scroll
    isManualScrolling.current = true;
    el.scrollBy({ left: -200, behavior: 'smooth' });
    // Resume auto-scroll after 2 seconds
    if (manualScrollTimeout.current) clearTimeout(manualScrollTimeout.current);
    manualScrollTimeout.current = setTimeout(() => {
      isManualScrolling.current = false;
    }, 2000);
  };

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Pause auto-scroll
    isManualScrolling.current = true;
    el.scrollBy({ left: 200, behavior: 'smooth' });
    // Resume auto-scroll after 2 seconds
    if (manualScrollTimeout.current) clearTimeout(manualScrollTimeout.current);
    manualScrollTimeout.current = setTimeout(() => {
      isManualScrolling.current = false;
    }, 2000);
  };

  return (
    <div style={styles.wrapper}>
      {/* Hide scrollbar */}
      <style>{`
        .scrollWrapper::-webkit-scrollbar { display: none; }
        .scrollWrapper { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <h2 style={styles.heading}>All Companies</h2>

      <div style={styles.scrollArea}>
        <button onClick={scrollLeft} style={styles.arrowButton}>
          <FaChevronLeft size={20} />
        </button>

        <div
          className="scrollWrapper"
          style={styles.scrollWrapper}
          ref={scrollRef}
        >
          <div style={styles.grid}>
            {[...companies, ...companies].map((c, index) => (
              <div
                key={c.id + '-' + index}
                style={styles.card}
                onClick={() => navigate(`/company/${c.id}`)}
              >
                <img
                  src={c.image || '/images/default.jpg'}
                  alt={c.businessname}
                  style={styles.image}
                  loading="lazy"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <p style={styles.name}>{c.businessname || 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={scrollRight} style={styles.arrowButton}>
          <FaChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#003f66',
    padding: '40px 20px',
    overflow: 'hidden',
  },
  heading: {
    color: '#fff',
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: 600,
    marginBottom: '30px',
  },
  scrollArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  scrollWrapper: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollBehavior: 'smooth',
  },
  grid: {
    display: 'inline-flex',
    gap: '20px',
  },
  card: {
    flex: '0 0 auto',
    width: '180px',
    height: '230px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    objectFit: 'cover',
    marginBottom: '12px',
  },
  name: {
    color: '#003f66',
    fontSize: '16px',
    fontWeight: 600,
    wordBreak: 'break-word',
  },
  arrowButton: {
    background: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default CompanyGrid;
