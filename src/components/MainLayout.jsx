import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar />
      <div className='flex-1 overflow-auto'>
        <Navbar />
        <main className='p-6'>
          <Outlet /> {/* Nested routes will render here */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
