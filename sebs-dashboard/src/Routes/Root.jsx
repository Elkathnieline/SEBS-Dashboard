import { Outlet } from "react-router-dom";
import Header from "../Components/Header.jsx";
import Sidebar from "../Components/Sidebar.jsx";
import { useTheme } from "../Contexts/ThemeContext.jsx";

export default function Root() {
  const { isDarkTheme } = useTheme();

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkTheme ? 'bg-gray-900' : 'bg-base-100'}`}>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className={`flex-1 overflow-auto ${isDarkTheme ? 'bg-gray-900' : 'bg-base-100'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
