import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import {
  BanknotesIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  CubeIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function InventoryReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const months = [
    { id: 1, name: 'Январь' },
    { id: 2, name: 'Февраль' },
    { id: 3, name: 'Март' },
    { id: 4, name: 'Апрель' },
    { id: 5, name: 'Май' },
    { id: 6, name: 'Июнь' },
    { id: 7, name: 'Июль' },
    { id: 8, name: 'Август' },
    { id: 9, name: 'Сентябрь' },
    { id: 10, name: 'Октябрь' },
    { id: 11, name: 'Ноябрь' },
    { id: 12, name: 'Декабрь' }
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/statistic/${year}/${month}`);
      setReportData(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке отчета:', err);
      setError('Не удалось загрузить данные отчета');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [year, month]);

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const handleMonthSelect = (monthId) => {
    setMonth(monthId);
    setShowMonthDropdown(false);
  };

  if (loading && !reportData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Общие продажи',
      value: `${reportData?.sum.sale.totalSale.totalSaleSum?.toLocaleString()} $` || '0 $',
      icon: CurrencyDollarIcon,
      metric: 'Транзакций',
      metricValue: reportData?.salesCount || '0',
      metricIcon: ShoppingBagIcon
    },
    {
      name: 'Оплаченная сумма',
      value: `${reportData?.sum.sale.totalSale.paidAmountSaleSum?.toLocaleString()} $` || '0 $',
      icon: BanknotesIcon,
      metric: 'Полностью оплачено',
      metricValue: reportData?.paidSalesCount || '0',
      metricIcon: CheckCircleIcon
    },
    {
      name: 'Кредит',
      value: `${reportData?.sum.sale.credit?.toLocaleString()} $` || '0 $',
      icon: CreditCardIcon,
      metric: 'В ожидании оплаты',
      metricValue: reportData?.creditSalesCount || '0',
      metricIcon: ClockIcon
    },
    {
      name: 'Общая стоимость товаров',
      value: `${reportData?.sum.products.totalProduct?.toLocaleString()} $` || '0 $',
      icon: CubeIcon,
      metric: 'Единиц на складе',
      metricValue: reportData?.totalItemsInStock || '0',
      metricIcon: ArchiveBoxIcon
    },
    {
      name: 'Расходы на зарплаты',
      value: `${reportData?.sum.salary.totalSalary?.toLocaleString()} $` || '0 $',
      icon: UsersIcon,
      metric: 'Сотрудников',
      metricValue: reportData?.employeesCount || '0',
      metricIcon: UsersIcon
    },
    {
      name: 'Заемные товары',
      value: `${reportData?.sum.borrow.totalItemsSum?.toLocaleString()} $` || '0 $',
      icon: ClipboardDocumentCheckIcon,
      metric: 'Активных займов',
      metricValue: reportData?.activeBorrowsCount || '0',
      metricIcon: ClipboardDocumentCheckIcon
    },

  ];

  const tot = reportData?.sum.sale.totalSale.paidAmountSaleSum - (reportData?.sum.salary.totalSalary + reportData?.sum.borrow.totalBorrowPaidAmount + reportData?.sum.expend.totalExpend)

  return (
    <div className="bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Отчет по инвентаризации</h1>

        <div className="flex space-x-4">
          <div className="relative">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-300">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={year}
                onChange={handleYearChange}
                className="appearance-none bg-transparent pr-8 focus:outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-300"
            >
              <span>{months.find(m => m.id === month)?.name || 'Выберите месяц'}</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>

            {showMonthDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  {months.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMonthSelect(m.id)}
                      className={`block w-full text-left px-4 py-2 text-sm ${month === m.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            {/* <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm flex items-center">
                <stat.metricIcon className="h-4 w-4 text-gray-500 mr-1" aria-hidden="true" />
                <span className="text-gray-500">
                  {stat.metric}: <span className="font-medium">{stat.metricValue}</span>
                </span>
              </div>
            </div> */}
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-6">

        {/* Карточка сводки по продажам */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-500 mr-2" />
              Сводка по продажам
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Общие продажи</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {reportData?.sum.sale.totalSale.totalSaleSum?.toLocaleString() || 0} $
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Оплаченная сумма</p>
                <p className="mt-1 text-xl font-semibold text-green-600">
                  {reportData?.sum.sale.totalSale.paidAmountSaleSum?.toLocaleString() || 0} $
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Кредит</p>
                <p className="mt-1 text-xl font-semibold text-red-600">
                  {reportData?.sum.sale.credit?.toLocaleString() || 0} $
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Карточка сводки по расходом */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-500 mr-2" />
              Сводка по расходом
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Общие расходы</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {(reportData?.sum.salary.totalSalary+reportData?.sum.expend.totalExpend)?.toLocaleString() || 0} $
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Зарплата сотрудников</p>
                <p className="mt-1 text-xl font-semibold text-green-600">
                  {reportData?.sum.salary.totalSalary?.toLocaleString() || 0} $
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Другие расходы</p>
                <p className="mt-1 text-xl font-semibold text-red-600">
                  {reportData?.sum.expend.totalExpend?.toLocaleString() || 0} $
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Карточка сводки по займам */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-500 mr-2" />
              Сводка по займам
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Всего товаров</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {reportData?.sum.borrow.totalItemsSum?.toLocaleString() || 0} $
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Оплаченная сумма</p>
                <p className="mt-1 text-xl font-semibold text-green-600">
                  {reportData?.sum.borrow.totalBorrowPaidAmount?.toLocaleString() || 0} $
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Остаток</p>
                <p className="mt-1 text-xl font-semibold text-yellow-600">
                  {reportData?.sum.borrow.remider?.toLocaleString() || 0} $
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <UsersIcon className="h-5 w-5 text-indigo-500 mr-2" />
            Прибыль от продаж
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <p className={`text-3xl font-semibold ${tot < 0 ? "text-red-600": "text-green-600"} text-gray-900`}>
              {tot?.toLocaleString() || 0} $
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Общие ежемесячные прибыли от продаж
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}