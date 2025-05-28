import { useState, useEffect } from 'react'
import axios from '../../utils/axiosConfig'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

<<<<<<< HEAD
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
=======
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
>>>>>>> 1d0cf1dd7001aadbc7d98c3aa3094d96959cccbb

	// Mahsulotlar va mijozlarni yuklash
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

<<<<<<< HEAD
				const [productsRes, customersRes] = await Promise.all([
					axios.get('/api/products?limit=1000', config),
					axios.get('/api/customers?limit=1000', config),
				])

				setProducts(productsRes.data.data || productsRes.data)
				setCustomers(customersRes.data.data || customersRes.data)
			} catch (error) {
				console.error('Maʼlumotlarni yuklashda xato:', error)
=======
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
>>>>>>> 1d0cf1dd7001aadbc7d98c3aa3094d96959cccbb

				if (error.response) {
					switch (error.response.status) {
						case 401:
							toast.error('Sessiya muddati tugagan. Iltimos, qayta kiring.')
							localStorage.removeItem('token')
							window.location.href = '/login'
							break
						case 403:
							toast.error('Sizda bu amalni bajarish uchun ruxsat yoʻq')
							break
						default:
							toast.error(error.response.data?.message || 'Server xatosi')
					}
				} else {
					toast.error('Tarmoq xatosi. Iltimos, ulanishni tekshiring.')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	// Mahsulot narxlarini yangilash
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

	// Umumiy summani hisoblash
	const totalAmount = formData.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	)

	// Forma o'zgarishlarini boshqarish
	const handleChange = e => {
		const { name, value, type, checked } = e.target
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	// Mahsulot o'zgarishlarini boshqarish
	const handleItemChange = (index, e) => {
		const { name, value } = e.target
		const updatedItems = [...formData.items]
		updatedItems[index] = {
			...updatedItems[index],
			[name]: name === 'quantity' ? parseInt(value) || 0 : value,
		}

		// Agar mahsulot tanlangan bo'lsa, uning nomini ham yangilash
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

	// Yangi mahsulot qatorini qo'shish
	const addItemRow = () => {
		setFormData(prev => ({
			...prev,
			items: [...prev.items, { product: '', quantity: 1, price: 0, name: '' }],
		}))
	}

	// Mahsulot qatorini olib tashlash
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

	// Formani yuborish
	const handleSubmit = async e => {
		e.preventDefault()

		// Mahsulotlarni tekshirish
		if (formData.items.some(item => !item.product || item.quantity < 1)) {
			toast.error('Iltimos, toʻgʻri mahsulotlar va miqdorni tanlang')
			return
		}

		try {
			setLoading(true)
			const token = localStorage.getItem('token')

<<<<<<< HEAD
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}
=======
      // 2. So'rov tayyorlash
      // const config = {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // };
>>>>>>> 1d0cf1dd7001aadbc7d98c3aa3094d96959cccbb

			// To'lov maʼlumotlarini tayyorlash
			const paymentData = {
				total: totalAmount,
				grandTotal: totalAmount, // Backend talab qilgan yangi maydon
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

<<<<<<< HEAD
			// So'rov maʼlumotlarini tayyorlash
			const requestData = {
				customer: formData.customer,
				items: formData.items.map(item => ({
					product: item.product,
					name: item.name, // Backend talab qilgan yangi maydon
					quantity: item.quantity,
					price: item.price,
				})),
				seller: user._id,
				notes: formData.notes,
				...paymentData,
			}
			console.log(requestData)
=======
      // 4. POST so'rovini yuborish
      const response = await axios.post('/api/sales', formData, { headers: { Authorization: `Bearer ${token}` } });
>>>>>>> 1d0cf1dd7001aadbc7d98c3aa3094d96959cccbb

			const response = await axios.post(
				'https://inventory-app-theta-two.vercel.app/api/sales',
				requestData,
				config
			)
			if (response.data.success) {
				toast.success('Sotuv muvaffaqiyatli yaratildi!')
				if (onSuccess) onSuccess()
				setShowForm(false)
			} else {
				throw new Error(response.data.message || 'Sotuvni yaratishda xato')
			}
		} catch (error) {
			console.error('Sotuvni yaratishda xato:', error)

			if (error.response) {
				switch (error.response.status) {
					case 400:
						toast.error(error.response.data?.message || 'Validatsiya xatosi')
						break
					case 401:
						toast.error('Sessiya muddati tugagan. Iltimos, qayta kiring.')
						localStorage.removeItem('token')
						window.location.href = '/login'
						break
					case 500:
						toast.error('Server xatosi. Iltimos, keyinroq urinib koʻring.')
						break
					default:
						toast.error(error.response.data?.message || 'Xato yuz berdi')
				}
			} else {
				toast.error(error.message || 'Tarmoq xatosi')
			}
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return <div className='text-center py-8'>Yuklanmoqda...</div>
	}

	return (
		<div className='bg-white p-6 rounded-lg shadow-md'>
			<h2 className='text-xl font-bold mb-4'>Yangi sotuv</h2>

			<form onSubmit={handleSubmit}>
				{/* Mijozni tanlash */}
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Mijoz</label>
					<select
						name='customer'
						value={formData.customer}
						onChange={handleChange}
						className='w-full p-2 border rounded'
						required
					>
						<option value=''>Mijozni tanlang...</option>
						{customers.map(customer => (
							<option key={customer._id} value={customer._id}>
								{customer.name} ({customer.phone})
							</option>
						))}
					</select>
				</div>

				{/* Mahsulotlar ro'yxati */}
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Mahsulotlar</label>
					{formData.items.map((item, index) => (
						<div key={index} className='flex gap-2 mb-2 items-center'>
							<select
								name='product'
								value={item.product}
								onChange={e => handleItemChange(index, e)}
								className='flex-1 p-2 border rounded'
								required
							>
								<option value=''>Mahsulotni tanlang...</option>
								{products.map(product => (
									<option
										key={product._id}
										value={product._id}
										disabled={product.quantity <= 0}
									>
										{product.name} - Qoldiq: {product.quantity} dona, narxi: $
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
						+ Mahsulot qoshish
					</button>
				</div>

				{/* To'lov turi */}
				<div className='mb-4'>
					<label className='flex items-center space-x-2'>
						<input
							type='checkbox'
							name='isCredit'
							checked={formData.isCredit}
							onChange={handleChange}
							className='rounded'
						/>
						<span>Nasiya sotuv</span>
					</label>
				</div>

				{/* To'lov usuli */}
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Tolov usuli</label>
					<select
						name='paymentMethod'
						value={formData.paymentMethod}
						onChange={handleChange}
						className='w-full p-2 border rounded'
					>
						<option value='cash'>Naqd pul</option>
						<option value='card'>Plastik karta</option>
						<option value='transfer'>Bank orqali</option>
					</select>
				</div>

				{/* To'langan summa (nasiya sotuvlar uchun) */}
				{formData.isCredit && (
					<div className='mb-4'>
						<label className='block text-gray-700 mb-2'>Tolangan summa</label>
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
							Qoldiq: ${(totalAmount - formData.paidAmount).toFixed(2)}
						</div>
					</div>
				)}

				{/* Izohlar */}
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Izohlar</label>
					<textarea
						name='notes'
						value={formData.notes}
						onChange={handleChange}
						className='w-full p-2 border rounded'
						rows='2'
					/>
				</div>

				{/* Umumiy maʼlumot */}
				<div className='mb-4 p-3 bg-gray-100 rounded'>
					<div className='font-bold'>
						Umumiy summa: ${totalAmount.toFixed(2)}
					</div>
					{formData.isCredit && (
						<div className='text-sm'>
							Tolangan: ${formData.paidAmount.toFixed(2)} | Qarz: $
							{(totalAmount - formData.paidAmount).toFixed(2)}
						</div>
					)}
				</div>

				{/* Tugmalar */}
				<div className='flex justify-end space-x-3'>
					<button
						type='button'
						onClick={onCancel}
						className='px-4 py-2 border rounded hover:bg-gray-100'
					>
						Bekor qilish
					</button>
					<button
						type='submit'
						className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
						disabled={loading}
					>
						{loading ? 'Jarayonda...' : 'Sotuvni yaratish'}
					</button>
				</div>
			</form>
		</div>
	)
}

export default SaleForm
