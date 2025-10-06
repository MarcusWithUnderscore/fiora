import './Button.css';

function Button({ text, onClick, color }) {
  return (
    <button 
      className="custom-button" 
      onClick={onClick}
      style={{ backgroundColor: color }}
    >
      {text}
    </button>
  );
}

export default Button;