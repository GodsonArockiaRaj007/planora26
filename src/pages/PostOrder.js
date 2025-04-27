// src/pages/PostOrder.jsx
import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const categories = [
  'Photography',
  'Food',
  'Music',
  'Catering',
  'Venue',
  'Return Gift',
  'Travel',
  'DJ',
  'Cakes & Bakery',
  'Decoration',
  'Orchestra',
  'Wedding',
  'Beautician',
  'Other'
];

const PostOrder = () => {
  const [businessname, setBusinessname] = useState('');
  const [description, setDescription] = useState('');
  const [eventname, setEventname] = useState(categories[0]);
  const [experience, setExperience] = useState('');
  const [from, setFrom] = useState('');
  const [hours, setHours] = useState('');
  const [location, setLocation] = useState('');
  const [mobilenumber, setMobilenumber] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [menuImages, setMenuImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [menuImagePreviews, setMenuImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = getAuth().currentUser;

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMenuImageChange = e => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setMenuImages(files);
      setMenuImagePreviews(files.map(f => URL.createObjectURL(f)));
    }
  };

  const removeMainImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const removeMenuImage = index => {
    const imgs = [...menuImages];
    imgs.splice(index, 1);
    setMenuImages(imgs);

    const previews = [...menuImagePreviews];
    previews.splice(index, 1);
    setMenuImagePreviews(previews);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!image || !menuImages.length) {
      return alert('Please select a main image and at least one menu image.');
    }
    setLoading(true);
    try {
      // Upload main image
      const mainRef = ref(storage, `users/${user.uid}/${Date.now()}-${image.name}`);
      await uploadBytes(mainRef, image);
      const mainURL = await getDownloadURL(mainRef);

      // Upload menu images
      const menuURLs = await Promise.all(
        menuImages.map(async file => {
          const mRef = ref(storage, `users/${user.uid}/${Date.now()}-${file.name}`);
          await uploadBytes(mRef, file);
          return getDownloadURL(mRef);
        })
      );

      // Save doc
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

      alert('Service posted successfully!');
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('Error posting service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      <div style={styles.card}>
        <h1 style={styles.title}>Post Your Service</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <input
              style={styles.input}
              type="text"
              placeholder="Business Name"
              value={businessname}
              onChange={e => setBusinessname(e.target.value)}
              required
            />
            <select
              style={styles.select}
              value={eventname}
              onChange={e => setEventname(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <div style={styles.row}>
            <input
              style={styles.input}
              type="number"
              placeholder="Experience (years)"
              value={experience}
              onChange={e => setExperience(e.target.value)}
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
          </div>
          <div style={styles.row}>
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
              type="date"
              placeholder="From"
              value={from}
              onChange={e => setFrom(e.target.value)}
              required
            />
          </div>
          <div style={styles.row}>
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
          </div>

          <label style={styles.fileLabel}>
            Main Image *
            <input
              style={styles.fileInput}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div style={styles.previewContainer}>
                <img
                  src={imagePreview}
                  alt="Main Preview"
                  style={styles.imagePreview}
                />
                <span onClick={removeMainImage} style={styles.removeButton}>×</span>
              </div>
            )}
          </label>

          <label style={styles.fileLabel}>
            Menu Images * (multiple)
            <input
              style={styles.fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handleMenuImageChange}
              required
            />
            <div style={styles.menuImagePreviewContainer}>
              {menuImagePreviews.map((preview, idx) => (
                <div key={idx} style={styles.previewContainer}>
                  <img
                    src={preview}
                    alt={`Menu Preview ${idx+1}`}
                    style={styles.imagePreview}
                  />
                  <span onClick={() => removeMenuImage(idx)} style={styles.removeButton}>×</span>
                </div>
              ))}
            </div>
          </label>

          <button style={styles.submitButton} disabled={loading}>
            {loading ? 'Posting…' : 'Post Service'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    backgroundColor: '#003f66',
    minHeight: '100vh',
    paddingBottom: '40px',
  },
  card: {
    maxWidth: '800px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    color: '#003f66',
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '28px',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  select: {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
  },
  textarea: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    resize: 'vertical',
    minHeight: '100px',
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
  previewContainer: {
    position: 'relative',
    display: 'inline-block',
    marginTop: '10px',
  },
  imagePreview: {
    width: '150px',
    height: 'auto',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: 'rgba(121,112,112,0.7)',
    color: '#fff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    textAlign: 'center',
    lineHeight: '20px',
    cursor: 'pointer',
  },
  menuImagePreviewContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  submitButton: {
    marginTop: '16px',
    padding: '14px',
    backgroundColor: '#003f66',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
};

export default PostOrder;
