import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductsNew from './components/products/ProductsNew';
import ProductsEdit from './components/products/ProductsEdit';
import ProductsCard from './components/products/ProductCard';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import ProductCard from "./components/products/ProductCard"
import GetDash from './pages/GetDash';
import SalaryPage from './pages/SalaryPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmployeePage from './pages/EmployeePage';
import BorrowPage from './pages/BorrowPage';
import ReportPage from './pages/ReportPage';
import ExpendPage from './pages/ExpendPage';

function App() {
  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Navbar />
          <main className="p-6">
            <Routes>
              <Route path='/' element={<GetDash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/products' element={<Products />} />
              <Route path='/products/new' element={<ProductsNew />} />
              <Route path='/products/edit/:id' element={<ProductsEdit />} />
              <Route path='/products/:id' element={<ProductsCard />} />
              <Route path='/sales' element={<Sales />} />
              <Route path='/sales/:id' element={<ProductCard />} />
              <Route path='/customers' element={<Customers />} />
              <Route path="/salaries" element={<SalaryPage />} />
              <Route path="/employee" element={<EmployeePage />} />
              <Route path="/borrow" element={<BorrowPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/expend" element={<ExpendPage />} />
            </Routes>
          </main>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={1000} />
    </>
  );
}

export default App;