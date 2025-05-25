import { useState, useEffect } from 'react'
import axios from '../utils/axiosConfig'

function BorrowPage() {
	const [borrows, setBorrows] = useState([])
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [showDetailModal, setShowDetailModal] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false)
	const [selectedBorrow, setSelectedBorrow] = useState(null)
	const [formData, setFormData] = useState({
		lenderName: '',
		returnDate: '',
		borrowDate: new Date().toISOString().split('T')[0],
		returned: false,
		items: [{ itemName: '', quantity: 1, price: 0 }],
	})
	const [paymentData, setPaymentData] = useState({
		amount: 0,
		items: [],
		paymentMethod: 'cash',
		paymentDate: new Date().toISOString().split('T')[0],
	})

	// Fetch all borrow records
	useEffect(() => {
		fetchBorrows()
	}, [])

	const fetchBorrows = () => {
		axios
			.get('/api/borrows')
			.then(res => setBorrows(res.data))
			.catch(err => console.error(err))
	}

	// Handle form input changes
	const handleInputChange = e => {
		const { name, value } = e.target
		setFormData({ ...formData, [name]: value })
	}

	// Handle payment input changes
	const handlePaymentInputChange = e => {
		const { name, value } = e.target
		setPaymentData({ ...paymentData, [name]: value })
	}

	// Handle item input changes
	const handleItemChange = (index, e) => {
		const { name, value } = e.target
		const updatedItems = [...formData.items]
		updatedItems[index][name] =
			name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
		setFormData({ ...formData, items: updatedItems })
	}

	// Add new item row
	const addItemRow = () => {
		setFormData({
			...formData,
			items: [...formData.items, { itemName: '', quantity: 1, price: 0 }],
		})
	}

	// Remove item row
	const removeItemRow = index => {
		const updatedItems = formData.items.filter((_, i) => i !== index)
		setFormData({ ...formData, items: updatedItems })
	}

	// Calculate total for form items
	const calculateFormTotal = () => {
		return formData.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		)
	}

	// Calculate total for a borrow record
	const calculateBorrowTotal = borrow => {
		if (!borrow || !borrow.items || !Array.isArray(borrow.items)) {
			return 0
		}
		return borrow.items.reduce((sum, item) => {
			const price = parseFloat(item.price) || 0
			const quantity = parseInt(item.quantity) || 0
			return sum + price * quantity
		}, 0)
	}

	// Calculate remaining amount for a borrow record
	const calculateRemainingAmount = borrow => {
		const total = calculateBorrowTotal(borrow)
		const paid = borrow.paidAmount || 0
		return total - paid
	}

	// Submit form
	const handleSubmit = async e => {
		e.preventDefault()
		try {
			const submitData = {
				...formData,
				items: formData.items.map(item => ({
					...item,
				})),
			}

			await axios.post('/api/borrows', submitData)
			fetchBorrows()
			setShowCreateModal(false)
			// Reset form
			setFormData({
				lenderName: '',
				returnDate: '',
				borrowDate: new Date().toISOString().split('T')[0],
				returned: false,
				items: [{ itemName: '', quantity: 1, price: 0 }],
			})
		} catch (err) {
			console.error('Error creating borrow:', err)
			alert('Error creating borrow record. Please try again.')
		}
	}

	// Mark as returned
	const markAsReturned = async id => {
		try {
			await axios.patch(`/api/borrows/${id}/return`)
			fetchBorrows()
			setShowDetailModal(false)
		} catch (err) {
			console.error(err)
		}
	}

	// Delete borrow record
	const handleDelete = async id => {
		if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
			try {
				await axios.delete(`/api/borrows/${id}`)
				fetchBorrows()
				setShowDetailModal(false)
			} catch (err) {
				console.error('Error deleting borrow:', err)
				alert('Ошибка при удалении записи')
			}
		}
	}

	// Open edit modal
	const openEditModal = borrow => {
		setSelectedBorrow(borrow)
		setFormData({
			lenderName: borrow.lenderName,
			returnDate: borrow.returnDate
				? new Date(borrow.returnDate).toISOString().split('T')[0]
				: '',
			borrowDate: new Date(borrow.borrowDate).toISOString().split('T')[0],
			returned: borrow.returned,
			items: borrow.items.map(item => ({
				itemName: item.itemName,
				quantity: item.quantity,
				price: item.price,
			})),
		})
		setShowEditModal(true)
	}

	// Open detail modal
	const openDetailModal = borrow => {
		setSelectedBorrow(borrow)
		setShowDetailModal(true)
	}

	// Open partial payment modal
	const openPartialPaymentModal = borrow => {
		setSelectedBorrow(borrow)
		setPaymentData({
			amount: 0,
			items: borrow.items.map(item => ({
				itemId: item._id,
				amount: 0,
				remaining: item.price * item.quantity - (item.paidAmount || 0),
				itemName: item.itemName,
			})),
			paymentMethod: 'cash',
			paymentDate: new Date().toISOString().split('T')[0],
		})
		setShowPartialPaymentModal(true)
	}

	// Handle payment amount change for specific item
	const handleItemPaymentChange = (index, e) => {
		const { value } = e.target
		const updatedItems = [...paymentData.items]
		const newAmount = parseFloat(value) || 0

		// Ensure payment doesn't exceed remaining amount
		updatedItems[index].amount = Math.min(
			newAmount,
			updatedItems[index].remaining
		)

		setPaymentData({
			...paymentData,
			items: updatedItems,
			amount: updatedItems.reduce((sum, item) => sum + item.amount, 0),
		})
	}

	// Handle total payment amount change
	const handleTotalPaymentChange = e => {
		const { value } = e.target
		const newAmount = parseFloat(value) || 0
		const totalRemaining = paymentData.items.reduce(
			(sum, item) => sum + item.remaining,
			0
		)
		const adjustedAmount = Math.min(newAmount, totalRemaining)

		// Distribute payment across items
		let remainingPayment = adjustedAmount
		const updatedItems = paymentData.items.map(item => {
			const itemPayment = Math.min(remainingPayment, item.remaining)
			remainingPayment -= itemPayment
			return {
				...item,
				amount: itemPayment,
			}
		})

		setPaymentData({
			...paymentData,
			amount: adjustedAmount,
			items: updatedItems,
		})
	}

	// Process partial payment
	const handlePartialPayment = async e => {
		e.preventDefault()
		try {
			await axios.patch(`/api/borrows/${selectedBorrow._id}/partial-payment`, {
				amount: paymentData.amount,
				items: paymentData.items
					.filter(item => item.amount > 0)
					.map(item => ({
						itemId: item.itemId,
						amount: item.amount,
					})),
				paymentMethod: paymentData.paymentMethod,
				paymentDate: paymentData.paymentDate,
			})

			fetchBorrows()
			setShowPartialPaymentModal(false)
			setPaymentData({
				amount: 0,
				items: [],
				paymentMethod: 'cash',
				paymentDate: new Date().toISOString().split('T')[0],
			})
		} catch (err) {
			console.error('Error processing partial payment:', err)
			alert('Ошибка при обработке платежа')
		}
	}

	// Update borrow record
	const handleUpdate = async e => {
		e.preventDefault()
		try {
			await axios.put(`/api/borrows/${selectedBorrow._id}`, formData)
			fetchBorrows()
			setShowEditModal(false)
			setFormData({
				lenderName: '',
				returnDate: '',
				borrowDate: new Date().toISOString().split('T')[0],
				returned: false,
				items: [{ itemName: '', quantity: 1, price: 0 }],
			})
		} catch (err) {
			console.error('Error updating borrow:', err)
			alert('Ошибка при обновлении записи')
		}
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-2xl font-bold mb-8'>
				Система учета займов - {borrows.length}
			</h1>

			<div className='flex justify-end mb-6'>
				<button
					onClick={() => setShowCreateModal(true)}
					className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200'
				>
					Создать новый займ
				</button>
			</div>

			{/* Borrow List Table */}
			<div className='bg-white shadow-md rounded-lg overflow-hidden'>
				<table className='min-w-full'>
					<thead className='bg-gray-100'>
						<tr>
							<th className='py-3 px-4 text-left'>Кредитор</th>
							<th className='py-3 px-4 text-left'>Количество товаров</th>
							<th className='py-3 px-4 text-left'>Дата займа</th>
							<th className='py-3 px-4 text-left'>Общая сумма</th>
							<th className='py-3 px-4 text-left'>Остаток</th>
							<th className='py-3 px-4 text-left'>Статус</th>
							<th className='py-3 px-4 text-left'>Действия</th>
						</tr>
					</thead>
					<tbody>
						{borrows.map(borrow => (
							<tr
								key={borrow._id}
								className='border-t border-gray-200 hover:bg-gray-50'
							>
								<td className='py-3 px-4'>{borrow.lenderName}</td>
								<td className='py-3 px-4'>{borrow.items.length}</td>
								<td className='py-3 px-4'>
									{new Date(borrow.borrowDate).toLocaleDateString()}
								</td>
								<td className='py-3 px-4 font-medium'>
									{calculateBorrowTotal(borrow).toLocaleString('ru-RU', {
										style: 'currency',
										currency: 'USD',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</td>
								<td className='py-3 px-4 font-medium'>
									{calculateRemainingAmount(borrow).toLocaleString('ru-RU', {
										style: 'currency',
										currency: 'USD',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</td>
								<td className='py-3 px-4'>
									<span
										className={`px-2 py-1 rounded-full text-xs ${
											borrow.returned
												? 'bg-green-200 text-green-800'
												: 'bg-yellow-200 text-yellow-800'
										}`}
									>
										{borrow.returned
											? 'Возвращено'
											: calculateRemainingAmount(borrow) > 0
											? 'Частично оплачено'
											: 'В долгу'}
									</span>
								</td>
								<td className='py-3 px-4'>
									<button
										onClick={() => openDetailModal(borrow)}
										className='text-gray-600 hover:text-gray-800 mr-3'
										title='Просмотр'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-5 w-5'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
											/>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
											/>
										</svg>
									</button>
									<button
										onClick={() => openEditModal(borrow)}
										className='text-blue-600 hover:text-blue-800 mr-3'
										title='Редактировать'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-5 w-5'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
											/>
										</svg>
									</button>
									<button
										onClick={() => handleDelete(borrow._id)}
										className='text-red-600 hover:text-red-800 mr-3'
										title='Удалить'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-5 w-5'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
											/>
										</svg>
									</button>
									{!borrow.returned && calculateRemainingAmount(borrow) > 0 && (
										<button
											onClick={() => openPartialPaymentModal(borrow)}
											className='text-purple-600 hover:text-purple-800 mr-3'
											title='Частичная оплата'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
												/>
											</svg>
										</button>
									)}
									{!borrow.returned && (
										<button
											onClick={() => markAsReturned(borrow._id)}
											className='text-green-600 hover:text-green-800'
											title='Отметить возврат'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M5 13l4 4L19 7'
												/>
											</svg>
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Create Borrow Modal */}
			{showCreateModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
						<div className='p-6'>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-2xl font-bold'>Создание нового займа</h2>
								<button
									onClick={() => setShowCreateModal(false)}
									className='text-gray-500 hover:text-gray-700'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</button>
							</div>

							<form onSubmit={handleSubmit}>
								<div className='mb-4'>
									<label className='block text-gray-700 text-sm font-bold mb-2'>
										Имя кредитора:
									</label>
									<input
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										type='text'
										name='lenderName'
										value={formData.lenderName}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className='mb-6'>
									<label className='block text-gray-700 text-sm font-bold mb-2'>
										Дата возврата:
									</label>
									<input
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										type='date'
										name='returnDate'
										value={formData.returnDate}
										onChange={handleInputChange}
										required
									/>
								</div>

								<h3 className='text-lg font-semibold mb-3'>Товары:</h3>
								{formData.items.map((item, index) => (
									<div
										key={index}
										className='grid grid-cols-12 gap-3 mb-4 items-end'
									>
										<div className='col-span-7'>
											<label className='block text-gray-700 text-sm font-bold mb-2'>
												Название товара
											</label>
											<input
												className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
												type='text'
												name='itemName'
												value={item.itemName}
												onChange={e => handleItemChange(index, e)}
												required
											/>
										</div>
										<div className='col-span-2'>
											<label className='block text-gray-700 text-sm font-bold mb-2'>
												Цена
											</label>
											<input
												className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
												type='number'
												name='price'
												min='0'
												step='1'
												value={item.price}
												onChange={e => handleItemChange(index, e)}
												required
											/>
										</div>
										<div className='col-span-2'>
											<label className='block text-gray-700 text-sm font-bold mb-2'>
												Количество
											</label>
											<input
												className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
												type='number'
												name='quantity'
												min='1'
												value={item.quantity}
												onChange={e => handleItemChange(index, e)}
												required
											/>
										</div>
										<div className='col-span-1'>
											{formData.items.length > 1 && (
												<button
													type='button'
													onClick={() => removeItemRow(index)}
													className='bg-red-500 hover:bg-red-600 text-white p-2 rounded-md'
												>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														className='h-4 w-4'
														fill='none'
														viewBox='0 0 24 24'
														stroke='currentColor'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
														/>
													</svg>
												</button>
											)}
										</div>
									</div>
								))}

								<div className='bg-gray-50 p-4 rounded-lg mb-4'>
									<div className='flex justify-between font-bold text-lg'>
										<span>Общая сумма:</span>
										<span>
											{calculateFormTotal().toLocaleString('ru-RU', {
												style: 'currency',
												currency: 'USD',
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</span>
									</div>
								</div>

								<div className='flex justify-between mt-6'>
									<button
										type='button'
										onClick={addItemRow}
										className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md flex items-center'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-5 w-5 mr-1'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 6v6m0 0v6m0-6h6m-6 0H6'
											/>
										</svg>
										Добавить товар
									</button>

									<div className='space-x-3'>
										<button
											type='button'
											onClick={() => setShowCreateModal(false)}
											className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md'
										>
											Отмена
										</button>
										<button
											type='submit'
											className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md'
										>
											Сохранить
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Edit Borrow Modal */}
			{showEditModal && selectedBorrow && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
						<div className='p-6'>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-2xl font-bold'>Редактирование займа</h2>
								<button
									onClick={() => setShowEditModal(false)}
									className='text-gray-500 hover:text-gray-700'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</button>
							</div>

							<form onSubmit={handleUpdate}>
								<div className='mb-4'>
									<label className='block text-gray-700 text-sm font-bold mb-2'>
										Имя кредитора:
									</label>
									<input
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										type='text'
										name='lenderName'
										value={formData.lenderName}
										onChange={handleInputChange}
										required
									/>
								</div>

								<div className='mb-6'>
									<label className='block text-gray-700 text-sm font-bold mb-2'>
										Дата возврата:
									</label>
									<input
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										type='date'
										name='returnDate'
										value={formData.returnDate}
										onChange={handleInputChange}
										required
									/>
								</div>

								<h3 className='text-lg font-semibold mb-3'>Товары:</h3>
								{formData.items.map((item, index) => (
									<div
										key={index}
										className='grid grid-cols-12 gap-3 mb-4 items-end'
									>
										<div className='col-span-7'>
											<label className='block text-gray-700 text-sm font-bold mb-2'>
												Название товара
											</label>
											<input
												className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
												type='text'
												name='itemName'
												value={item.itemName}
												onChange={e => handleItemChange(index, e)}
												required
											/>
										</div>
										<div className='col-span-2'>
											<label className='block text-gray-700 text-sm font-bold mb-2'>
												Цена
											</label>
											<input
												className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
												type='number'
												name='price'
												min='0'
												step='1'
												value={item.price}
												onChange={e => handleItemChange(index, e)}
												required
											/>
										</div>
										<div className='col-span-2'>
											<label className='block text-gray-700 text-sm font-bold mb-2'>
												Количество
											</label>
											<input
												className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
												type='number'
												name='quantity'
												min='1'
												value={item.quantity}
												onChange={e => handleItemChange(index, e)}
												required
											/>
										</div>
										<div className='col-span-1'>
											{formData.items.length > 1 && (
												<button
													type='button'
													onClick={() => removeItemRow(index)}
													className='bg-red-500 hover:bg-red-600 text-white p-2 rounded-md'
												>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														className='h-4 w-4'
														fill='none'
														viewBox='0 0 24 24'
														stroke='currentColor'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
														/>
													</svg>
												</button>
											)}
										</div>
									</div>
								))}

								<div className='bg-gray-50 p-4 rounded-lg mb-4'>
									<div className='flex justify-between font-bold text-lg'>
										<span>Общая сумма:</span>
										<span>
											{calculateFormTotal().toLocaleString('ru-RU', {
												style: 'currency',
												currency: 'USD',
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</span>
									</div>
								</div>

								<div className='flex justify-between mt-6'>
									<button
										type='button'
										onClick={addItemRow}
										className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md flex items-center'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-5 w-5 mr-1'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 6v6m0 0v6m0-6h6m-6 0H6'
											/>
										</svg>
										Добавить товар
									</button>

									<div className='space-x-3'>
										<button
											type='button'
											onClick={() => setShowEditModal(false)}
											className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md'
										>
											Отмена
										</button>
										<button
											type='submit'
											className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md'
										>
											Сохранить
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Partial Payment Modal */}
			{showPartialPaymentModal && selectedBorrow && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
						<div className='p-6'>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-2xl font-bold'>Частичная оплата займа</h2>
								<button
									onClick={() => setShowPartialPaymentModal(false)}
									className='text-gray-500 hover:text-gray-700'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</button>
							</div>

							<form onSubmit={handlePartialPayment}>
								<div className='mb-6'>
									<label className='block text-gray-700 text-sm font-bold mb-2'>
										Общая сумма к оплате:
									</label>
									<input
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										type='number'
										min='0'
										step='0.01'
										max={calculateRemainingAmount(selectedBorrow)}
										value={paymentData.amount}
										onChange={handleTotalPaymentChange}
									/>
									<p className='text-sm text-gray-500 mt-1'>
										Доступно для оплаты:{' '}
										{calculateRemainingAmount(selectedBorrow).toLocaleString(
											'ru-RU',
											{
												style: 'currency',
												currency: 'USD',
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											}
										)}
									</p>
								</div>

								<div className='mb-4'>
									<label className='block text-gray-700 text-sm font-bold mb-2'>
										Способ оплаты:
									</label>
									<select
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										name='paymentMethod'
										value={paymentData.paymentMethod}
										onChange={handlePaymentInputChange}
										required
									>
										<option value='cash'>Наличные</option>
										<option value='card'>Банковская карта</option>
										<option value='transfer'>Банковский перевод</option>
										<option value='other'>Другое</option>
									</select>
								</div>

								<div className='mb-6'>
									<label className='block text-gray-700 text-sm font-bold mb-2'>
										Дата оплаты:
									</label>
									<input
										className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										type='date'
										name='paymentDate'
										value={paymentData.paymentDate}
										onChange={handlePaymentInputChange}
										required
									/>
								</div>

								<h3 className='text-lg font-semibold mb-3'>
									Распределение оплаты по товарам:
								</h3>
								{paymentData.items.map(
									(item, index) =>
										item.remaining > 0 && (
											<div
												key={index}
												className='grid grid-cols-12 gap-3 mb-4 items-end'
											>
												<div className='col-span-5'>
													<label className='block text-gray-700 text-sm font-bold mb-2'>
														Товар
													</label>
													<p className='text-gray-900'>{item.itemName}</p>
												</div>
												<div className='col-span-3'>
													<label className='block text-gray-700 text-sm font-bold mb-2'>
														Остаток
													</label>
													<p className='text-gray-900'>
														{item.remaining.toLocaleString('ru-RU', {
															style: 'currency',
															currency: 'USD',
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})}
													</p>
												</div>
												<div className='col-span-3'>
													<label className='block text-gray-700 text-sm font-bold mb-2'>
														Сумма оплаты
													</label>
													<input
														className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
														type='number'
														min='0'
														step='0.01'
														max={item.remaining}
														value={item.amount}
														onChange={e => handleItemPaymentChange(index, e)}
													/>
												</div>
											</div>
										)
								)}

								<div className='bg-gray-50 p-4 rounded-lg mb-4'>
									<div className='flex justify-between font-bold text-lg'>
										<span>Итого к оплате:</span>
										<span>
											{paymentData.amount.toLocaleString('ru-RU', {
												style: 'currency',
												currency: 'USD',
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</span>
									</div>
								</div>

								<div className='flex justify-end mt-6 space-x-3'>
									<button
										type='button'
										onClick={() => setShowPartialPaymentModal(false)}
										className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md'
									>
										Отмена
									</button>
									<button
										type='submit'
										className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md'
										disabled={paymentData.amount <= 0}
									>
										Подтвердить оплату
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Borrow Detail Modal */}
			{showDetailModal && selectedBorrow && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
						<div className='p-6'>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-2xl font-bold'>Детали займа</h2>
								<button
									onClick={() => setShowDetailModal(false)}
									className='text-gray-500 hover:text-gray-700'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</button>
							</div>

							<div className='mb-6'>
								<h3 className='text-lg font-semibold mb-2'>
									Основная информация:
								</h3>
								<div className='grid grid-cols-2 gap-4 mb-4'>
									<div>
										<p className='text-gray-600 text-sm'>Кредитор:</p>
										<p className='font-medium'>{selectedBorrow.lenderName}</p>
									</div>
									<div>
										<p className='text-gray-600 text-sm'>Дата займа:</p>
										<p className='font-medium'>
											{new Date(selectedBorrow.borrowDate).toLocaleDateString()}
										</p>
									</div>
									<div>
										<p className='text-gray-600 text-sm'>Дата возврата:</p>
										<p className='font-medium'>
											{selectedBorrow.returnDate
												? new Date(
														selectedBorrow.returnDate
												  ).toLocaleDateString()
												: 'Не указана'}
										</p>
									</div>
									<div>
										<p className='text-gray-600 text-sm'>Статус:</p>
										<p className='font-medium'>
											<span
												className={`px-2 py-1 rounded-full text-xs ${
													selectedBorrow.returned
														? 'bg-green-200 text-green-800'
														: 'bg-yellow-200 text-yellow-800'
												}`}
											>
												{selectedBorrow.returned
													? 'Возвращено'
													: calculateRemainingAmount(selectedBorrow) > 0
													? 'Частично оплачено'
													: 'В долгу'}
											</span>
										</p>
									</div>
								</div>
							</div>

							<div className='mb-6'>
								<h3 className='text-lg font-semibold mb-3'>Товары:</h3>
								<div className='bg-gray-50 rounded-lg overflow-hidden'>
									<table className='min-w-full'>
										<thead className='bg-gray-100'>
											<tr>
												<th className='py-2 px-4 text-left'>Товар</th>
												<th className='py-2 px-4 text-left'>Цена</th>
												<th className='py-2 px-4 text-left'>Кол-во</th>
												<th className='py-2 px-4 text-left'>Сумма</th>
												<th className='py-2 px-4 text-left'>Оплачено</th>
												<th className='py-2 px-4 text-left'>Остаток</th>
											</tr>
										</thead>
										<tbody>
											{selectedBorrow.items.map((item, index) => {
												const itemTotal = item.price * item.quantity
												const paidAmount = item.paidAmount || 0
												const remaining = itemTotal - paidAmount

												return (
													<tr key={index} className='border-t border-gray-200'>
														<td className='py-2 px-4'>{item.itemName}</td>
														<td className='py-2 px-4'>
															{item.price.toLocaleString('ru-RU', {
																style: 'currency',
																currency: 'USD',
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															})}
														</td>
														<td className='py-2 px-4'>{item.quantity}</td>
														<td className='py-2 px-4 font-medium'>
															{itemTotal.toLocaleString('ru-RU', {
																style: 'currency',
																currency: 'USD',
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															})}
														</td>
														<td className='py-2 px-4'>
															{paidAmount.toLocaleString('ru-RU', {
																style: 'currency',
																currency: 'USD',
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															})}
														</td>
														<td className='py-2 px-4 font-medium'>
															{remaining.toLocaleString('ru-RU', {
																style: 'currency',
																currency: 'USD',
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															})}
														</td>
													</tr>
												)
											})}
										</tbody>
									</table>
								</div>
							</div>

							<div className='bg-gray-50 p-4 rounded-lg mb-6'>
								<div className='flex justify-between font-bold text-lg mb-2'>
									<span>Общая сумма:</span>
									<span>
										{calculateBorrowTotal(selectedBorrow).toLocaleString(
											'ru-RU',
											{
												style: 'currency',
												currency: 'USD',
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											}
										)}
									</span>
								</div>
								<div className='flex justify-between font-bold text-lg mb-2'>
									<span>Оплачено:</span>
									<span>
										{(selectedBorrow.paidAmount || 0).toLocaleString('ru-RU', {
											style: 'currency',
											currency: 'USD',
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</span>
								</div>
								<div className='flex justify-between font-bold text-lg'>
									<span>Остаток:</span>
									<span>
										{calculateRemainingAmount(selectedBorrow).toLocaleString(
											'ru-RU',
											{
												style: 'currency',
												currency: 'USD',
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											}
										)}
									</span>
								</div>
							</div>

							<div className='flex justify-end space-x-3'>
								{!selectedBorrow.returned &&
									calculateRemainingAmount(selectedBorrow) > 0 && (
										<button
											onClick={() => {
												setShowDetailModal(false)
												openPartialPaymentModal(selectedBorrow)
											}}
											className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md'
										>
											Частичная оплата
										</button>
									)}
								{!selectedBorrow.returned && (
									<button
										onClick={() => markAsReturned(selectedBorrow._id)}
										className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md'
									>
										Отметить возврат
									</button>
								)}
								<button
									onClick={() => setShowDetailModal(false)}
									className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md'
								>
									Закрыть
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default BorrowPage
