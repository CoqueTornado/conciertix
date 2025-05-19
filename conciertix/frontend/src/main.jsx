// Import core React and ReactDOM libraries.
import React from 'react'
import ReactDOM from 'react-dom/client'

// Import the main application component.
import App from './App.jsx'

// Import global CSS styles.
import './index.css' // Vite's default global styles, often used for resets or base styling.
// Note: App.css is imported within App.jsx, so it's not needed here directly.

// Import BrowserRouter for client-side routing.
import { BrowserRouter } from 'react-router-dom';

// Import AuthProvider to make authentication context available throughout the app.
import { AuthProvider } from './context/AuthContext.jsx';

/**
 * Entry point of the React application.
 * This file is responsible for rendering the root component (<App />) into the DOM.
 * It also wraps the application with necessary providers like BrowserRouter for routing
 * and AuthProvider for authentication state management.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode helps with identifying potential problems in an application.
  // It activates additional checks and warnings for its descendants.
  <React.StrictMode>
    {/* BrowserRouter provides routing capabilities to the application. */}
    <BrowserRouter>
      {/* AuthProvider makes authentication context (e.g., user login status)
          available to all components within the App. */}
      <AuthProvider>
        {/* The main App component which contains all other components and routes. */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
