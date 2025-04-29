import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="bg-gray-800 text-white w-64 h-full hidden lg:block">
            <div className="p-4">
                <h2 className="text-lg font-bold">SEBS Dashboard</h2>
            </div>
            <nav className="mt-4">
                <ul>
                    <li className="p-2 hover:bg-gray-700">
                        <NavLink to="/" className={({isActive}) => isActive ? "font-bold" : ""}>Home</NavLink>
                    </li>
                    <li className="p-2 hover:bg-gray-700">
                        <NavLink to="/about" className={({isActive}) => isActive ? "font-bold" : ""}>About</NavLink>
                    </li>
                    <li className="p-2 hover:bg-gray-700">
                        <NavLink to="/contact" className={({isActive}) => isActive ? "font-bold" : ""}>Contact</NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
}