import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Import ThemeProvider
import { ThemeProvider } from "./Contexts/ThemeContext.jsx";


import Root from "./Routes/Root.jsx";
import Dashboard from "./Routes/Dashboard.jsx";
import Settings from "./Routes/Settings.jsx";
import Management, { loader as managementLoader, action as managementAction } from "./Routes/Management.jsx";
import Reports from "./Routes/Reports.jsx";
import Gallery from "./Routes/Gallery.jsx";
import RequireAuth from "./Components/Security/requireAuth.jsx";
import Login from "./Routes/Login.jsx";
import ErrorPage from "./ErrorPage.jsx";
import Services from "./Routes/Services.jsx";
import { AuthProvider } from "./Contexts/AuthContext.jsx";


const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <Root />, 
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "gallery", element: <Gallery /> },
          { path: "management", element: <Management />, loader: managementLoader, action: managementAction, errorElement: <ErrorPage /> },
          { path: "reports", element: <Reports /> },
          { path: "services", element: <Services /> },
          { path: "settings", element: <Settings /> },
          { path: "*", element: <ErrorPage /> },
        ],
      },
    ],
  },
]);


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
      <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
