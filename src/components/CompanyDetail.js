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
      try {
        const docRef = doc(db, 'postorder', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompany({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompany();
  }, [id]);

  const fetchMessages = async () => {
    if (!currentUser || !company?.vendorid) return;

    setLoadingMessages(true);
    try {
      const q = query(
        collection(db, 'webchat'),
        where('senderId', 'in', [currentUser.uid, company.vendorid]),
        where('receiverId', 'in', [currentUser.uid, company.vendorid])
      );
      const snap = await getDocs(q);
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedMsgs = msgs.sort((a, b) => a.time?.seconds - b.time?.seconds);
      setChatMessages(sortedMsgs);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !company?.vendorid) return;

    const messageData = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Anonymous',
      receiverId: company.vendorid,
      receiverName: company.businessname || 'Business',
      message: messageText.trim(),
      time: serverTimestamp(),
      isRead: false,
    };

    try {
      await addDoc(collection(db, 'webchat'), messageData);
      setMessageText('');
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleChatOpen = () => {
    setShowChat(true);
    fetchMessages();
  };

  const menuImages = [...new Set(company?.menu || [])];
  const openModal = (url) => setModalImage(url);
  const closeModal = () => setModalImage(null);

  if (!company) return <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{company.businessname}</h1>
      <img
        src={company.image || '/images/default.jpg'}
        alt={company.businessname}
        style={styles.mainImage}
        onError={(e) => (e.target.style.display = 'none')}
      />

      <p><strong>Description:</strong> {company.description}</p>
      <p><strong>Category:</strong> {company.eventname}</p>
      <p><strong>Location:</strong> {company.location}</p>
      <p><strong>Experience:</strong> {company.exprience} years</p>
      <p><strong>Hours:</strong> {company.hours}</p>
      <p><strong>Mobile Number:</strong> {company.mobilenumber}</p>
      <p><strong>Owner Name:</strong> {company.name}</p>

      {menuImages.length > 0 && (
        <div style={styles.menuContainer}>
          <h2 style={styles.menuHeading}>Menu Gallery</h2>
          <div style={styles.menuGrid}>
            {menuImages.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Menu ${idx + 1}`}
                style={styles.menuImage}
                onClick={() => openModal(url)}
                onError={(e) => (e.target.style.display = 'none')}
              />
            ))}
          </div>
        </div>
      )}

      <button style={styles.chatButton} onClick={handleChatOpen}>Chat</button>

      {showChat && (
        <div style={styles.chatModal}>
          <div style={styles.chatHeader}>
            <span>Chat with {company.businessname}</span>
            <button style={styles.closeBtn} onClick={() => setShowChat(false)}>×</button>
          </div>
          <div style={styles.chatBody}>
            {loadingMessages ? (
              <p>Loading messages...</p>
            ) : (
              chatMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageBubble,
                    alignSelf: msg.senderId === currentUser?.uid ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.senderId === currentUser?.uid ? '#0d6efd' : '#e4e6eb',
                    color: msg.senderId === currentUser?.uid ? '#fff' : '#000',
                  }}
                >
                  {msg.message}
                </div>
              ))
            )}
          </div>
          <div style={styles.chatInputArea}>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={styles.chatInput}
            />
            <button onClick={handleSendMessage} style={styles.sendBtn}>Send</button>
          </div>
        </div>
      )}

      {modalImage && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <span style={styles.closeBtn} onClick={closeModal}>&times;</span>
          <img src={modalImage} alt="Enlarged menu" style={styles.modalImage} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  heading: { fontSize: '30px', fontWeight: '700', marginBottom: '20px' },
  mainImage: {
    width: '220px',
    height: '220px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  menuContainer: { marginTop: '40px', textAlign: 'left' },
  menuHeading: { fontSize: '22px', fontWeight: '600', marginBottom: '20px', textAlign: 'center' },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  menuImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #ccc',
    cursor: 'pointer',
  },
  chatButton: {
    marginTop: '30px',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  chatModal: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '320px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 2000,
  },
  chatHeader: {
    padding: '10px 16px',
    backgroundColor: '#f1f1f1',
    borderBottom: '1px solid #ccc',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
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
    padding: '8px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  chatInputArea: {
    display: 'flex',
    borderTop: '1px solid #ccc',
  },
  chatInput: {
    flex: 1,
    padding: '10px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    borderRadius: '0 0 0 12px',
  },
  sendBtn: {
    padding: '10px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '0 0 12px 0',
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
};

export default CompanyDetail;
