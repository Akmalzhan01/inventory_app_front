import { useState, useEffect } from 'react'
import axios from '../../utils/axiosConfig'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

// eslint-disable-next-line react/prop-types
const SaleForm = ({ onSuccess, onCancel, setShowForm }) => {
	const { user } = useAuth()
	const [products, setProducts] = useState([])
	const [customers, setCustomers] = useState([])
	const [loading, setLoading] = useState(true)
	const [formData, setFormData] = useState({
		customer: '',
		items: [{ product: '', quantity: 1, price: 0, name: '' }],
		isCredit: false,
		paidAmount: 0,
		paymentMethod: 'cash',
		notes: '',
		seller: user._id,
		grandTotal: 0,
	})

	// Загрузка продуктов и клиентов
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)
				const token = localStorage.getItem('token')

				const config = {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}

				const [productsRes, customersRes] = await Promise.all([
					axios.get('/api/products?limit=1000', config),
					axios.get('/api/customers?limit=1000', config),
				])

				setProducts(productsRes.data.data || productsRes.data)
				setCustomers(customersRes.data.data || customersRes.data)
			} catch (error) {
				console.error('Ошибка при загрузке данных:', error)

				if (error.response) {
					switch (error.response.status) {
						case 401:
							toast.error('Сессия истекла. Пожалуйста, войдите снова.')
							localStorage.removeItem('token')
							window.location.href = '/login'
							break
						case 403:
							toast.error('У вас нет прав для выполнения этого действия')
							break
						default:
							toast.error(error.response.data?.message || 'Ошибка сервера')
					}
				} else {
					toast.error('Сетевая ошибка. Пожалуйста, проверьте подключение.')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	// Обновление цен продуктов
	useEffect(() => {
		const updatedItems = formData.items.map(item => {
			const selectedProduct = products.find(p => p._id === item.product)
			return {
				...item,
				price: selectedProduct ? selectedProduct.price : 0,
				name: selectedProduct ? selectedProduct.name : '',
			}
		})

		const grandTotal = updatedItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		)

		setFormData(prev => ({
			...prev,
			items: updatedItems,
			grandTotal,
		}))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData.items.map(item => item.product).join()])

	// Расчет общей суммы
	const totalAmount = formData.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	)

	// Обработка изменений формы
	const handleChange = e => {
		const { name, value, type, checked } = e.target
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	// Обработка изменений товаров
	const handleItemChange = (index, e) => {
		const { name, value } = e.target
		const updatedItems = [...formData.items]
		updatedItems[index] = {
			...updatedItems[index],
			[name]: name === 'quantity' ? parseInt(value) || 0 : value,
		}

		// Если выбран продукт, обновляем его название
		if (name === 'product') {
			const selectedProduct = products.find(p => p._id === value)
			if (selectedProduct) {
				updatedItems[index].name = selectedProduct.name
				updatedItems[index].price = selectedProduct.price
			}
		}

		setFormData(prev => ({
			...prev,
			items: updatedItems,
			grandTotal: updatedItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			),
		}))
	}

	// Добавление новой строки товара
	const addItemRow = () => {
		setFormData(prev => ({
			...prev,
			items: [...prev.items, { product: '', quantity: 1, price: 0, name: '' }],
		}))
	}

	// Удаление строки товара
	const removeItemRow = index => {
		if (formData.items.length > 1) {
			const updatedItems = formData.items.filter((_, i) => i !== index)
			const grandTotal = updatedItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			)
			setFormData(prev => ({
				...prev,
				items: updatedItems,
				grandTotal,
			}))
		}
	}

	// Отправка формы
	const handleSubmit = async e => {
		e.preventDefault()

		// Проверка товаров
		if (formData.items.some(item => !item.product || item.quantity < 1)) {
			toast.error('Пожалуйста, выберите правильные товары и количество')
			return
		}

		try {
			setLoading(true)
			const token = localStorage.getItem('token')

			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}

			// Подготовка данных о платеже
			const paymentData = {
				total: totalAmount,
				grandTotal: totalAmount, // Новое поле, требуемое бэкендом
				isCredit: formData.isCredit,
				paymentMethod: formData.paymentMethod,
				paidAmount: formData.isCredit ? formData.paidAmount : totalAmount,
				paymentHistory:
					formData.isCredit && formData.paidAmount > 0
						? [
								{
									amount: formData.paidAmount,
									paymentMethod: formData.paymentMethod,
									receivedBy: user._id,
									notes: formData.notes,
								},
						  ]
						: [],
			}

			// Подготовка данных запроса
			const requestData = {
				customer: formData.customer,
				items: formData.items.map(item => ({
					product: item.product,
					name: item.name, // Новое поле, требуемое бэкендом
					quantity: item.quantity,
					price: item.price,
				})),
				seller: user._id,
				notes: formData.notes,
				...paymentData,
			}
			console.log(requestData)

			const response = await axios.post(
				'https://inventory-app-theta-two.vercel.app/api/sales',
				requestData,
				config
			)
			if (response.data.success) {
				toast.success('Продажа успешно создана!')
				if (onSuccess) onSuccess()
				setShowForm(false)
			} else {
				throw new Error(response.data.message || 'Ошибка при создании продажи')
			}
		} catch (error) {
			console.error('Ошибка при создании продажи:', error)

			if (error.response) {
				switch (error.response.status) {
					case 400:
						toast.error(error.response.data?.message || 'Ошибка валидации')
						break
					case 401:
						toast.error('Сессия истекла. Пожалуйста, войдите снова.')
						localStorage.removeItem('token')
						window.location.href = '/login'
						break
					case 500:
						toast.error('Ошибка сервера. Пожалуйста, попробуйте позже.')
						break
					default:
						toast.error(error.response.data?.message || 'Произошла ошибка')
				}
			} else {
				toast.error(error.message || 'Сетевая ошибка')
			}
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return <div className='text-center py-8'>Загрузка...</div>
	}
	console.log(products)

	return (
		<div className='bg-white p-6 rounded-lg shadow-md'>
			<h2 className='text-xl font-bold mb-4'>Новая продажа</h2>

			<form onSubmit={handleSubmit}>
				{/* Выбор клиента */}
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Клиент</label>
					<select
						name='customer'
						value={formData.customer}
						onChange={handleChange}
						className='w-full p-2 border rounded'
						required
					>
						<option value=''>Выберите клиента...</option>
						{customers.map(customer => (
							<option key={customer._id} value={customer._id}>
								{customer.name} ({customer.phone})
							</option>
						))}
					</select>
				</div>

				{/* Список товаров */}
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Товары</label>
					{formData.items.map((item, index) => (
						<div key={index} className='flex gap-2 mb-2 items-center'>
							<select
								name='product'
								value={item.product}
								onChange={e => handleItemChange(index, e)}
								className='flex-1 p-2 border rounded'
								required
							>
								<option value=''>Выберите товар...</option>
								{products.map(product => (
									<option
										key={product._id}
										value={product._id}
										disabled={product.quantity <= 0}
									>
										{product.name} - Остаток: {product.quantity} шт., цена: $
										{product.price}
									</option>
								))}
							</select>
							<input
								type='number'
								name='quantity'
								min='1'
								value={item.quantity}
								onChange={e => handleItemChange(index, e)}
								className='w-20 p-2 border rounded'
								required
							/>{' '}
							<input
								type='number'
								name='price'
								min='1'
								placeholder='цена'
								onChange={e => handleItemChange(index, e)}
								className='w-20 p-2 border rounded'
								required
							/>
							<span className='w-32 p-2 border rounded bg-gray-100'>
								${(item.price * item.quantity).toFixed(2)}
							</span>
							{formData.items.length > 1 && (
								<button
									type='button'
									onClick={() => removeItemRow(index)}
									className='bg-red-500 text-white px-3 rounded h-10'
								>
									×
								</button>
							)}
						</div>
					))}

					<button
						type='button'
						onClick={addItemRow}
						className='mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm'
					>
						+ Добавить товар
					</button>
				</div>

				{/* Тип оплаты */}
				<div className='mb-4'>
					<label className='flex items-center space-x-2'>
						<input
							type='checkbox'
							name='isCredit'
							checked={formData.isCredit}
							onChange={handleChange}
							className='rounded'
						/>
						<span>Продажа в кредит</span>
					</label>
				</div>

				{/* Способ оплаты */}
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Способ оплаты</label>
					<select
						name='paymentMethod'
						value={formData.paymentMethod}
						onChange={handleChange}
						className='w-full p-2 border rounded'
					>
						<option value='cash'>Наличные</option>
						<option value='card'>Пластиковая карта</option>
						<option value='transfer'>Банковский перевод</option>
					</select>
				</div>

				{/* Оплаченная сумма (для продаж в кредит) */}
				{formData.isCredit && (
					<div className='mb-4'>
						<label className='block text-gray-700 mb-2'>Оплаченная сумма</label>
						<input
							type='number'
							name='paidAmount'
							min='0'
							max={totalAmount}
							value={formData.paidAmount}
							onChange={handleChange}
							className='w-full p-2 border rounded'
						/>
						<div className='text-sm text-gray-500 mt-1'>
							Остаток: ${(totalAmount - formData.paidAmount).toFixed(2)}
						</div>
					</div>
				)}

				{/* Примечания */}
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Примечания</label>
					<textarea
						name='notes'
						value={formData.notes}
						onChange={handleChange}
						className='w-full p-2 border rounded'
						rows='2'
					/>
				</div>

				{/* Общая информация */}
				<div className='mb-4 p-3 bg-gray-100 rounded'>
					<div className='font-bold'>
						Общая сумма: ${totalAmount.toFixed(2)}
					</div>
					{formData.isCredit && (
						<div className='text-sm'>
							Оплачено: ${formData.paidAmount} | Долг: $
							{(totalAmount - formData.paidAmount)}
						</div>
					)}
				</div>

				{/* Кнопки */}
				<div className='flex justify-end space-x-3'>
					<button
						type='button'
						onClick={onCancel}
						className='px-4 py-2 border rounded hover:bg-gray-100'
					>
						Отмена
					</button>
					<button
						type='submit'
						className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
						disabled={loading}
					>
						{loading ? 'В процессе...' : 'Создать продажу'}
					</button>
				</div>
			</form>
		</div>
	)
}

export default SaleForm
