import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SaleForm = ({ onCancel, setShowForm }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customer: '',
    items: [{ product: '', quantity: 1, price: 0 }],
    isCredit: false,
    paidAmount: 0,
    notes: '',
    seller: user._id
  });

  // Mahsulotlar va mijozlarni yuklash
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Tokenni olish va tekshirish
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен авторизации не найден');
        }

        // 2. So'rovlar uchun konfiguratsiya
        // const config = {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'application/json'
        //   },
        // };

        // 3. Parallel so'rovlar
        const [productsRes, customersRes] = await Promise.all([
          axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/customers', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // 4. Ma'lumotlarni tekshirish
        if (!productsRes.data || !customersRes.data) {
          throw new Error('Данные не возвращены');
        }

        setProducts(productsRes.data);
        setCustomers(customersRes.data);

      } catch (error) {
        console.error('Ошибка загрузки данных:', error);

        // 5. Xato turlari bo'yicha ishlov berish
        if (error.response) {
          switch (error.response.status) {
            case 401:
              toast.error('Доступ запрещен. Пожалуйста, войдите в систему снова.');
              localStorage.removeItem('token');
              window.location.href = '/login';
              break;
            case 403:
              toast.error('У вас нет разрешения на выполнение этого действия.');
              break;
            default:
              toast.error(error.response.data?.message || 'Ошибка сервера');
          }
        } else {
          toast.error('Ошибка подключения к Интернету или сервера');
        }

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mahsulot narxini yangilash
  useEffect(() => {
    const updatedItems = formData.items.map(item => {
      const selectedProduct = products.find(p => p._id === item.product);
      return {
        ...item,
        price: selectedProduct ? selectedProduct.price : 0
      };
    });
    setFormData(prev => ({ ...prev, items: updatedItems }));
  }, [formData.items.map(item => item.product).join()]);

  // Jami summani hisoblash
  const totalAmount = formData.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );

  // Inputlarni boshqarish
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Mahsulot qatorini o'zgartirish
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  // Yangi mahsulot qatori qo'shish
  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, price: 0 }]
    }));
  };

  // Mahsulot qatorini o'chirish
  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  // Formani yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 1. Tokenni olish
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      // 2. So'rov tayyorlash
      // const config = {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // };

      // 3. Ma'lumotlarni tekshirish
      // if (!formData.product || !formData.customer || !formData.quantity) {
      //   throw new Error('Заполните все обязательные поля.');
      // }

      // 4. POST so'rovini yuborish
      const response = await axios.post('/api/sales', formData, { headers: { Authorization: `Bearer ${token}` } });

      // 5. Muvaffaqiyatli javobni qayta ishlash
      if (response.data.success) {
        toast.success('Продажа успешно добавлена');
        // onSuccess; // Yangilash funksiyasi
        // resetForm(); // Formani tozalash
        setShowForm(false); // Formani yopish
      } else {
        throw new Error(response.data.message || 'Ошибка добавления продажи');
      }

    } catch (error) {
      console.error('Ошибка добавления продаж:', error);

      // 6. Xato turlarini boshqarish
      if (error.response) {
        switch (error.response.status) {
          case 400:
            toast.error(error.response.data?.message || 'Ошибка добавления продаж');
            break;
          case 401:
            toast.error('Доступ запрещен. Пожалуйста, войдите в систему снова.');
            localStorage.removeItem('token');
            window.location.href = '/login';
            break;
          case 500:
            toast.error('Ошибка сервера. Попробуйте еще раз позже.');
            break;
          default:
            toast.error(error.response.data?.message || 'Произошла ошибка.');
        }
      } else {
        toast.error(error.message || 'Ошибка подключения к Интернету или сервера');
      }

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Новая продажа</h2>

      <form onSubmit={handleSubmit}>
        {/* Mijoz tanlash */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Клиент</label>
          <select
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Выберите клиента...</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} ({customer.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Mahsulotlar ro'yxati */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Продукция</label>
          {formData.items.map((item, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <select
                name="product"
                value={item.product}
                onChange={(e) => handleItemChange(index, e)}
                className="flex-1 p-2 border rounded"
                required
              >
                <option value="">Выберите продукт...</option>
                {products.map(product => (
                  <option
                    key={product._id}
                    value={product._id}
                    disabled={product.quantity <= 0}
                  >
                    {product.name} - (Остаток: {product.quantity})
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="quantity"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                className="w-20 p-2 border rounded"
                required
              />
              <input
                type="number"
                name="price"
                min="0"
                value={item.price}
                onChange={(e) => handleItemChange(index, e)}
                className="w-20 p-2 border rounded"
                required
              />

              <input
                type="text"
                value={(item.price * item.quantity).toLocaleString() + ' $'}
                className="w-32 p-2 border rounded bg-gray-100"
                readOnly
              />

              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItemRow}
            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm"
          >
            + Добавить продукт
          </button>
        </div>

        {/* To'lov turi */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isCredit"
              checked={formData.isCredit}
              onChange={handleChange}
              className="rounded"
            />
            <span>Продажа в кредит</span>
          </label>
        </div>

        {/* To'lov summasi */}
        {formData.isCredit && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Сумма oплаченная</label>
            <input
              type="number"
              name="paidAmount"
              min="0"
              max={totalAmount}
              value={formData.paidAmount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <div className="text-sm text-gray-500 mt-1">
              Остаток: {(totalAmount - formData.paidAmount).toLocaleString()} $
            </div>
          </div>
        )}

        {/* Izohlar */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Примечания</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="2"
          />
        </div>

        {/* Jami summa */}
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <div className="font-bold">Общая сумма: {totalAmount.toLocaleString()} $</div>
          {formData.isCredit && (
            <div className="text-sm">
              Оплаченный: {formData.paidAmount.toLocaleString()} $ |
              Остаток: {(totalAmount - formData.paidAmount).toLocaleString()} $
            </div>
          )}
        </div>

        {/* Tugmalar */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Добавить продажу
          </button>
        </div>
      </form>
    </div>
  );
};

export default SaleForm;
