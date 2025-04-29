// src/components/CompanyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import Navbar from './Navbar';

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchCompany = async () => {
      const docRef = doc(db, 'postorder', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setCompany({ id: docSnap.id, ...docSnap.data() });
    };
    fetchCompany();
  }, [id]);

  const fetchMessages = async () => {
    if (!currentUser || !company?.vendorid) return;
    setLoadingMessages(true);
    const q = query(
      collection(db, 'webchat'),
      where('senderId', 'in', [currentUser.uid, company.vendorid]),
      where('receiverId', 'in', [currentUser.uid, company.vendorid])
    );
    const snap = await getDocs(q);
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    msgs.sort((a, b) => a.time?.seconds - b.time?.seconds);
    setChatMessages(msgs);
    setLoadingMessages(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !company?.vendorid) return;
    const messageData = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Anonymous',
      receiverId: company.vendorid,
      receiverName: company.businessname,
      message: messageText.trim(),
      time: serverTimestamp(),
      isRead: false,
    };
    await addDoc(collection(db, 'webchat'), messageData);
    setMessageText('');
    fetchMessages();
  };

  if (!company) return <p style={styles.loading}>Loading...</p>;

  const menuImages = [...new Set(company.menu || [])];

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar />

      <div style={styles.card}>
        <div style={styles.header}>
          <img
            src={company.image || '/images/default.jpg'}
            alt={company.businessname}
            style={styles.mainImage}
            onError={e => (e.target.style.display = 'none')}
          />
          <div>
            <h1 style={styles.companyName}>{company.businessname}</h1>
            <p style={styles.category}><strong>Category:</strong> {company.eventname}</p>
          </div>
        </div>

        <div style={styles.infoGrid}>
          <InfoBox icon="fa-user" label="Owner" value={company.name} />
          <InfoBox icon="fa-map-marker-alt" label="Location" value={company.location} />
          <InfoBox icon="fa-calendar-alt" label="Posting Date" value="27-APR-25" />
          <InfoBox icon="fa-phone" label="Mobile" value={company.mobilenumber} />
          <InfoBox icon="fa-clock" label="Working Hours" value={company.hours} />
          <InfoBox icon="fa-briefcase" label="Experience" value={`${company.exprience} years`} />
        </div>

        <div style={styles.infoBox}>
          <div style={styles.infoHeader}>
            <i className="fas fa-align-left" style={styles.icon}></i>
            <span style={styles.infoLabel}>Description</span>
          </div>
          <div style={styles.infoContent}>
            <p>{company.description}</p>
          </div>
        </div>

        {menuImages.length > 0 && (
          <div style={styles.menuContainer}>
            <h2 style={styles.subheading}>Menu Gallery</h2>
            <div style={styles.menuGrid}>
              {menuImages.map((url, idx) => (
                <div key={idx} style={styles.menuImageWrapper}>
                  <img
                    src={url}
                    alt={`Menu ${idx + 1}`}
                    style={styles.menuImage}
                    onClick={() => setModalImage(url)}
                    onError={e => (e.target.style.display = 'none')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.chatButtonWrapper}>
          <button
            style={styles.chatButton}
            onClick={() => { setShowChat(true); fetchMessages(); }}
          >
            Chat with Vendor
          </button>
        </div>
      </div>

      {showChat && (
        <div style={styles.chatModal}>
          <div style={styles.chatHeader}>
            <span>Chat with {company.businessname}</span>
            <button style={styles.closeBtn} onClick={() => setShowChat(false)}>×</button>
          </div>
          <div style={styles.chatBody}>
            {loadingMessages
              ? <p>Loading messages…</p>
              : chatMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageBubble,
                    alignSelf: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.senderId === currentUser.uid ? '#005f7f' : '#e4e6eb',
                    color: msg.senderId === currentUser.uid ? '#fff' : '#000',
                  }}
                >
                  {msg.message}
                </div>
              ))
            }
          </div>
          <div style={styles.chatInputArea}>
            <input
              style={styles.chatInput}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Type a message…"
            />
            <button style={styles.sendBtn} onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}

      {modalImage && (
        <div style={styles.modalOverlay} onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="Menu" style={styles.modalImage} />
        </div>
      )}
    </div>
  );
};

// Reusable Info Box Component
const InfoBox = ({ icon, label, value }) => (
  <div style={styles.infoBox}>
    <div style={styles.infoHeader}>
      <i className={`fas ${icon}`} style={styles.icon}></i>
      <span style={styles.infoLabel}>{label}</span>
    </div>
    <div style={styles.infoContent}>{value || 'N/A'}</div>
  </div>
);

const styles = {
  card: {
    backgroundColor: '#fff',
    maxWidth: '1000px',
    margin: '30px auto',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    gap: '30px',
    alignItems: 'center',
    marginBottom: '30px',
  },
  companyName: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#005f7f',
  },
  category: {
    fontSize: '18px',
    color: '#555',
  },
  mainImage: {
    width: '200px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '12px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  infoBox: {
    background: '#f9fafb',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #e5e7eb',
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    fontWeight: '600',
    fontSize: '16px',
  },
  icon: {
    marginRight: '10px',
    color: '#005f7f',
  },
  infoLabel: {
    fontSize: '16px',
  },
  infoContent: {
    fontSize: '15px',
    color: '#374151',
  },
  menuContainer: {
    marginTop: '20px',
  },
  subheading: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#005f7f',
    textAlign: 'center',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
  },
  menuImageWrapper: { overflow: 'hidden', borderRadius: '8px' },
  menuImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  chatButtonWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '30px',
  },
  chatButton: {
    padding: '12px 24px',
    backgroundColor: '#005f7f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  chatModal: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '320px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2000,
  },
  chatHeader: {
    padding: '12px 16px',
    backgroundColor: '#005f7f',
    color: '#fff',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '600',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
  },
  chatBody: {
    padding: '10px',
    maxHeight: '300px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '16px',
    fontSize: '14px',
  },
  chatInputArea: {
    display: 'flex',
    borderTop: '1px solid #ccc',
  },
  chatInput: {
    flex: 1,
    padding: '10px',
    border: 'none',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    padding: '10px 16px',
    backgroundColor: '#005f7f',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalImage: {
    maxWidth: '90%',
    maxHeight: '90%',
    borderRadius: '8px',
  },
  loading: {
    color: '#005f7f',
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
  },
};

export default CompanyDetail;
