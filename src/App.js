import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Leva } from 'leva';
import './App.css';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { ChatProvider } from './hooks/useChat';
import FloatingFlowers from './components/FloatingFlowers';


function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleEnter = () => {
    setCurrentPage('login');
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentPage('avatar');
  };

  // Landing page
  if (currentPage === 'landing') {
    return <LandingPage onEnter={handleEnter} />;
  }

  // Login page
  if (currentPage === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  // Avatar/AI Companion page
  if (currentPage === 'avatar' && isLoggedIn) {
    return (
      <ChatProvider>
        <Loader />
        <Leva hidden/>
        <UI user={user} />
        <Canvas shadows camera={{ position: [0, 0, 0], fov: 40 }}>
          <Experience />
        </Canvas>
         <FloatingFlowers/>
      </ChatProvider>
      
    );
  }

  return <div>Something went wrong...</div>;
}

export default App;