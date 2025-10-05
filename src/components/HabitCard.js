import { useState } from 'react';
import './HabitCard.css';

function HabitCard({ habit, onComplete }) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleClick = () => {
    setIsCompleted(!isCompleted);
    onComplete(habit.id, !isCompleted);
  };

  return (
    <div 
      className={`habit-card ${isCompleted ? 'completed' : ''}`}
      style={{ borderColor: habit.color }}
    >
      <div className="habit-info">
        <div className="habit-icon" style={{ backgroundColor: habit.color }}>
          {habit.icon || '✨'}
        </div>
        <div className="habit-details">
          <h3>{habit.name}</h3>
          <p>{habit.description}</p>
        </div>
      </div>
      
      <button 
        className={`check-button ${isCompleted ? 'checked' : ''}`}
        onClick={handleClick}
        style={{ 
          backgroundColor: isCompleted ? habit.color : 'transparent',
          borderColor: habit.color 
        }}
      >
        {isCompleted && '✓'}
      </button>
    </div>
  );
}

export default HabitCard;