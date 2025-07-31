import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import ErrorPage from "./ErrorPage.jsx";

import Root from "./Routes/Root.jsx";
import RequireAuth from "./Components/Security/requireAuth.jsx";
import Login from "./Routes/Login.jsx";
import Dashboard from "./Routes/Dashboard.jsx";
import Settings from "./Routes/Settings.jsx";
import Gallery from "./Routes/Gallery.jsx";
import Management from "./Routes/Management.jsx";
import Reports from "./Routes/Reports.jsx";

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
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
