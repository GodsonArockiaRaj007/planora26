import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  limit,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import Navbar from '../components/Navbar'; // ✅ Import Navbar

const MessagePage = () => {
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchFullName = async () => {
      if (!currentUser) return;
      const userDocRef = doc(db, 'user', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setFullName(userData.fullName || '');
      }
    };
    fetchFullName();
  }, [currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(
      query(
        collection(db, 'webchat'),
        where('receiverId', '==', currentUser.uid)
      ),
      snap => {
        const msgs = snap.docs.map(d => d.data());
        const unique = Array.from(
          new Map(msgs.map(m => [m.senderId, m])).values()
        );
        setSenders(unique);
      }
    );
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!selectedSender || !currentUser) return;
    const q = query(
      collection(db, 'webchat'),
      where('senderId', 'in', [currentUser.uid, selectedSender.senderId]),
      where('receiverId', 'in', [currentUser.uid, selectedSender.senderId]),
      orderBy('time'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChatMessages(msgs);
      snap.docs.forEach(async d => {
        const m = d.data();
        if (m.receiverId === currentUser.uid && m.status !== 'seen') {
          await updateDoc(doc(db, 'webchat', d.id), { status: 'seen' });
        }
      });
    });
    return unsub;
  }, [selectedSender, currentUser]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentUser || !selectedSender) return;
    await addDoc(collection(db, 'webchat'), {
      senderId: currentUser.uid,
      receiverId: selectedSender.senderId,
      senderName: fullName || 'Anonymous',
      receiverName: selectedSender.senderName,
      message: newMessage.trim(),
      time: serverTimestamp(),
      status: 'sent',
    });
    setNewMessage('');
  }, [newMessage, currentUser, selectedSender, fullName]);

  const fmtTime = ts => ts?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.pageWrapper}>
      <Navbar /> {/* ✅ Navbar added here */}
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarHeader}>Chats</h3>
          {senders.map(s => (
            <div
              key={s.senderId}
              style={{
                ...styles.contact,
                backgroundColor:
                  selectedSender?.senderId === s.senderId ? '#e6f7ff' : '#ffffff',
              }}
              onClick={() => setSelectedSender(s)}
            >
              {s.senderName}
            </div>
          ))}
        </div>

        <div style={styles.chatbox}>
          {selectedSender ? (
            <>
              <div style={styles.chatHeader}>
                Chat with <strong>{selectedSender.senderName}</strong>
              </div>
              <div style={styles.chatBody}>
                {chatMessages.map(msg => {
                  const mine = msg.senderId === currentUser.uid;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.messageBubble,
                        alignSelf: mine ? 'flex-end' : 'flex-start',
                        backgroundColor: mine ? '#dcf8c6' : '#ffffff',
                      }}
                    >
                      <p style={styles.messageText}>{msg.message}</p>
                      <div style={styles.messageMeta}>
                        <span style={styles.metaName}>{msg.senderName}</span>
                        <span style={styles.metaTime}>{fmtTime(msg.time)}</span>
                        {mine && (
                          <span style={styles.metaStatus}>
                            {msg.status === 'sent' && '✓'}
                            {msg.status === 'delivered' && '✓✓'}
                            {msg.status === 'seen' && <span style={{ color: '#34B7F1' }}>✓✓</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div style={styles.chatInput}>
                <input
                  style={styles.input}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button style={styles.sendBtn} onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={styles.noChat}>Select a user to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    backgroundColor: '#003f66',
    minHeight: '100vh',
    padding: '20px',
  },
  container: {
    display: 'flex',
    height: 'calc(100vh - 40px)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
    marginTop: '60px', // To avoid overlap with fixed Navbar (if it's fixed)
  },
  sidebar: {
    width: '30%',
    borderRight: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    overflowY: 'auto',
  },
  sidebarHeader: {
    margin: 0,
    padding: '16px',
    borderBottom: '1px solid #ddd',
    fontSize: '18px',
    backgroundColor: '#e6f7ff',
    color: '#003f66',
  },
  contact: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    color: '#003f66',
  },
  chatbox: {
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
  },
  chatHeader: {
    padding: '16px',
    backgroundColor: '#e6f7ff',
    borderBottom: '1px solid #ddd',
    color: '#003f66',
    fontWeight: '600',
  },
  chatBody: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageBubble: {
    maxWidth: '60%',
    padding: '12px',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  messageText: {
    margin: 0,
    color: '#333',
  },
  messageMeta: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
    fontSize: '12px',
    color: '#555',
  },
  metaName: { fontWeight: '500' },
  metaTime: {},
  metaStatus: { fontSize: '14px' },
  chatInput: {
    display: 'flex',
    borderTop: '1px solid #ddd',
    padding: '12px',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
    marginRight: '12px',
  },
  sendBtn: {
    padding: '10px 18px',
    backgroundColor: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
  },
  noChat: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#777',
    fontSize: '16px',
  },
};

export default MessagePage;
