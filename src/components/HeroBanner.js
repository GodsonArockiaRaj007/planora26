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
    </div>
  );
};

const styles = {
  bannerContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    margin: 0,            // remove all margins
    padding: 0,           // remove all padding
    marginTop: '0px',    // small gap at top
    marginBottom: '0',    // remove bottom gap
  },
  video: {
    display: 'block',     // eliminate inline-bottom whitespace
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
};

export default HeroBanner;
