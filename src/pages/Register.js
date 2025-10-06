import { useState } from 'react';
import Button from '../components/Button';
import './Auth.css';

function Register({ onRegister, switchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register:', name, email, password);
    onRegister();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account 🌸</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button text="Register" onClick={handleSubmit} color="#FF6B9D" />
        </form>
        <p className="switch-auth">
          Already have an account? 
          <span onClick={switchToLogin}> Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;