import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import ErrorPage from "./ErrorPage.jsx";

import Root from "./routes/root.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
      <Route path="*" element={<ErrorPage />} />
      <ProtectedRoute requireAdmin={true}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
      </ProtectedRoute>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
