import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import SaleForm from '../components/sales/SaleForm';
import SaleTable from '../components/sales/SaleTable';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Ma'lumotlarni yuklash
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // LocalStorage'dan tokenni olish
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Токен авторизации не найден');
        }

        // Barcha API so'rovlarini bir vaqtda yuborish
        const [salesRes, productsRes, customersRes] = await Promise.all([
          axios.get('/api/sales'),
          axios.get('/api/products', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get('/api/customers', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        // Ma'lumotlarni tekshirish va o'rnatish
        setSales(salesRes.data?.data || salesRes.data || []);
        setProducts(productsRes.data?.data || productsRes.data || []);
        setCustomers(customersRes.data?.data || customersRes.data || []);

      } catch (error) {
        console.error('Ошибка загрузки данных:', error);

        // Agar 401 xatosi bo'lsa
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Сессия истекла. Пожалуйста, войдите в систему снова.');
        } else {
          toast.error(error.response?.data?.message || 'Ошибка загрузки данных.');
        }

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // Yangi sotuv qo'shish
  const addSale = async (saleData) => {
    try {
      const { data } = await axios.post('/api/sales', saleData);
      setSales([data, ...sales]);
      setShowForm(false);
      toast.success('Продажа успешно добавлена');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка добавления продажи');
    }
  };

  // Sotuvni bekor qilish
  const cancelSale = async (id) => {
    if (window.confirm('Подтверждаете ли вы отмену этой продажи?')) {
      try {
        await axios.delete(`/api/sales/${id}`);
        setSales(sales.filter(sale => sale._id !== id));
        toast.success('Распродажа отменена');
      } catch (error) {
        toast.error('Ошибка отмены продажи');
      }
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold text-gray-800">Продажи - {sales.count}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showForm ? 'Список продаж' : 'Новая продажа'}
        </button>
      </div>
      {showForm ? (
        <SaleForm
          products={products}
          customers={customers}
          onSubmit={addSale}
          onCancel={() => setShowForm(false)}
          setShowForm={setShowForm}
        />
      ) : (
        <>
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard 
              title="Общий продаж" 
              value={sales.length} 
              icon="💰" 
              color="bg-blue-100 text-blue-800"
            />
            <StatsCard 
              title="Продажи за наличные" 
              // value={sales.sales.filter(s => !s.isCredit).length} 
              icon="💵" 
              color="bg-green-100 text-green-800"
            />
            <StatsCard 
              title="Кредитная продажи" 
              // value={sales.filter(s => s.isCredit).length} 
              icon="📝" 
              color="bg-purple-100 text-purple-800"
            />
          </div> */}
          <SaleTable
            sales={sales}
            loading={loading}
            onCancel={cancelSale}
          />
        </>
      )}
    </div>
  );
};

export default Sales;