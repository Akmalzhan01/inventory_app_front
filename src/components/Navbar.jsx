import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-800">
            Управление запасами
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
              <div className='w-8 h-8 bg-indigo-300 rounded-3xl flex justify-center items-center border border-indigo-600'>
                <span className="text-gray-600 font-bold">{user.name[0]}</span>
              </div>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
                  {/* Chiqish */}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-800">
                  Вход
                </Link>
                <Link to="/register" className="text-gray-600 hover:text-gray-800">
                 Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;