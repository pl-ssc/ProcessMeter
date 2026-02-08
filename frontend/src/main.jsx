import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import '@glideapps/glide-data-grid/dist/index.css';
import '@glideapps/glide-data-grid-cells/dist/index.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
