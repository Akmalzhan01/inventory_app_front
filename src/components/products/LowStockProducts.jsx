import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/outline';

const LowStockProducts = ({ products, loading, limit = 5 }) => {
  // Agar yuklanayotgan bo'lsa
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
          Низкие запасы
        </h2>
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-200 rounded-md mr-3"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded mt-1"></div>
                </div>
              </div>
              <div className="h-4 w-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Agar tovarlar bo'sh bo'lsa
  if (!products.data || products.data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
          Низкие запасы
        </h2>
        <div className="text-center py-6 text-gray-500">
          <p>Нет продуктов!</p>
          <button className="mt-2 inline-flex items-center text-blue-500 hover:text-blue-700">
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Обновить
          </button>
        </div>
      </div>
    );
  }

  // Limit qo'llash va saralash (eng kam qolganlar birinchi bo'lishi uchun)
  const sortedProducts = [...products.data]
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, limit);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
          Низкий запасы
        </h2>
        <Link 
          to="/products" 
          className="text-sm text-blue-500 hover:underline"
        >
          Смотреть все
        </Link>
      </div>

      <div className="space-y-3">
        {sortedProducts.map((product) => (
          <Link 
            key={product._id} 
            className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-red-100 h-10 w-10 rounded-md flex items-center justify-center mr-3">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-10 w-10 object-cover rounded-md"
                    />
                  ) : (
                    <span className="text-xs text-red-400">
                      <PhotoIcon className='w-8  h-8 text-red-800' />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium line-clamp-1">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-medium ${
                  product.quantity <= 0 ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {product.quantity} шт.
                </span>
                <span className="text-xs text-gray-500">
                  Мин.: {product.minQuantity} шт.
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LowStockProducts;