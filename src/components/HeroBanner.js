import React from 'react';

const HeroBanner = () => {
  return (
    <div style={styles.bannerContainer}>
      <video
        src="/car-banner.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={styles.video}
      />
      <div style={styles.textOverlay}>
        <h1 style={styles.title}>PLANORA</h1>
        <p style={styles.subtitle}>Plan your events here</p>
      </div>
      {/* <button style={styles.button}>Book Now</button> */}
    </div>
  );
};

const styles = {
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 'auto',
    overflow: 'hidden',
    
  },
  video: {
    width: '100%',
    maxHeight: '500px',
    objectFit: 'cover',
  },
  textOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#fff',
    zIndex: 1,
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '2px 2px 10px rgba(0, 0, 0, 0.7)',
  },
  subtitle: {
    fontSize: '20px',
    marginTop: '10px',
    textShadow: '1px 1px 5px rgba(0, 0, 0, 0.5)',
  },
  button: {
    position: 'absolute',
    bottom: '30px',
    left: '30px',
    padding: '12px 24px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 1,
  },
};

export default HeroBanner;
