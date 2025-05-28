import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  // CashIcon
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  UserGroupIcon,
  InboxArrowDownIcon,
  PuzzlePieceIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { logout } = useAuth();

  const navigation = [
    { name: 'Панель управления', href: '/dashboard', icon: HomeIcon },
    { name: 'Товары - (склад)', href: '/products', icon: CubeIcon },
    { name: 'Продажи', href: '/sales', icon: ShoppingBagIcon },

    // ...(user?.role === 'admin' ? [
      { name: 'Зарплата сотрудника', href: '/salaries', icon: BanknotesIcon },
      { name: 'Клиенты', href: '/customers', icon: UsersIcon },
      { name: 'Cотрудники', href: '/employee', icon: UserGroupIcon },
      { name: 'Расходы', href: '/expend', icon: CurrencyDollarIcon },
      { name: 'Занимать', href: '/borrow', icon: InboxArrowDownIcon },
      { name: 'Отчёт', href: '/report', icon: PuzzlePieceIcon },
    // ] : [])
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col h-0 flex-1 bg-indigo-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 text-white text-2xl font-bold">
            Управление запасами
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md 
                  ${isActive ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600'}`
                }
              >
                <item.icon className="mr-3 h-6 w-6 text-indigo-300" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
          <button
            onClick={logout}
            className="flex-shrink-0 w-full group block"
          >
            <div className="flex items-center">
              <ArrowLeftOnRectangleIcon className="h-6 w-6 text-indigo-300 mr-3" />
              <span className="text-sm font-medium text-indigo-200 group-hover:text-white">
                Выход
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;