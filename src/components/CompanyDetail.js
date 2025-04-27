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
import Navbar from './Navbar';  // make sure the path is correct

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
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      <Navbar />

      <div style={styles.card}>
        <div style={styles.header}>
          <img
            src={company.image || '/images/default.jpg'}
            alt={company.businessname}
            style={styles.mainImage}
            onError={e => (e.target.style.display = 'none')}
          />
          <div style={styles.companyDetails}>
            <h1 style={styles.companyName}>{company.businessname}</h1>
            <p style={styles.category}><strong>Category:</strong> {company.eventname}</p>
            <p><strong>Location:</strong> {company.location}</p>
            <p><strong>Experience:</strong> {company.exprience} years</p>
            <p><strong>Hours:</strong> {company.hours}</p>
            <p><strong>Mobile:</strong> {company.mobilenumber}</p>
            <p><strong>Owner:</strong> {company.name}</p>
            <p style={styles.description}><strong>Description:</strong> {company.description}</p>
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
                    alt={`Menu ${idx+1}`}
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

const styles = {
  card: {
    backgroundColor: '#fff',
    maxWidth: '900px',
    margin: '30px auto',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    color: '#2c3e50',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    gap: '30px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  companyDetails: { flex: 1 },
  companyName: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#005f7f',
  },
  category: { fontSize: '18px', color: '#555' },
  description: {
    marginTop: '15px',
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#333',
  },
  mainImage: {
    width: '200px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '12px',
  },
  subheading: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#005f7f',
    textAlign: 'center',
  },
  menuContainer: { marginTop: '30px' },
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
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
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
