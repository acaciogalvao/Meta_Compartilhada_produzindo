import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, PlusCircle, User } from 'lucide-react';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative pb-20 flex flex-col">
        <header className="bg-indigo-600 text-white p-4 shadow-md sticky top-0 z-10">
          <h1 className="text-xl font-bold text-center">Meta Compartilhada</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center h-16 z-10">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'
              }`
            }
          >
            <Home size={24} />
            <span className="text-xs mt-1">Início</span>
          </NavLink>
          
          <NavLink
            to="/new"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'
              }`
            }
          >
            <PlusCircle size={24} />
            <span className="text-xs mt-1">Nova Meta</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'
              }`
            }
          >
            <User size={24} />
            <span className="text-xs mt-1">Perfil</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
