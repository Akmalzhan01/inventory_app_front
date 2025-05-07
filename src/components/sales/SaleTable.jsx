import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  ArrowPathIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  XMarkIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const SaleTable = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const salesPerPage = 10;

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/sales");
      setSales(response.data.sales);
    } catch (error) {
      toast.error('Ошибка загрузки продаж');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Функции модального окна
  const openModal = (sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
  };

  // Отмена продажи
  const cancelSale = async (saleId) => {
    if (!window.confirm('Вы уверены, что хотите отменить продажу?')) return;

    try {
      setLoading(true);
      await axios.delete(`/api/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSales(sales.filter(sale => sale._id !== saleId));
      toast.success('Продажа успешно отменена');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка отмены продажи');
    } finally {
      setLoading(false);
    }
  };

  // Оплата долга
  const payDebt = async (saleId) => {
    const amount = prompt('Введите сумму платежа (в $):');
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.warning('Введена некорректная сумма');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put(
        `/api/sales/${saleId}/pay`,
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSales(sales.map(sale => 
        sale._id === saleId ? data : sale
      ));
      toast.success(`${amount} $. успешно оплачено`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка платежа');
    } finally {
      setLoading(false);
    }
  };

  // Печать
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Продажа №${selectedSale._id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Продажа №${selectedSale._id.slice(-6).toUpperCase()}</h1>
          <p><strong>Дата:</strong> ${format(new Date(selectedSale.saleDate), 'dd.MM.yyyy HH:mm')}</p>
          <p><strong>Клиент:</strong> ${selectedSale.customer?.name || 'Неизвестный клиент'}</p>
          <p><strong>Тип оплаты:</strong> ${selectedSale.isCredit ? 'Кредит' : 'Наличные'}</p>
          
          <h3>Товары:</h3>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Наименование</th>
                <th>Количество</th>
                <th>Цена ($)</th>
                <th>Сумма ($)</th>
              </tr>
            </thead>
            <tbody>
              ${selectedSale.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product?.name || 'Товар'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toLocaleString()}</td>
                  <td>${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">Итого:</td>
                <td>${selectedSale.total.toLocaleString()} $</td>
              </tr>
              ${selectedSale.isCredit ? `
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;">Оплачено:</td>
                  <td>${selectedSale.paidAmount.toLocaleString()} $</td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;">Остаток:</td>
                  <td>${(selectedSale.total - selectedSale.paidAmount).toLocaleString()} $</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          
          ${selectedSale.notes ? `
            <div style="margin-top: 20px;">
              <h3>Примечание:</h3>
              <p>${selectedSale.notes}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Дата печати: ${format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
            <p>Пользователь: ${user?.name || 'Система'}</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Пагинация
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = sales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(sales.length / salesPerPage);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товары</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSales.map((sale) => (
              <tr key={sale._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(sale.saleDate), 'dd.MM.yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sale.customer?.name || 'Неизвестный клиент'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {sale.items.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {item.product?.name || 'Товар'} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sale.total.toLocaleString()} $
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sale.isCredit ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.paidAmount >= sale.total ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.paidAmount >= sale.total ? (
                        <>
                          <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                          Оплачено
                        </>
                      ) : (
                        <>
                          <CreditCardIcon className="h-3 w-3 mr-1" />
                          Долг: {(sale.total - sale.paidAmount).toLocaleString()} $
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                      Наличные
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      title="Просмотр"
                      onClick={() => openModal(sale)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {user?.role === 'admin' && (
                      <>
                        {sale.isCredit && sale.paidAmount < sale.total && (
                          <button
                            title="Оплата"
                            onClick={() => payDebt(sale._id)}
                            className="text-green-600 hover:text-green-900"
                            disabled={loading}
                          >
                            <CurrencyDollarIcon className="h-5 w-5" />
                          </button>
                        )}

                        <button
                          title="Удалить"
                          onClick={() => cancelSale(sale._id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Назад
            </button>
            <span className="text-sm text-gray-700">
              Страница {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Вперед
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно деталей продажи */}
      {isModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Продажа №${selectedSale._id.slice(-6).toUpperCase()}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <PrinterIcon className="h-5 w-5 mr-1" />
                  Печать
                </button>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Дата</p>
                  <p className="font-medium">
                    {format(new Date(selectedSale.saleDate), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Клиент</p>
                  <p className="font-medium">
                    {selectedSale.customer?.name || 'Неизвестный клиент'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Тип оплаты</p>
                  <p className="font-medium">
                    {selectedSale.isCredit ? 'Кредит' : 'Наличные'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Статус</p>
                  <p className="font-medium">
                    {selectedSale.isCredit ? 
                      (selectedSale.paidAmount >= selectedSale.total ? 
                        'Полностью оплачено' : 
                        `Остаток: ${(selectedSale.total - selectedSale.paidAmount).toLocaleString()} $`) : 
                      'Полностью оплачено'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Товары</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">№</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Наименование</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedSale.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{item.product?.name || 'Товар'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{item.price.toLocaleString()} $</td>
                          <td className="px-4 py-2 whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} $</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Итого</p>
                  <p className="font-bold text-lg">{selectedSale.total.toLocaleString()} $</p>
                </div>
                {selectedSale.isCredit && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Оплачено</p>
                    <p className="font-bold text-lg">{selectedSale.paidAmount.toLocaleString()} $</p>
                  </div>
                )}
              </div>

              {selectedSale.notes && (
                <div>
                  <h4 className="font-medium mb-2">Примечание</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedSale.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <PrinterIcon className="h-5 w-5 mr-1" />
                Печать
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleTable;