import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar'; // ✅ Added Navbar import

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const userRef = currentUser ? doc(db, 'user', currentUser.uid) : null;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser && userRef) {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [currentUser, userRef]);

  const handleEdit = (fieldName) => {
    setEditingField(fieldName);
    setFieldValue(userData[fieldName] || '');
  };

  const handleFieldChange = (e) => {
    setFieldValue(e.target.value);
  };

  const handleFieldSave = async () => {
    try {
      const updated = { [editingField]: fieldValue };
      await updateDoc(userRef, updated);
      setUserData(prev => ({ ...prev, ...updated }));
      setEditingField(null);
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!userData) return <p style={styles.loading}>Loading...</p>;

  const renderField = (label, name, iconClass) => (
    <div style={styles.infoBox}>
      <div style={styles.infoHeader}>
        <i className={`fas ${iconClass}`} style={styles.icon}></i>
        <span style={styles.label}>{label}</span>
        <i
          className="fas fa-pen edit-icon"
          style={styles.editIcon}
          onClick={() => handleEdit(name)}
        ></i>
      </div>
      {editingField === name ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            name={name}
            value={fieldValue}
            onChange={handleFieldChange}
            style={styles.input}
          />
          <button onClick={handleFieldSave} style={styles.saveButton}>Save</button>
        </div>
      ) : (
        <div style={styles.infoContent}>{userData[name] || 'N/A'}</div>
      )}
    </div>
  );

  return (
    <div>
      <Navbar /> {/* ✅ Navbar rendered here */}
      <div style={styles.container}>
        <h1 style={styles.heading}>My Profile</h1>
        <div style={styles.card}>
          <img
            src={userData.profilePicture || '/images/default-profile.jpg'}
            alt="Profile"
            style={styles.profileImage}
          />

          <div style={styles.infoSection}>
            {renderField('Full Name', 'fullName', 'fa-user')}
            {renderField('Email', 'email', 'fa-envelope')}
            {renderField('Phone Number', 'phone', 'fa-phone')}
            {renderField('Profile Picture URL', 'profilePicture', 'fa-image')}
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    backgroundColor: '#f1f5f9',
    minHeight: '100vh',
  },
  heading: {
    textAlign: 'center',
    color: '#005f7f',
    fontSize: '32px',
    marginBottom: '20px',
  },
  card: {
    maxWidth: '700px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  profileImage: {
    width: '160px',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '50%',
    marginBottom: '20px',
    border: '3px solid #005f7f',
  },
  infoSection: {
    marginTop: '20px',
    textAlign: 'left',
  },
  infoBox: {
    background: '#f9fafb',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #e5e7eb',
    position: 'relative',
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '16px',
  },
  icon: {
    marginRight: '10px',
    color: '#005f7f',
  },
  editIcon: {
    marginLeft: 'auto',
    color: '#005f7f',
    cursor: 'pointer',
  },
  label: {
    fontSize: '16px',
  },
  infoContent: {
    fontSize: '15px',
    color: '#374151',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  saveButton: {
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    backgroundColor: '#005f7f',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  logoutButton: {
    marginTop: '30px',
    padding: '10px 24px',
    backgroundColor: '#ff4d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#005f7f',
    paddingTop: '40px',
  },
};

export default Profile;
