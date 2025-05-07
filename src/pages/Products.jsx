import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import ProductTable from '../components/products/ProductTable';
import Pagination from '../components/common/Pagination';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Tovarlarni yuklash
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // LocalStorage'dan tokenni olish
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Токен авторизации не найден');
        }
  
        // Token bilan so'rov yuborish
        const { data } = await axios.get('https://inventory-app-theta-two.vercel.app/api/products', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        // Ma'lumotlarni tekshirish
        if (!data) {
          throw new Error('Данные не возвращены');
        }
  
        setProducts(Array.isArray(data) ? data : data.products || data.data || []);
        
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        
        // Agar 401 xatosi bo'lsa, foydalanuvchini chiqarib yuborish
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Сессия истекла. Пожалуйста, войдите в систему снова.');
        } else {
          toast.error(error.response?.data?.message || 'Ошибка загрузки товаров');
        }
        
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);

  

  // Tovarni o'chirish
  const deleteProduct = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      try {
        await axios.delete(`https://inventory-app-theta-two.vercel.app/api/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
        toast.success('Продукт успешно удален.');
      } catch (error) {
        toast.error('Ошибка удаления элемента');
      }
    }
  };

  // Qidiruv natijalari
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination hisoblash
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Товары - {products.length}</h1>
        {user?.role === 'admin' && (
          <Link 
            to="/products/new" 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Добавить новый продукт
          </Link>
        )}
      </div>

      {/* <SearchBar 
        placeholder="Поиск товаров..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='mb-8'
      /> */}

      <ProductTable 
        products={currentProducts} 
        loading={loading} 
        onDelete={deleteProduct} 
        userRole={user?.role}
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Products;