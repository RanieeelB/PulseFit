import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Mute specific benign extension errors (Common Chromium issue with React DevTools / Other extensions)
const originalConsoleError = console.error;
console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('A listener indicated an asynchronous response by returning true, but the message channel closed')) {
        return; // Ignore this specific benign error
    }
    originalConsoleError(...args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
