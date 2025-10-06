import { useState } from 'react';
import Button from '../components/Button';
import { login } from '../services/api';
import './Auth.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Pass user data to parent
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed 💔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Welcome Back 💖</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button 
            text={loading ? "Logging in..." : "Login ✨"} 
            onClick={handleSubmit} 
            color="#FF6B9D" 
          />
        </form>
      </div>
    </div>
  );
}

export default Login;