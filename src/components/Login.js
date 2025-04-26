import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userRef = collection(db, 'user');
      const q = query(userRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('No user found. Please sign up.');
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  const EyeIcon = ({ visible }) => (
    <div style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
      {visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#333">
          <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#333">
          <path d="M12 6c2.5 0 4.71 1.28 6.18 3.26l1.45-1.45C17.99 5.83 15.16 4 12 4c-4.08 0-7.64 2.43-9.24 6 0.5 1.16 1.21 2.2 2.08 3.06L4.27 15l1.42 1.42 15.56-15.56L19.27 0 0 19.27l1.41 1.41 2.72-2.72C6.3 19.13 9.03 20 12 20c4.08 0 7.64-2.43 9.24-6a10.01 10.01 0 00-1.74-2.9l-1.43 1.43A8.02 8.02 0 0120 12c-1.73-3.89-6-7-11-7a9.94 9.94 0 00-3.26.58l1.43 1.43A7.94 7.94 0 0112 6z"/>
        </svg>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <div style={styles.tabContainer}>
          <h2 style={{ ...styles.tab, borderBottom: '2px solid #003f66' }}>Login</h2>
          <h2 style={{ ...styles.tab, color: '#0077cc', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign up</h2>
        </div>

        <h1 style={styles.heading}>WELCOME</h1>
        <p style={styles.subtext}>Let's get started by filling out the form below.</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...styles.input, paddingRight: '50px' }}
            />
            <EyeIcon visible={showPassword} />
          </div>

          <button type="submit" style={styles.button}>Get Started</button>
        </form>

        <p style={styles.forgot}>Forgot Password?</p>
        <p style={styles.terms}>
          By clicking "Get Started," you agree to Our App<br />
          <strong>Privacy Policy</strong> and <strong>Terms & Conditions</strong>
        </p>
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#e6efff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
    border: '2px solid #003f66',
    textAlign: 'center',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '20px',
  },
  tab: {
    fontSize: '18px',
    fontWeight: '500',
    paddingBottom: '5px',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '10px',
    color: '#003f66',
  },
  subtext: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  input: {
    padding: '15px',
    fontSize: '16px',
    borderRadius: '30px',
    border: '2px solid #003f66',
    backgroundColor: '#e6efff',
    outline: 'none',
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: '15px',
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: '15px',
    fontSize: '16px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#003f66',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
  },
  forgot: {
    marginTop: '10px',
    color: '#333',
    fontWeight: '500',
  },
  terms: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#333',
  },
};

export default Login;
