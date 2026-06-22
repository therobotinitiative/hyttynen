import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { HyttynenProvider } from './context/HyttynenProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <HyttynenProvider>
      <App />
    </HyttynenProvider>
);
