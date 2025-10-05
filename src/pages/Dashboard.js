import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import HabitCard from '../components/HabitCard';
import Button from '../components/Button';
import './Dashboard.css';

function Dashboard({ user }) {
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: 'Morning Exercise',
      description: 'Start the day with 20 min workout',
      color: '#FF6B9D',
      icon: '💪'
    },
    {
      id: 2,
      name: 'Drink Water',
      description: '8 glasses throughout the day',
      color: '#4ECDC4',
      icon: '💧'
    },
    {
      id: 3,
      name: 'Study Networking',
      description: '1 hour of focused study',
      color: '#95E1D3',
      icon: '📚'
    }
  ]);

  const [showLoveNote, setShowLoveNote] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [completedToday, setCompletedToday] = useState(0);

  // Love notes that randomly appear
  const loveNotes = [
    "You're doing amazing! 💖",
    "I'm so proud of you! 🌟",
    "Keep going, you're incredible! ✨",
    "Every step counts, beautiful! 💕",
    "You inspire me every day! 🌸",
    "Look at you crushing it! 🔥"
  ];

  // Show random love note on mount
  useEffect(() => {
    const randomNote = loveNotes[Math.floor(Math.random() * loveNotes.length)];
    setCurrentNote(randomNote);
    setShowLoveNote(true);
    
    const timer = setTimeout(() => setShowLoveNote(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleHabitComplete = (habitId, completed) => {
    console.log(`Habit ${habitId} completed:`, completed);
    
    if (completed) {
      // Confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B9D', '#4ECDC4', '#95E1D3', '#FFB6C1']
      });
      
      setCompletedToday(prev => prev + 1);
      
      // Show encouragement
      const encouragements = [
        "YES! That's my girl! 🎉",
        "Amazing work! 💪",
        "You're unstoppable! 🌟",
        "Proud of you! ✨"
      ];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      setCurrentNote(randomEncouragement);
      setShowLoveNote(true);
      setTimeout(() => setShowLoveNote(false), 3000);
    }
  };

  return (
    <div className="dashboard">
      {/* Floating flowers background */}
      <div className="flowers-bg">
        <div className="flower-float flower-1">🌸</div>
        <div className="flower-float flower-2">🌺</div>
        <div className="flower-float flower-3">🌼</div>
        <div className="flower-float flower-4">💐</div>
        <div className="flower-float flower-5">🌷</div>
      </div>

      {/* Floating hearts */}
      <div className="hearts-bg">
        <span className="heart-float heart-1">💕</span>
        <span className="heart-float heart-2">💖</span>
        <span className="heart-float heart-3">💗</span>
      </div>

      {/* Love note popup */}
      {showLoveNote && (
        <div className="love-note">
          {currentNote}
        </div>
      )}

      <header className="dashboard-header">
        <h1>Hey {user?.name || 'Beautiful'} 🌟</h1>
        <p>Let's make today amazing!</p>
        <div className="streak-counter">
          🔥 {completedToday} habits completed today!
        </div>
      </header>

      <div className="habits-container">
        <div className="habits-header">
          <h2>Today's Habits</h2>
          <div className="header-buttons">
            <Button 
              text="+ Add Habit" 
              color="#FF6B9D"
              onClick={() => console.log('Add habit')}
            />
            <Button 
              text="🤖 Talk to AI" 
              color="#9B59B6"
              onClick={() => window.location.href = '/ai-companion'}
            />
          </div>
        </div>

        <div className="habits-list">
          {habits.map(habit => (
            <HabitCard 
              key={habit.id}
              habit={habit}
              onComplete={handleHabitComplete}
            />
          ))}
        </div>

        {habits.length === 0 && (
          <p className="empty-message">
            No habits yet! Click "Add Habit" to get started 💖
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;