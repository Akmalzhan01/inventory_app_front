import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

const ProductsNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    quantity: '',
    minQuantity: '5',
    category: '',
    image: null
  });

  // Maydonlarni o'zgartirish
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Xatolarni tozalash
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Formani yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validatsiya
    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = 'Имя обязательно.';
    if (!formData.sku.trim()) validationErrors.sku = 'SKU обязательно.';
    if (!formData.price || isNaN(formData.price)) validationErrors.price = 'Неправильная цена';
    if (!formData.category) validationErrors.category = 'Категория обязательна';
    if (formData.quantity && isNaN(formData.quantity)) validationErrors.quantity = 'Неправильная сумма';
    if (formData.minQuantity && isNaN(formData.minQuantity)) validationErrors.minQuantity = 'Неверная минимальная сумма';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('sku', formData.sku);
      data.append('description', formData.description || '');
      data.append('price', formData.price);
      data.append('quantity', formData.quantity || '0');
      data.append('minQuantity', formData.minQuantity || '5');
      data.append('category', formData.category);
      if (formData.image) data.append('image', formData.image);

      await axios.post('https://inventory-app-theta-two.vercel.app/api/products', formData);

      toast.success('Продукт успешно добавлен');
      navigate('/products');
    } catch (error) {
      console.error('Ошибка:', error);

      if (error.response?.status === 401) {
        toast.error('Доступ запрещен. Пожалуйста, войдите в систему снова.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.data?.errors) {
        // Server validatsiya xatolari
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key].message;
        });
        setErrors(serverErrors);
      } else {
        toast.error(error.response?.data?.message || error.message || 'Произошла ошибка.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Добавить новый продукт</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nomi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
          Имя <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.sku ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
        </div>

        {/* Tavsifi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
          Описание
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Narxi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
          Цена <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        {/* Miqdori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
          Количество
          </label>
          <input
            type="number"
            name="quantity"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
        </div>

        {/* Minimal miqdor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
          Предупреждающая сумма
          </label>
          <input
            type="number"
            name="minQuantity"
            min="1"
            value={formData.minQuantity}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.minQuantity ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.minQuantity && <p className="text-red-500 text-sm mt-1">{errors.minQuantity}</p>}
          <p className="text-xs text-gray-500 mt-1">
          Когда количество товара достигнет этого значения, будет выдано предупреждение.
          </p>
        </div>

        {/* Kategoriya */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
          Категория <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Выбирать...</option>
            <option value="Elektronika">Электроника</option>
            <option value="Бытовая техника">Бытовая техника</option>
            <option value="Kiyim-kechak">Одежда</option>
            <option value="Еда">Еда</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Rasm */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
          Изображение продукта
          </label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
        </div> */}

        {/* Submit tugmasi */}
        <div className="pt-4 flex justify-between">
          <button
            type="submit"
            disabled={loading}
            className={`w-2xs py-2 px-4 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Загрузка...' : 'Сохранить'}
          </button>
          <button 
          className={`w-2xs py-2 px-4 rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => navigate('/products')}
            >Выйти</button>
        </div>
      </form>
    </div>
  );
};

export default ProductsNew;


// import React, { useState } from 'react'
// import axios from 'axios';

// function ProductsNew() {
//   const [name, setName] = useState("")
//   const [sku, setSku] = useState("")
//   const [description, setDescription] = useState("")
//   const [price, setPrice] = useState(0)
//   const [quantity, setQuantity] = useState(0)
//   const [minQuantity, setMinQuantity] = useState(3)
//   const [category, setCategory] = useState("")

//   const data = {
//     name,
//     sku,
//     description,
//     price,
//     quantity,
//     minQuantity,
//     category
//   }
// console.log(data);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     try {

//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('Avtorizatsiya talab qilinadi');
//       }
      
//       axios.post("http://localhost:5173/api/products", data)
//     } catch (error) {

//     }
//   }


//   return (
//     <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Yangi Mahsulot Qo'shish</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Nomi */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Nomi <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             name="name"
//             value={name}
//             onChange={e => setName(e.target.value)}
//             className={`w-full px-3 py-2 border rounded-md `}
//           />
//         </div>

//         {/* SKU */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             SKU <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             name="sku"
//             value={sku}
//             onChange={e => setSku(e.target.value)}
//             className={`w-full px-3 py-2 border rounded-md`}
//           />
//         </div>

//         {/* Tavsifi */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Tavsifi
//           </label>
//           <textarea
//             name="description"
//             value={description}
//             onChange={e => setDescription(e.target.value)}
//             rows={3}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md"
//           />
//         </div>

//         {/* Narxi */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Narxi <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="number"
//             name="price"
//             min="0"
//             step="0.01"
//             value={price}
//             onChange={e => setPrice(e.target.value)}
//             className={`w-full px-3 py-2 border rounded-md`}
//           />
//         </div>

//         {/* Miqdori */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Miqdori
//           </label>
//           <input
//             type="number"
//             name="quantity"
//             min="0"
//             value={quantity}
//             onChange={e => setQuantity(e.target.value)}
//             className={`w-full px-3 py-2 border rounded-md`}
//           />
//         </div>

//         {/* Minimal miqdor */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Ogohlantirish miqdori
//           </label>
//           <input
//             type="number"
//             name="minQuantity"
//             min="1"
//             value={minQuantity}
//             onChange={e => setMinQuantity(e.target.value)}
//             className={`w-full px-3 py-2 border rounded-md`}
//           />
//           <p className="text-xs text-gray-500 mt-1">
//             Mahsulot shu miqdorga yetganda ogohlantirish beriladi
//           </p>
//         </div>

//         {/* Kategoriya */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Kategoriya <span className="text-red-500">*</span>
//           </label>
//           <select
//             name="category"
//             value={category}
//             onChange={e => setCategory(e.target.value)}
//             className={`w-full px-3 py-2 border rounded-md`}
//           >
//             <option value="">Tanlang...</option>
//             <option value="Elektronika">Elektronika</option>
//             <option value="Maishiy texnika">Maishiy texnika</option>
//             <option value="Kiyim-kechak">Kiyim-kechak</option>
//             <option value="Oziq-ovqat">Oziq-ovqat</option>
//           </select>
//         </div>

//         {/* Submit tugmasi */}
//         <div className="pt-4">
//           <button
//             type="submit"
//             className={`w-full py-2 px-4 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700`}
//           >
//             Saqlash
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default ProductsNew