import { createContext, useContext, useEffect, useState, useRef } from "react";

import { getCurrentUser } from '../services/api';

const data = await getCurrentUser();
const userName = data.name; 


const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [captions, setCaptions] = useState("");
  
  const mountedRef = useRef(true);
  const chatIdRef = useRef(`chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const senderRef = useRef("User");

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const convertBase64ToAudio = async (base64Audio) => {
    try {
      if (base64Audio.startsWith('data:')) {
        return base64Audio;
      }
      
      if (!base64Audio || base64Audio.length === 0) {
        console.warn('Empty or invalid base64 audio');
        return null;
      }
      
      return `data:audio/mpeg;base64,${base64Audio}`;
    } catch (err) {
      console.error('Audio conversion error:', err);
      return null;
    }
  };

  const generateLipsync = (duration) => {
    const mouthCues = [];
    const phonemes = ['A', 'E', 'I', 'O', 'U'];
    const step = 0.1;
    
    for (let t = 0; t < duration; t += step) {
      mouthCues.push({
        start: t,
        end: t + step,
        value: phonemes[Math.floor(Math.random() * phonemes.length)]
      });
    }
    
    return { mouthCues };
  };

  const generateLipsyncFromAudio = (audioBase64, text) => {
    return new Promise((resolve) => {
      const audio = new Audio(audioBase64);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        const words = text.split(/\s+/);
        const mouthCues = [];
        const phonemes = ['A', 'E', 'I', 'O', 'U'];
        
        const timePerWord = duration / words.length;
        
        words.forEach((word, index) => {
          const startTime = index * timePerWord;
          const endTime = startTime + timePerWord;
          
          const phonemesPerWord = Math.max(2, Math.ceil(timePerWord / 0.15));
          const timePerPhoneme = timePerWord / phonemesPerWord;
          
          for (let i = 0; i < phonemesPerWord; i++) {
            mouthCues.push({
              start: startTime + (i * timePerPhoneme),
              end: startTime + ((i + 1) * timePerPhoneme),
              value: phonemes[Math.floor(Math.random() * phonemes.length)]
            });
          }
        });
        
        resolve({ mouthCues });
      });
      
      audio.addEventListener('error', () => {
        console.error('Failed to load audio for lipsync generation');
        const estimatedDuration = estimateAudioDuration(text);
        resolve(generateLipsync(estimatedDuration));
      });
    });
  };

  const estimateAudioDuration = (text) => {
    const words = text.split(/\s+/).length;
    const duration = (words / 100) * 60;
    return Math.max(duration, 2);
  };

  const displayCaptionsWordByWord = (text, duration) => {
    const words = text.split(/\s+/);
    const delayPerWord = (duration * 600) / words.length;
    
    let currentText = "";
    words.forEach((word, index) => {
      setTimeout(() => {
        if (!mountedRef.current) return;
        currentText += (index > 0 ? " " : "") + word;
        setCaptions(currentText);
        
        if (index === words.length - 1) {
          setTimeout(() => {
            if (!mountedRef.current) return;
            setCaptions("");
          }, delayPerWord);
        }
      }, index * delayPerWord);
    });
  };

  const chat = async (text) => {
    if (!text || loading) {
      console.warn('Cannot send message - empty text or already loading');
      return;
    }
    
    setLoading(true);
    setCaptions("");
    
    try {
      console.log('Sending message to API:', text);
      
      const response = await fetch('https://lovewithunderscore.onrender.com/cortex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          sender: userName,
          chatId: chatIdRef.current
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received from API:', data);
      
      if (!mountedRef.current) return;

      // Extract text response
      const textResponse = data.text || data.response || "";
      const cleanText = textResponse.replace(/<[^>]+>/g, '').trim();
      
      // Display captions
      const estimatedDuration = estimateAudioDuration(cleanText);
      displayCaptionsWordByWord(cleanText, estimatedDuration);

      // Process audio
      let audioBase64 = null;
      if (data.audioBase64) {
        console.log('Processing audio, length:', data.audioBase64.length);
        audioBase64 = await convertBase64ToAudio(data.audioBase64);
        console.log('Audio data URL created:', audioBase64 ? 'Success' : 'Failed');
      } else {
        console.warn('No audioBase64 in response');
      }

      // Generate lipsync
      const lipsync = await generateLipsyncFromAudio(audioBase64, cleanText);

      // Get emotion and body language from Gemini function call
      const detectedEmotion = data.emotion || 'smile';
      const bodyLanguageCues = data.bodyLanguage || [];
      
      console.log('Gemini Function Call Results:');
      console.log('  Emotion:', detectedEmotion);
      console.log('  Body Language:', bodyLanguageCues);
      console.log('  Reasoning:', data.emotionReasoning);

      // Create AI message with Gemini's emotion data
      const aiMessage = {
        text: cleanText,
        audio: audioBase64,
        lipsync: lipsync,
        facialExpression: detectedEmotion,
        bodyLanguageCues: bodyLanguageCues,
        animation: "Talking"
      };

      console.log('Message ready:', {
        hasText: !!aiMessage.text,
        hasAudio: !!aiMessage.audio,
        hasLipsync: !!aiMessage.lipsync,
        mouthCuesCount: aiMessage.lipsync?.mouthCues?.length,
        emotion: detectedEmotion,
        bodyLanguage: bodyLanguageCues
      });

      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);

    } catch (error) {
      console.error('Error calling API:', error);
      
      if (!mountedRef.current) return;
      
      const errorMessage = {
        text: "I'm currently unavailable. Please try again later.",
        audio: null,
        lipsync: null,
        facialExpression: "sad",
        bodyLanguageCues: [],
        animation: "Idle"
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
      setCaptions("");
    }
  };

  const onMessagePlayed = () => {
    setMessages(msgs => msgs.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        captions,
        setCaptions
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};