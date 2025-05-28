import { useState, useEffect } from 'react'
import axios from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'
import {
	PlusIcon,
	PencilIcon,
	TrashIcon,
	XMarkIcon,
	CheckIcon,
	ArrowPathIcon,
	UsersIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

const Customers = () => {
	const [customers, setCustomers] = useState([])
	const [loading, setLoading] = useState(true)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [currentCustomer, setCurrentCustomer] = useState(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const { user } = useAuth()

	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		creditLimit: 0,
	})

	useEffect(() => {
		fetchCustomers()
	}, [])

	const fetchCustomers = async () => {
		try {
			const { data } = await axios.get('/api/customers', {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			})
			setCustomers(data)
			setLoading(false)
		} catch (error) {
			console.error('Ошибка загрузки клиентов:', error)
			toast.error('Не удалось загрузить клиентов')
			setLoading(false)
		}
	}

	const handleInputChange = e => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: name === 'creditLimit' ? parseFloat(value) || 0 : value,
		}))
	}

	const openCreateModal = () => {
		setCurrentCustomer(null)
		setFormData({
			name: '',
			phone: '',
			creditLimit: 0,
		})
		setIsModalOpen(true)
	}

	const openEditModal = customer => {
		setCurrentCustomer(customer)
		setFormData({
			name: customer.name,
			phone: customer.phone,
			creditLimit: customer.creditLimit,
		})
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setCurrentCustomer(null)
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setIsProcessing(true)

		try {
			if (currentCustomer) {
				// Обновление существующего клиента
				await axios.put(
					`https://inventory-app-theta-two.vercel.app/api/customers/${currentCustomer._id}`,
					formData,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					}
				)
				toast.success('Клиент успешно обновлен')
			} else {
				// Создание нового клиента
				await axios.post(
					'https://inventory-app-theta-two.vercel.app/api/customers',
					formData,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					}
				)
				toast.success('Клиент успешно создан')
			}

			fetchCustomers()
			closeModal()
		} catch (error) {
			console.error('Ошибка сохранения клиента:', error)
			toast.error(error.response?.data?.message || 'Ошибка сохранения клиента')
		} finally {
			setIsProcessing(false)
		}
	}

	const handleDelete = async id => {
		if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
			let pass = prompt('Пароль')
			try {
				await axios.post(`/api/customers/delete`, { id, pass, user })
				toast.success('Клиент успешно удален')
				fetchCustomers()
			} catch (error) {
				console.error('Ошибка удаления клиента:', error)
				toast.error('Не удалось удалить клиента')
			}
		}
	}

	if (!user || user.role !== 'admin') {
		return null
	}

	return (
		<div className='p-6'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold text-gray-800'>
					Клиенты - {customers.length}
				</h1>
				<button
					onClick={openCreateModal}
					className='bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors'
				>
					<PlusIcon className='h-5 w-5' />
					Добавить клиента
				</button>
			</div>

			{loading ? (
				<div className='flex justify-center items-center h-64'>
					<ArrowPathIcon className='h-12 w-12 text-gray-400 animate-spin' />
				</div>
			) : (
				<div className='bg-white shadow-md rounded-lg overflow-hidden'>
					<table className='min-w-full'>
						<thead className='bg-gray-50'>
							<tr>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Имя
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Телефон
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Кредитный лимит
								</th>
								<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Действия
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-200'>
							{customers.map(customer => (
								<tr key={customer._id} className='hover:bg-gray-50'>
									<td className='px-6 py-4 whitespace-nowrap flex'>
										<UsersIcon className='h-5 w-5 text-neutral-400 mr-3' />
										{customer.name}
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										{customer.phone}
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										{customer.creditLimit.toLocaleString()} $
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-right'>
										<div className='flex justify-end gap-2'>
											<button
												onClick={() => openEditModal(customer)}
												className='text-blue-600 hover:text-blue-900 p-1'
												title='Редактировать'
											>
												<PencilIcon className='h-5 w-5' />
											</button>
											<button
												onClick={() => handleDelete(customer._id)}
												className='text-red-600 hover:text-red-900 p-1'
												title='Удалить'
											>
												<TrashIcon className='h-5 w-5' />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Модальное окно клиента */}
			{isModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
						<div className='flex justify-between items-center border-b px-6 py-4'>
							<h3 className='text-lg font-medium'>
								{currentCustomer
									? 'Редактировать клиента'
									: 'Добавить нового клиента'}
							</h3>
							<button
								onClick={closeModal}
								className='text-gray-500 hover:text-gray-700'
							>
								<XMarkIcon className='h-6 w-6' />
							</button>
						</div>

						<form onSubmit={handleSubmit} className='p-6'>
							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Имя
								</label>
								<input
									type='text'
									name='name'
									value={formData.name}
									onChange={handleInputChange}
									className='w-full border rounded px-3 py-2'
									required
								/>
							</div>

							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Телефон
								</label>
								<input
									type='tel'
									name='phone'
									value={formData.phone}
									onChange={handleInputChange}
									className='w-full border rounded px-3 py-2'
									required
								/>
							</div>

							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Кредитный лимит ($)
								</label>
								<input
									type='number'
									name='creditLimit'
									value={formData.creditLimit}
									onChange={handleInputChange}
									className='w-full border rounded px-3 py-2'
									min='0'
									step='0.01'
									required
								/>
							</div>

							<div className='flex justify-end gap-3'>
								<button
									type='button'
									onClick={closeModal}
									className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
									disabled={isProcessing}
								>
									Отмена
								</button>
								<button
									type='submit'
									className='px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-400'
									disabled={isProcessing}
								>
									{isProcessing ? (
										<>
											<ArrowPathIcon className='h-5 w-5 animate-spin' />
											Обработка...
										</>
									) : (
										<>
											<CheckIcon className='h-5 w-5' />
											{currentCustomer ? 'Обновить' : 'Создать'}
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default Customers
