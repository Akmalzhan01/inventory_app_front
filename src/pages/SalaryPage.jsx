import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from '../utils/axiosConfig'
import { toast } from 'react-toastify'
import {
	PlusIcon,
	TrashIcon,
	UserIcon,
	ArrowPathIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'

const SalaryPage = () => {
	const { user } = useAuth()
	const [salaries, setSalaries] = useState([])
	const [employees, setEmployees] = useState([])
	const [loading, setLoading] = useState(false)
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
	const [selectedPaymentMonth, setSelectedPaymentMonth] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [currentSalary, setCurrentSalary] = useState(null)
	const [isProcessing, setIsProcessing] = useState(false)

	const [formData, setFormData] = useState({
		employee: {
			id: '',
			firstName: '',
			position: '',
		},
		amount: '',
		bonus: '',
		deductions: '',
		paymentDate: formatDate(new Date()),
		notes: '',
	})

	// Форматирование даты в YYYY-MM-DD
	function formatDate(date) {
		const d = new Date(date)
		let month = '' + (d.getMonth() + 1)
		let day = '' + d.getDate()
		const year = d.getFullYear()

		if (month.length < 2) month = '0' + month
		if (day.length < 2) day = '0' + day

		return [year, month, day].join('-')
	}

	useEffect(() => {
		fetchEmployees()
		fetchSalaries()
	}, [selectedYear, selectedMonth, selectedPaymentMonth])

	const fetchEmployees = async () => {
		try {
			const res = await axios.get('/api/employees')
			setEmployees(res.data)
		} catch (err) {
			toast.error('Не удалось загрузить список сотрудников')
		}
	}

	const fetchSalaries = async () => {
		setLoading(true)
		try {
			const params = {
				year: selectedYear,
				month: selectedMonth,
				paymentMonth: selectedPaymentMonth,
			}

			const res = await axios.get('/api/salaries', { params })
			setSalaries(res.data)
		} catch (err) {
			toast.error('Не удалось загрузить данные о зарплатах')
		} finally {
			setLoading(false)
		}
	}

	const handleInputChange = e => {
		const { name, value } = e.target

		if (name.startsWith('employee.')) {
			const field = name.split('.')[1]
			setFormData(prev => ({
				...prev,
				employee: {
					...prev.employee,
					[field]: value,
				},
			}))
		} else {
			setFormData(prev => ({
				...prev,
				[name]: value,
			}))
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setIsProcessing(true)

		try {
			const selectedEmployee = employees.find(
				emp => emp._id === formData.employee.id
			)

			const payload = {
				employee: {
					id: formData.employee.id,
					firstName: selectedEmployee.firstName,
					position: selectedEmployee.position,
				},
				year: selectedYear,
				month: selectedMonth,
				amount: formData.amount,
				bonus: formData.bonus,
				deductions: formData.deductions,
				netSalary: calculateNetSalary(formData),
				paymentDate: formData.paymentDate,
				notes: formData.notes,
				createdBy: user._id,
			}

			if (currentSalary) {
				// Обновление существующей записи
				await axios.put(`/api/salaries/${currentSalary._id}`, payload)
				toast.success('Зарплата успешно обновлена')
			} else {
				// Создание новой записи
				await axios.post('/api/salaries', payload)
				toast.success('Зарплата успешно добавлена')
			}

			closeModal()
			fetchSalaries()
		} catch (err) {
			toast.error(err.response?.data?.message || 'Ошибка сохранения данных')
		} finally {
			setIsProcessing(false)
		}
	}

	const handleDelete = async id => {
		window.confirm('Вы уверены, что хотите удалить эту запись о зарплате?')
		let pass = prompt('Пароль')

		try {
			await axios.post(`/api/salaries/delete`, { id, pass, user })
			toast.success('Запись о зарплате удалена')
			fetchSalaries()
		} catch (err) {
			toast.error('Не удалось удалить запись')
		}
	}

<<<<<<< HEAD
	const openModal = () => {
		setIsModalOpen(true)
	}
=======
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись о зарплате?')) {
      try {
        await axios.delete(`/api/salaries/${id}`);
        toast.success('Запись о зарплате удалена');
        fetchSalaries();
      } catch {
        toast.error('Не удалось удалить запись');
      }
    }
  };
>>>>>>> 1d0cf1dd7001aadbc7d98c3aa3094d96959cccbb

	const closeModal = () => {
		setIsModalOpen(false)
		setCurrentSalary(null)
		setFormData({
			employee: {
				id: '',
				firstName: '',
				position: '',
			},
			amount: '',
			bonus: '',
			deductions: '',
			paymentDate: formatDate(new Date()),
			notes: '',
		})
	}

	const calculateNetSalary = data => {
		const base = parseFloat(data.amount) || 0
		const bonus = parseFloat(data.bonus) || 0
		const deductions = parseFloat(data.deductions) || 0
		return (base + bonus - deductions).toFixed(2)
	}

	// Расчет итоговых значений
	const calculateTotals = () => {
		return salaries.reduce(
			(acc, salary) => {
				acc.amount += salary.amount || 0
				acc.bonus += parseFloat(salary.bonus) || 0
				acc.deductions += parseFloat(salary.deductions) || 0
				acc.netSalary += parseFloat(calculateNetSalary(salary)) || 0
				return acc
			},
			{
				amount: 0,
				bonus: 0,
				deductions: 0,
				netSalary: 0,
			}
		)
	}

	const totals = calculateTotals()

	const years = Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i)
	const months = Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		name: new Date(0, i).toLocaleString('ru', { month: 'long' }),
	}))

	return (
		<div className='container mx-auto px-4 py-6'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
				<h1 className='text-2xl font-bold text-gray-800'>
					Управление зарплатами
				</h1>

				<div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
					<div className='flex gap-2'>
						<select
							value={selectedYear}
							onChange={e => setSelectedYear(parseInt(e.target.value))}
							className='border rounded px-3 py-2 text-sm'
						>
							<option value=''>Yil</option>
							{years.map(year => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>

						<select
							value={selectedPaymentMonth}
							onChange={e => setSelectedPaymentMonth(e.target.value)}
							className='border rounded px-3 py-2 text-sm'
						>
							<option value=''>To'lov oyi</option>
							{months.map(month => (
								<option key={month.value} value={month.value}>
									{month.name.charAt(0).toUpperCase() + month.name.slice(1)}
								</option>
							))}
						</select>
					</div>

<<<<<<< HEAD
					<button
						onClick={openModal}
						className='bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors'
					>
						<PlusIcon className='h-5 w-5' />
						Добавить зарплату
					</button>
				</div>
			</div>
=======
            <select
              value={selectedPaymentMonth}
              onChange={(e) => setSelectedPaymentMonth(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">To&apos;lov oyi</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.name.charAt(0).toUpperCase() + month.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
>>>>>>> 1d0cf1dd7001aadbc7d98c3aa3094d96959cccbb

			<div className='bg-white shadow rounded-lg overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='min-w-full divide-y divide-gray-200'>
						<thead className='bg-gray-50'>
							<tr>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Сотрудник
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Должность
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Базовая зарплата
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Бонусы
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Удержания
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Итого к выплате
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									To'lov sanasi
								</th>
								<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Действия
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-200'>
							{salaries.length > 0 ? (
								<>
									{salaries.map(salary => (
										<tr key={salary._id} className='hover:bg-gray-50'>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex items-center'>
													<UserIcon className='h-5 w-5 text-gray-400 mr-2' />
													<div className='font-medium'>
														{salary.employee.firstName}
													</div>
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
												{salary.employee.position}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												${salary.amount}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												${(salary.bonus || 0).toFixed(2)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												${(salary.deductions || 0).toFixed(2)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap font-semibold'>
												${calculateNetSalary(salary)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{new Date(salary.paymentDate).toLocaleDateString(
													'uz-UZ'
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
												<div className='flex justify-end gap-2'>
													{/* <button
                            onClick={() => handleEdit(salary)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Редактировать"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button> */}
													<button
														onClick={() => handleDelete(salary._id)}
														className='text-red-600 hover:text-red-900'
														title='Удалить'
													>
														<TrashIcon className='h-5 w-5' />
													</button>
												</div>
											</td>
										</tr>
									))}

<<<<<<< HEAD
									{/* Итоговая строка */}
									<tr className='bg-gray-50 font-semibold'>
										<td className='px-6 py-4 whitespace-nowrap' colSpan='2'>
											Итого за {months[selectedMonth - 1]?.name} {selectedYear}:
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											${totals.amount}
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											${totals.bonus.toFixed(2)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											${totals.deductions.toFixed(2)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-blue-600'>
											${totals.netSalary.toFixed(2)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap' colSpan='2'>
											{/* Пустое пространство для выравнивания */}
										</td>
									</tr>
								</>
							) : (
								<tr>
									<td
										className='px-6 py-4 text-center text-gray-500'
										colSpan='8'
									>
										{loading
											? 'Загрузка данных...'
											: 'Нет данных о зарплатах за выбранный период'}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
=======
                  {/* Итоговая строка */}
                  <tr className="bg-gray-50 font-semibold">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <td className="px-6 py-4 whitespace-nowrap" colSpan="2">
                      Итого за {months[selectedMonth - 1]?.name} {selectedYear}:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${totals.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${totals.bonus.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${totals.deductions.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600">
                      ${totals.netSalary.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" colSpan="2">
                      {/* Пустое пространство для выравнивания */}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td className="px-6 py-4 text-center text-gray-500" colSpan="8">
                    {loading ? "Загрузка данных&hellip;" : "Нет данных о зарплатах за выбранный период"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
>>>>>>> 1d0cf1dd7001aadbc7d98c3aa3094d96959cccbb

			{/* Модальное окно добавления/редактирования зарплаты */}
			{isModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
						<div className='flex justify-between items-center border-b px-6 py-4'>
							<h3 className='text-lg font-medium'>
								{currentSalary
									? 'Редактировать зарплату'
									: 'Добавить новую зарплату'}
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
									Сотрудник
								</label>
								<select
									name='employee'
									value={formData.employee.id}
									onChange={e => {
										const selectedEmployee = employees.find(
											emp => emp._id === e.target.value
										)
										setFormData({
											...formData,
											employee: {
												id: e.target.value,
												firstName: selectedEmployee.firstName,
												position: selectedEmployee.position,
											},
										})
									}}
									className='w-full border rounded px-3 py-2'
									required
									disabled={!!currentSalary}
								>
									<option value=''>Tanlang...</option>
									{employees.map(employee => (
										<option key={employee._id} value={employee._id}>
											{employee.firstName} - {employee.position}
										</option>
									))}
								</select>
							</div>

							<div className='grid grid-cols-2 gap-4 mb-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Базовая зарплата ($)
									</label>
									<input
										type='number'
										name='amount'
										value={formData.amount}
										onChange={handleInputChange}
										className='w-full border rounded px-3 py-2'
										step='0.01'
										min='0'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Дата выплаты
									</label>
									<input
										type='date'
										name='paymentDate'
										value={formData.paymentDate}
										onChange={handleInputChange}
										className='w-full border rounded px-3 py-2'
										required
									/>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4 mb-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Бонусы ($)
									</label>
									<input
										type='number'
										name='bonus'
										value={formData.bonus}
										onChange={handleInputChange}
										className='w-full border rounded px-3 py-2'
										step='0.01'
										min='0'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Удержания ($)
									</label>
									<input
										type='number'
										name='deductions'
										value={formData.deductions}
										onChange={handleInputChange}
										className='w-full border rounded px-3 py-2'
										step='0.01'
										min='0'
									/>
								</div>
							</div>

							<div className='mb-4 p-3 bg-gray-50 rounded'>
								<p className='text-sm text-gray-600'>Итого к выплате:</p>
								<p className='text-lg font-semibold'>
									${calculateNetSalary(formData)}
								</p>
							</div>

							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Примечания
								</label>
								<textarea
									name='notes'
									value={formData.notes}
									onChange={handleInputChange}
									className='w-full border rounded px-3 py-2'
									rows='3'
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
									) : currentSalary ? (
										'Сохранить изменения'
									) : (
										'Добавить зарплату'
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

export default SalaryPage
