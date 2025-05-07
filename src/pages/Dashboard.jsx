import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import StatsCard from '../components/common/StatsCard';
import RecentSales from '../components/sales/RecentSales';
import LowStockProducts from '../components/products/LowStockProducts';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockItems: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsRes, salesRes, productsRes] = await Promise.all([
          axios.get('https://inventory-app-theta-two.vercel.app/api/stats'),
          axios.get('https://inventory-app-theta-two.vercel.app/api/sales/recent'),
          axios.get('https://inventory-app-theta-two.vercel.app/api/low-stock')
        ]);
        
        // Ma'lumotlarni tekshirish va to'g'ri formatga keltirish
        const statsData = statsRes.data || {};
        const salesData =  salesRes.data || [];
        const productsData = productsRes.data || [];
        
        setStats({
          totalProducts: statsData.data.totalProducts || 0,
          totalSales: statsData.data.totalSales || 0,
          totalRevenue: statsData.data.totalRevenue || 0,
          lowStockItems: statsData.data.lowStockItems || productsData.length || 0
        });
        
        setRecentSales(salesData);
        setLowStockProducts(productsData);
      } catch (err) {
        console.error('Dashboard data error:', err);
        setError(err.response?.data?.message || 'Ошибка загрузки данных.');
        toast.error(err.response?.data?.message || 'Ошибка загрузки данных.');
        // Xato paytida default qiymatlar
        setRecentSales([]);
        setLowStockProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  

  // Xavfsiz grafik ma'lumotlari
  const getCategoryData = () => {
    const safeProducts = Array.isArray(lowStockProducts.data) ? lowStockProducts.data : [];
    const categories = safeProducts.reduce((acc, product) => {
      if (product.category && !acc.includes(product.category)) {
        acc.push(product.category);
      }
      return acc;
    }, []);

    return {
      labels: categories.length > 0 ? categories : ['No data'],
      datasets: [
        {
          data: categories.map(cat => 
            safeProducts.filter(p => p.category === cat).length
          ),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getSalesData = () => {
    const safeSales = Array.isArray(recentSales.data) ? recentSales.data : [];
    return {
      labels: safeSales.length > 0 
        ? safeSales.map(sale => 
            sale.date ? new Date(sale.date).toLocaleDateString() : 'No date'
          )
        : ['No data'],
      datasets: [
        {
          label: 'Объем продаж ($)',
          data: safeSales.length > 0 
            ? safeSales.map(sale => sale.amount || 0)
            : [0],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <p>Попробуйте еще раз.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-800">Панель инструментов</h1>
      
      {/* Statistik kartalar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Всего продуктов" 
          value={loading ? '...' : stats.totalProducts} 
          icon="📦" 
          color="bg-blue-100 text-blue-800"
          loading={loading}
        />
        <StatsCard 
          title="Общий объем продаж" 
          value={loading ? '...' : stats.totalSales} 
          icon="💰" 
          color="bg-green-100 text-green-800"
          loading={loading}
        />
        <StatsCard 
          title="Общий доход" 
          value={loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`} 
          icon="💵" 
          color="bg-purple-100 text-purple-800"
          loading={loading}
        />
        <StatsCard 
          title="Низкий резерв" 
          value={loading ? '...' : stats.lowStockItems} 
          icon="⚠️" 
          color="bg-yellow-100 text-yellow-800"
          loading={loading}
        />
      </div>

      {/* Grafiklar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Последние продажи</h2>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <Bar 
                data={getSalesData()}
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Категории продуктов</h2>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <Pie 
                data={getCategoryData()}
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Jadval va ro'yxatlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Последние 10 продаж</h2>
          <RecentSales sales={recentSales} loading={loading} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Дефицитные продукты</h2>
          <LowStockProducts products={lowStockProducts} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;