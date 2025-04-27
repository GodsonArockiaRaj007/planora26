// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const userRef = doc(db, 'user', currentUser?.uid);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setUpdatedData(data); // Pre-fill the edit form with current user data
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser, userRef]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateDoc(userRef, updatedData);
      setUserData(updatedData);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');  // Redirect to login page after logging out
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <div style={styles.profileContainer}>
      <h1>Profile Details</h1>
      <div style={styles.userInfo}>
        <img
          src={updatedData.profilePicture || '/images/default-profile.jpg'}
          alt="Profile"
          style={styles.profileImage}
        />
        {editing ? (
          <>
            <input
              type="text"
              name="fullName"
              value={updatedData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              style={styles.input}
            />
            <input
              type="text"
              name="phoneNumber"
              value={updatedData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              style={styles.input}
            />
            <input
              type="text"
              name="profilePicture"
              value={updatedData.profilePicture}
              onChange={handleChange}
              placeholder="Profile Picture URL"
              style={styles.input}
            />
            <button onClick={handleSave} style={styles.saveButton}>Save</button>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {userData.fullName}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Phone:</strong> {userData.phoneNumber}</p>
            <button onClick={() => setEditing(true)} style={styles.editButton}>Edit Profile</button>
          </>
        )}
      </div>

      <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
    </div>
  );
};

const styles = {
  profileContainer: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  userInfo: {
    marginTop: '20px',
  },
  profileImage: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '50%',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    margin: '8px 0',
    width: '80%',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  editButton: {
    padding: '10px 20px',
    marginTop: '20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    marginTop: '20px',
    backgroundColor: 'green',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: '10px 20px',
    marginTop: '20px',
    backgroundColor: '#ff4d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default Profile;
