import { useState, useEffect } from 'react'
import axios from '../utils/axiosConfig'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import {
	PlusIcon,
	PencilSquareIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'

const EmployeePage = () => {
	const [employees, setEmployees] = useState([])
	const [loading, setLoading] = useState(false)
	const { user } = useAuth()
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		position: '',
		department: '',
		phone: '',
		email: '',
		salary: '',
		address: '',
		status: 'active',
	})
	const [isEditing, setIsEditing] = useState(false)
	const [currentId, setCurrentId] = useState(null)

	useEffect(() => {
		fetchEmployees()
	}, [])

	const fetchEmployees = async () => {
		setLoading(true)
		try {
			const res = await axios.get('/api/employees')
			setEmployees(res.data)
		} catch (err) {
			toast.error('Ошибка загрузки сотрудников')
		} finally {
			setLoading(false)
		}
	}

	const handleInputChange = e => {
		const { name, value } = e.target
		setFormData(prevData => ({
			...prevData,
			[name]: value,
		}))
	}

	const handleSubmit = async e => {
		e.preventDefault()
		try {
			if (isEditing) {
				await axios.put(`/api/employees/${currentId}`, formData)
				toast.success('Данные сотрудника обновлены')
			} else {
				await axios.post('/api/employees', formData)
				toast.success('Новый сотрудник добавлен')
			}
			resetForm()
			fetchEmployees()
		} catch (err) {
			toast.error(err.response?.data?.message || 'Произошла ошибка')
		}
	}

	const handleEdit = employee => {
		setFormData({
			firstName: employee.firstName,
			lastName: employee.lastName,
			position: employee.position,
			department: employee.department,
			phone: employee.phone,
			email: employee.email,
			salary: employee.salary,
			address: employee.address,
			status: employee.status || 'active',
		})
		setIsEditing(true)
		setCurrentId(employee._id)
	}

	const handleDelete = async id => {
		if (window.confirm('Вы действительно хотите удалить этого сотрудника?')) {
			let pass = prompt('Пароль')
			try {
				await axios.post(`/api/employees/delete`, { id, pass, user })
				toast.success('Сотрудник удален')
				fetchEmployees()
			} catch (err) {
				toast.error('Ошибка при удалении')
			}
		}
	}

	const resetForm = () => {
		setFormData({
			firstName: '',
			lastName: '',
			position: '',
			department: '',
			phone: '',
			email: '',
			salary: '',
			address: '',
			status: 'active',
		})
		setIsEditing(false)
		setCurrentId(null)
	}

	return (
		<div className='container mx-auto px-4 py-6'>
			<h1 className='text-2xl font-bold text-gray-800 mb-6'>
				Управление сотрудниками
			</h1>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2'>
					<div className='bg-white shadow rounded-lg overflow-hidden'>
						<div className='px-6 py-4 border-b flex justify-between items-center'>
							<h2 className='text-lg font-medium'>
								Список сотрудников - {employees.length}
							</h2>
						</div>
						<div className='overflow-x-auto'>
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Имя
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Должность
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Отдел
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Статус
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
											Действия
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{employees.map(employee => (
										<tr key={employee._id}>
											<td className='px-6 py-4 whitespace-nowrap'>
												{employee.firstName} {employee.lastName}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{employee.position}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{employee.department}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<span
													className={`px-2 py-1 text-xs rounded-full ${
														employee.status === 'active'
															? 'bg-green-100 text-green-800'
															: employee.status === 'on_leave'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-red-100 text-red-800'
													}`}
												>
													{employee.status === 'active'
														? 'Активен'
														: employee.status === 'on_leave'
														? 'В отпуске'
														: 'Уволен'}
												</span>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
												<button
													onClick={() => handleEdit(employee)}
													className='text-blue-600 hover:text-blue-900 mr-3'
												>
													<PencilSquareIcon className='h-5 w-5 inline' />
												</button>
												<button
													onClick={() => handleDelete(employee._id)}
													className='text-red-600 hover:text-red-900'
												>
													<TrashIcon className='h-5 w-5 inline' />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className='bg-white shadow rounded-lg p-6'>
					<h2 className='text-lg font-medium mb-4'>
						{isEditing ? 'Редактирование сотрудника' : 'Добавление сотрудника'}
					</h2>
					<form onSubmit={handleSubmit}>
						<div className='grid grid-cols-2 gap-4 mb-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Имя
								</label>
								<input
									type='text'
									name='firstName'
									value={formData.firstName}
									onChange={handleInputChange}
									className='w-full border rounded px-3 py-2'
									required
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Фамилия
								</label>
								<input
									type='text'
									name='lastName'
									value={formData.lastName}
									onChange={handleInputChange}
									className='w-full border rounded px-3 py-2'
									required
								/>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4 mb-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Должность
								</label>
								<input
									type='text'
									name='position'
									value={formData.position}
									onChange={handleInputChange}
									className='w-full border rounded px-3 py-2'
									required
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Отдел
								</label>
								<input
									type='text'
									name='department'
									value={formData.department}
									onChange={handleInputChange}
									className='w-full border rounded px-3 py-2'
									required
								/>
							</div>
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
								Email
							</label>
							<input
								type='email'
								name='email'
								value={formData.email}
								onChange={handleInputChange}
								className='w-full border rounded px-3 py-2'
								required
							/>
						</div>

						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Зарплата ($)
							</label>
							<input
								type='number'
								name='salary'
								value={formData.salary}
								onChange={handleInputChange}
								className='w-full border rounded px-3 py-2'
								required
							/>
						</div>

						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Адрес
							</label>
							<textarea
								name='address'
								value={formData.address}
								onChange={handleInputChange}
								className='w-full border rounded px-3 py-2'
								rows='2'
							/>
						</div>

						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Статус
							</label>
							<select
								name='status'
								value={formData.status}
								onChange={handleInputChange}
								className='w-full border rounded px-3 py-2'
							>
								<option value='active'>Активен</option>
								<option value='on_leave'>В отпуске</option>
								<option value='terminated'>Уволен</option>
							</select>
						</div>

						<div className='flex justify-end space-x-3'>
							{isEditing && (
								<button
									type='button'
									onClick={resetForm}
									className='px-4 py-2 border border-gray-300 rounded text-gray-700'
								>
									Отмена
								</button>
							)}
							<button
								type='submit'
								className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center'
							>
								<PlusIcon className='h-5 w-5 mr-1' />
								{isEditing ? 'Сохранить' : 'Добавить'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default EmployeePage
