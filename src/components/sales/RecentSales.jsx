import React from 'react';
import { format } from 'date-fns';
import { CurrencyDollarIcon, CreditCardIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const RecentSales = ({ sales, loading, limit = 5 }) => {
  // Agar yuklanayotgan bo'lsa
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Последние продажи</h2>
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex justify-between items-center animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
                </div>
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Agar sotuvlar bo'sh bo'lsa
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Последние продажи</h2>
        <div className="text-center py-6 text-gray-500">
          <p>Продаж пока нет.</p>
        </div>
      </div>
    );
  }

  // Limit qo'llash
  
  const recentSales = sales.data.slice(0, limit);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Последние продажи</h2>
        <Link to="/sales" className="text-sm text-blue-500 hover:underline">
        Смотреть все
        </Link>
      </div>

      <div className="space-y-4">
        {recentSales.map((sale) => (
          <div key={sale._id} className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                sale.isCredit ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
              }`}>
                {sale.isCredit ? (
                  <CreditCardIcon className="h-5 w-5" />
                ) : (
                  <CurrencyDollarIcon className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="font-medium">
                  {sale.customer?.name || 'Клиент не вошел в систему'}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(sale.saleDate), 'dd.MM.yyyy HH:mm')}
                </div>
              </div>
            </div>
            <div className={`font-medium ${
              sale.isCredit && sale.paidAmount < sale.total ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {sale.total.toLocaleString()} $
              {sale.isCredit && sale.paidAmount < sale.total && (
                <span className="block text-xs text-gray-500 text-right">
                  Оплаченный: {sale.paidAmount.toLocaleString()} $
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSales;