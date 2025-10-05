import { useState, useEffect } from 'react';
import './LandingPage.css';
import Button from './Button';

function LandingPage({ onEnter }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a small delay for animation effect
    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <div className="landing-page">
      {/* Animated flowers in background */}
      <div className="flowers-container">
        <div className="flower flower-1">🌸</div>
        <div className="flower flower-2">🌺</div>
        <div className="flower flower-3">🌼</div>
        <div className="flower flower-4">🌷</div>
        <div className="flower flower-5">🌹</div>
        <div className="flower flower-6">🌸</div>
      </div>

      {/* Main content */}
      <div className={`landing-content ${showContent ? 'show' : ''}`}>
        <h1 className="main-title">For You 💖</h1>
        <p className="subtitle">A little something I made just for you</p>
        <p className="description">
          Track your habits, build routines, and grow every day.<br/>
          With a little help from AI 🌟
        </p>
        
        <Button 
          text="Let's Begin ✨" 
          onClick={onEnter}
          color="#FF6B9D"
        />
      </div>

      {/* Floating hearts */}
      <div className="hearts-container">
        <span className="heart heart-1">💕</span>
        <span className="heart heart-2">💖</span>
        <span className="heart heart-3">💗</span>
      </div>
    </div>
  );
}

export default LandingPage;