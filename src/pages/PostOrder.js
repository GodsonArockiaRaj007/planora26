// src/pages/PostOrder.jsx
import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

const PostOrder = () => {
  const [businessname, setBusinessname] = useState('');
  const [description, setDescription] = useState('');
  const [eventname, setEventname] = useState('');
  const [experience, setExperience] = useState('');
  const [from, setFrom] = useState('');
  const [hours, setHours] = useState('');
  const [location, setLocation] = useState('');
  const [mobilenumber, setMobilenumber] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [menuImages, setMenuImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = getAuth().currentUser;

  const handleImageChange = e => {
    if (e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleMenuImageChange = e => {
    if (e.target.files.length) {
      setMenuImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!image) return alert('Please select a main image.');
    if (!menuImages.length) return alert('Please select at least one menu image.');
    setLoading(true);

    try {
      // 1️⃣ Upload main business image
      const mainRef = ref(storage, `users/${user.uid}/uploads/${Date.now()}-${image.name}`);
      await uploadBytes(mainRef, image);
      const mainURL = await getDownloadURL(mainRef);

      // 2️⃣ Upload all menu images in parallel
      const menuURLs = await Promise.all(
        menuImages.map(async file => {
          const menuRef = ref(storage, `users/${user.uid}/uploads/${Date.now()}-${file.name}`);
          await uploadBytes(menuRef, file);
          return await getDownloadURL(menuRef);
        })
      );
      console.log('Uploaded menu URLs:', menuURLs);

      // 3️⃣ Save to Firestore
      await addDoc(collection(db, 'postorder'), {
        businessname,
        description,
        eventname,
        experience,
        from,
        hours,
        image: mainURL,
        location,
        menu: menuURLs,
        mobilenumber,
        name,
        vendorid: user.uid,
      });

      alert('Post order successfully added!');
      navigate('/home');
    } catch (err) {
      console.error('Error submitting post order:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Post Your Order</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Business Name"
          value={businessname}
          onChange={e => setBusinessname(e.target.value)}
          required
        />
        <textarea
          style={styles.textarea}
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Event Name"
          value={eventname}
          onChange={e => setEventname(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Experience (Years)"
          value={experience}
          onChange={e => setExperience(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="text"
          placeholder="From"
          value={from}
          onChange={e => setFrom(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Working Hours"
          value={hours}
          onChange={e => setHours(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="tel"
          placeholder="Mobile Number"
          value={mobilenumber}
          onChange={e => setMobilenumber(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        {/* Main business image */}
        <label style={styles.fileLabel}>
          Main Image (required)
          <input
            style={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </label>

        {/* Menu images */}
        <label style={styles.fileLabel}>
          Menu Images (you can select multiple, required)
          <input
            style={styles.fileInput}
            type="file"
            accept="image/*"
            multiple
            onChange={handleMenuImageChange}
            required
          />
        </label>

        <button style={styles.submitButton} disabled={loading}>
          {loading ? 'Posting...' : 'Post Order'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '40px auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  textarea: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    height: '120px',
    resize: 'vertical',
    fontSize: '16px',
  },
  fileLabel: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
    color: '#555',
  },
  fileInput: {
    marginTop: '8px',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default PostOrder;
