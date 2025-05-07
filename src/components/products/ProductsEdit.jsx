import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

const ProductsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    quantity: 0,
    minQuantity: 3,
    category: '',
    image: null
  });

  // Mahsulot ma'lumotlarini yuklash
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Avtorizatsiya talab qilinadi');
        }

        const response = await axios.get(`https://inventory-app-theta-two.vercel.app/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then(res => console.log(res)
        );

        setFormData({
          name: response.data.name || '',
          sku: response.data.sku || '',
          description: response.data.description || '',
          price: response.data.price || 0,
          quantity: response.data.quantity || 0,
          minQuantity: response.data.minQuantity || 3,
          category: response.data.category || '',
          image: null
        });
      } catch (error) {
        console.error('Mahsulot yuklanmadi:', error);
        toast.error(error.response?.data?.message || 'Mahsulot yuklanmadi');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Input maydonlarini o'zgartirish
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' || name === 'minQuantity' 
        ? Number(value) 
        : value
    }));
    
    // Xatolarni tozalash
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Faylni o'zgartirish
  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  // Formani yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrors({});

    // Validatsiya
    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = 'Nomi majburiy';
    if (!formData.sku.trim()) validationErrors.sku = 'SKU majburiy';
    if (!formData.price || isNaN(formData.price)) validationErrors.price = 'Noto‘g‘ri narx';
    if (!formData.category) validationErrors.category = 'Kategoriya majburiy';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setUpdating(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Avtorizatsiya talab qilinadi');
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('sku', formData.sku);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('minQuantity', formData.minQuantity);
      data.append('category', formData.category);
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      const response = await axios.put(`https://inventory-app-theta-two.vercel.app/api/products/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(response.data?.message || 'Mahsulot muvaffaqiyatli yangilandi');
      navigate('/products');
    } catch (error) {
      console.error('Xato:', error);
      
      if (error.response?.status === 401) {
        toast.error('Kirish rad etildi. Iltimos, qayta kiring.');
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
        toast.error(error.response?.data?.message || error.message || 'Xato yuz berdi');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
console.log(formData);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mahsulotni Tahrirlash</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nomi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomi <span className="text-red-500">*</span>
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
            Tavsifi
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
            Narxi <span className="text-red-500">*</span>
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
            Miqdori
          </label>
          <input
            type="number"
            name="quantity"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Minimal miqdor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ogohlantirish miqdori
          </label>
          <input
            type="number"
            name="minQuantity"
            min="1"
            value={formData.minQuantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mahsulot shu miqdorga yetganda ogohlantirish beriladi
          </p>
        </div>

        {/* Kategoriya */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategoriya <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Tanlang...</option>
            <option value="Elektronika">Elektronika</option>
            <option value="Maishiy texnika">Maishiy texnika</option>
            <option value="Kiyim-kechak">Kiyim-kechak</option>
            <option value="Oziq-ovqat">Oziq-ovqat</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Rasm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Yangi rasm yuklash (agar o'zgartirmoqchi bo'lsangiz)
          </label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Submit tugmasi */}
        <div className="pt-4 flex space-x-3">
          <button
            type="submit"
            disabled={updating}
            className={`px-4 py-2 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 ${
              updating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {updating ? 'Yuklanmoqda...' : 'Saqlash'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductsEdit;