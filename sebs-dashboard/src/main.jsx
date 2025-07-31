import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";

// Import ThemeProvider
import { ThemeProvider } from "./Contexts/ThemeContext.jsx";

// Import your components
import Root from "./Routes/Root.jsx";
import Dashboard from "./Routes/Dashboard.jsx";
import Settings from "./Routes/Settings.jsx";
import BookingManagement from "./Routes/Management.jsx";
import Reports from "./Routes/Reports.jsx";
import Gallery from "./Routes/Gallery.jsx";
import Login from "./Routes/Login.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Standalone login route without Root layout */}
      <Route path="/login" element={<Login />} />

      {/* Main app routes with Root layout */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="management" element={<Management />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
