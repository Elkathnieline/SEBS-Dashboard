import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import './App.css'

// Import ThemeProvider
import { ThemeProvider } from './Contexts/ThemeContext.jsx'

// Import your components
import Root from './Routes/Root.jsx'
import Dashboard from './Routes/Dashboard.jsx'
import Settings from './Routes/Settings.jsx'
import BookingManagement from './Routes/Management.jsx'
import Reports from './Routes/Reports.jsx'
import Gallery from './Routes/Gallery.jsx'
import Login from './Routes/Login.jsx'

// Error Boundary Component
function ErrorPage() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-error mb-4">404</h1>
        <p className="text-lg text-base-content/60 mb-6">Page not found</p>
        <a href="/" className="btn btn-primary">
          Go Home
        </a>
      </div>
    </div>
  );
}

// Create router with proper error handling
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "management",
        element: <BookingManagement />
      },
      {
        path: "reports",
        element: <Reports />
      },
      {
        path: "gallery",
        element: <Gallery />
      },
      {
        path: "settings",
        element: <Settings />
      }
    ]
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "*",
    element: <ErrorPage />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
