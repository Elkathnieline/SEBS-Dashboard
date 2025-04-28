import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Footer from "../components/Footer.jsx";

export default function Root() {
  return (
    <>
      <div className="h-screen flex flex-col items-center justify-center">
        <Header />
        <Sidebar />
        <Outlet />
        <Footer />
      </div>
    </>
  );
}
