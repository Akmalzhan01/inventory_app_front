import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import MainLayout from './components/MainLayout'; // Import MainLayout

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductsNew from './components/products/ProductsNew';
import ProductsEdit from './components/products/ProductsEdit';
import ProductCard from './components/products/ProductCard'; // Standardized ProductCard
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import GetDash from './pages/GetDash';
import SalaryPage from './pages/SalaryPage';
import EmployeePage from './pages/EmployeePage';
import BorrowPage from './pages/BorrowPage';
import ReportPage from './pages/ReportPage';
import ExpendPage from './pages/ExpendPage';

// Removed Sidebar and Navbar imports as they are in MainLayout
// import Navbar from './components/Navbar';
// import Sidebar from './components/Sidebar';


function App() {
  return (
    <>
      <Routes>
        {/* Routes without MainLayout (Sidebar and Navbar) */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Routes with MainLayout (Sidebar and Navbar) */}
        <Route element={<MainLayout />}>
          <Route path='/' element={<GetDash />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/products' element={<Products />} />
          <Route path='/products/new' element={<ProductsNew />} />
          <Route path='/products/edit/:id' element={<ProductsEdit />} />
          <Route path='/products/:id' element={<ProductCard />} /> {/* Using standardized ProductCard */}
          <Route path='/sales' element={<Sales />} />
          {/* The /sales/:id route will be addressed in a later step */}
          <Route path='/customers' element={<Customers />} />
          <Route path='/salaries' element={<SalaryPage />} />
          <Route path='/employee' element={<EmployeePage />} />
          <Route path='/borrow' element={<BorrowPage />} />
          <Route path='/report' element={<ReportPage />} />
          <Route path='/expend' element={<ExpendPage />} />
        </Route>
      </Routes>
      <ToastContainer position='top-right' autoClose={1000} />
    </>
  );
}

export default App;
