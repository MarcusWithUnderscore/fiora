import { useRef } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, user, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, captions } = useChat();

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };
  
  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">AI Companion 💖</h1>
          <p>Hey {user?.name || 'Beautiful'}!</p>
        </div>

        {/* Captions Display */}
        {captions && (
          <div className="caption-box">
            <p>{captions}</p>
          </div>
        )}

        <div className="buttons">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="zoom"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        <div className="customs" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
          <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button 
              onClick={() => {input.current.value = "Tell me a joke"; sendMessage();}} 
              disabled={loading || message}
              className="quick-action-btn"
            >
              😄 Joke
            </button>
            <button 
              onClick={() => {input.current.value = "What can you do?"; sendMessage();}} 
              disabled={loading || message}
              className="quick-action-btn"
            >
              🤔 Help
            </button>
            <button 
              onClick={() => {input.current.value = "Tell me something interesting"; sendMessage();}} 
              disabled={loading || message}
              className="quick-action-btn"
            >
              ⭐ Surprise
            </button>
          </div>
          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
            <input
              className="styled-input"
              placeholder="Type a message..."
              ref={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button
              disabled={loading || message}
              onClick={sendMessage}
              className="styled-button"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

