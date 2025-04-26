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
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const MessagePage = () => {
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'webchat'), where('receiverId', '==', currentUser.uid)),
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => doc.data());
        const uniqueSenders = Array.from(
          new Map(msgs.map((msg) => [msg.senderId, msg])).values()
        );
        setSenders(uniqueSenders);
      }
    );

    return () => unsubscribe();
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

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChatMessages(msgs);

      // Update message status to 'seen' if the current user is the receiver
      snapshot.docs.forEach(async (docSnap) => {
        const msg = docSnap.data();
        const msgRef = doc(db, 'webchat', docSnap.id);

        if (msg.receiverId === currentUser.uid && msg.status !== 'seen') {
          await updateDoc(msgRef, {
            status: 'seen',
          });
        }
      });
    });

    return () => unsubscribe();
  }, [selectedSender, currentUser]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentUser || !selectedSender) return;

    await addDoc(collection(db, 'webchat'), {
      senderId: currentUser.uid,
      receiverId: selectedSender.senderId,
      senderName: currentUser.displayName || currentUser.email || 'Anonymous',
      receiverName: selectedSender.senderName,
      message: newMessage.trim(),
      time: serverTimestamp(),
      status: 'sent',
    });

    setNewMessage('');
  }, [newMessage, currentUser, selectedSender]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3>Chats</h3>
        {senders.map((sender) => (
          <div
            key={sender.senderId}
            style={{
              ...styles.contact,
              backgroundColor:
                selectedSender?.senderId === sender.senderId ? '#e6e6e6' : '#fff',
            }}
            onClick={() => setSelectedSender(sender)}
          >
            {sender.senderName}
          </div>
        ))}
      </div>

      <div style={styles.chatbox}>
        {selectedSender ? (
          <>
            <div style={styles.chatHeader}>
              <h4>Chat with {selectedSender.senderName}</h4>
            </div>
            <div style={styles.chatBody}>
              {chatMessages.map((msg) => {
                const isSentByCurrentUser = msg.senderId === currentUser.uid;
                return (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.messageBubble,
                      alignSelf: isSentByCurrentUser ? 'flex-end' : 'flex-start',
                      backgroundColor: isSentByCurrentUser ? '#dcf8c6' : '#fff',
                    }}
                  >
                    <p>{msg.message}</p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginTop: '4px',
                        color: '#555',
                        alignItems: 'center',
                      }}
                    >
                      <span>{msg.senderName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{formatTime(msg.time)}</span>
                        {isSentByCurrentUser && (
                          <span style={{ fontSize: '14px' }}>
                            {msg.status === 'sent' && '✓'}
                            {msg.status === 'delivered' && '✓✓'}
                            {msg.status === 'seen' && (
                              <span style={{ color: '#34B7F1' }}>✓✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInput}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                style={styles.input}
              />
              <button onClick={sendMessage} style={styles.button}>
                Send
              </button>
            </div>
          </>
        ) : (
          <p style={{ padding: 20 }}>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '90vh',
    border: '1px solid #ccc',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  sidebar: {
    width: '30%',
    borderRight: '1px solid #ccc',
    padding: '10px',
    overflowY: 'auto',
    backgroundColor: '#f0f0f0',
  },
  contact: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
  },
  chatbox: {
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  chatHeader: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    backgroundColor: '#ededed',
  },
  chatBody: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#fafafa',
  },
  chatInput: {
    display: 'flex',
    borderTop: '1px solid #ccc',
    padding: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    marginLeft: '10px',
    padding: '10px 15px',
    backgroundColor: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
  },
  messageBubble: {
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '60%',
    boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
    wordBreak: 'break-word',
  },
};

export default MessagePage;
