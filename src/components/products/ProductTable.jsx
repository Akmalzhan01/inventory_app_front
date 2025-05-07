import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PencilIcon, TrashIcon, EyeIcon, ArrowPathIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import Pagination from '../common/Pagination';

const ProductTable = ({ products: initialProducts, loading, onRefresh }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    quantity: '',
    minQuantity: '',
    category: ''
  });
  const productsPerPage = 10;

  // Agar initialProducts o'zgarib qolsa
  useState(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Mahsulotni o'chirish
  const deleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот продукт?')) return;

    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(products.filter(product => product._id !== productId));
      toast.success('Продукт успешно удален.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка удаления продукта');
    }
  };

  // Mahsulotni ko'rish uchun modalni ochish
  const openViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  // Mahsulotni tahrirlash uchun modalni ochish
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      minQuantity: product.minQuantity.toString(),
      category: product.category
    });
    setIsEditModalOpen(true);
  };

  // Modalni yopish
  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    onRefresh
  };

  // Form maydonlarini o'zgartirish
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Formani yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/products/${selectedProduct._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Yangilangan mahsulotni ro'yxatga qo'shish
      setProducts(products.map(product => 
        product._id === selectedProduct._id ? response.data : product
      ));
      
      toast.success('Продукт успешно обновлен');
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка обновления продукта');
    }
  };

  // Pagination hisoblash
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Agar mahsulotlar bo'sh bo'lsa
  if (initialProducts.length === 0 && !loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">Пока нет доступных продуктов.</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <ArrowPathIcon className="h-5 w-5 inline mr-2" />
          Обновить
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Yuklanayotganda skeleton loader */}
      {loading ? (
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Jadval */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имя
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Количество
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {initialProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-200 rounded-md flex items-center justify-center">
                          {product.image ? (
                            <img className="h-10 w-10 rounded-md" src={product.image} alt={product.name} />
                          ) : (
                            <PhotoIcon className='w-8 h-8 text-blue-800' />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price.toLocaleString()} $
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${product.quantity <= product.minQuantity
                          ? 'text-red-600 font-bold'
                          : 'text-gray-900'
                        }`}>
                        {product.quantity} {product.quantity <= product.minQuantity && '(Осталось немного!)'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openViewModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Просмотреть детали"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>

                        {user?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Редактировать"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>

                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Удалить"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Mahsulot haqida ma'lumot modal oynasi */}
      {isViewModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold text-gray-900">Детали продукта</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Закрыть"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="h-40 w-40 bg-gray-200 rounded-md flex items-center justify-center">
                    {selectedProduct.image ? (
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <PhotoIcon className="h-20 w-20 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">ID продукта</h4>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedProduct._id}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Название</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">SKU</h4>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedProduct.sku}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Категория</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.category}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Цена</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.price.toLocaleString()} $</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Количество на складе</h4>
                      <p className={`mt-1 text-sm ${
                        selectedProduct.quantity <= selectedProduct.minQuantity
                          ? 'text-red-600 font-bold'
                          : 'text-gray-900'
                      }`}>
                        {selectedProduct.quantity} {selectedProduct.quantity <= selectedProduct.minQuantity && '(Осталось немного!)'}
                      </p>
                    </div>
                    
                    {selectedProduct.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Описание</h4>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                          {selectedProduct.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mahsulotni tahrirlash modal oynasi */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold text-gray-900">Редактировать продукт</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Закрыть"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nomi */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
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
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Kategoriya */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Выберите категорию</option>
                    <option value="Электроника">Электроника</option>
                    <option value="Бытовая техника">Бытовая техника</option>
                    <option value="Одежда">Одежда</option>
                    <option value="Продукты">Продукты</option>
                  </select>
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
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Miqdori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Количество <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Minimal miqdor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Минимальное количество <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="minQuantity"
                    min="1"
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Tavsif */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="border-t p-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;