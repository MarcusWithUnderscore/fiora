import React, { useState } from 'react';
import Button from '../components/Button';
import { login } from '../services/api';
import './Auth.css';

/**
 * Login component handles user authentication via email and password.
 * @param {object} props - Component props.
 * @param {function} props.onLogin - Callback function to be executed upon successful login.
 */
function Login({ onLogin }) {
  // --- State Management ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Renamed 'loading' to 'isLoading' for clarity

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error and set loading state
    setError('');
    setIsLoading(true);

    try {
      // 1. Call the API
      const data = await login(email, password);
      
      // 2. Save token
      localStorage.setItem('token', data.token);
      
      // 3. Notify parent component
      onLogin(data.user);

    } catch (err) {
      // Handle login failure
      // Accessing response message if available, otherwise use a generic error
      const errorMessage = err.response?.data?.message || 'Login failed 💔. Please check your credentials.';
      setError(errorMessage);
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };
  
  // --- Render ---
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Welcome Back 💖</h2>
        {error && <p className="error-message" role="alert">{error}</p>} {/* Added role="alert" for accessibility */}
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label> {/* Added explicit label for accessibility */}
          <input
            id="email" // Linked label and input via 'id'
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          
          <label htmlFor="password">Password</label> {/* Added explicit label for accessibility */}
          <input
            id="password" // Linked label and input via 'id'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          
          {/* Note: The Button onClick handler is redundant here as the form onSubmit handles the submission. 
              We rely on the <button type="submit"> behavior within the Button component (assuming it renders one). */}
          <Button 
            type="submit" // Ensure the Button component is configured to render a submit button
            text={isLoading ? "Logging in..." : "Login ✨"} 
            color="#FF6B9D"
            disabled={isLoading} // Added disabled prop to button for clarity/safety
          />
        </form>
      </div>
    </div>
  );
}

export default Login;