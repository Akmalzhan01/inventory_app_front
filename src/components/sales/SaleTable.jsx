import { useState, useEffect } from 'react'
import axios from '../../utils/axiosConfig'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import {
	TrashIcon,
	EyeIcon,
	CurrencyDollarIcon,
	CreditCardIcon,
	XMarkIcon,
	PrinterIcon,
	MagnifyingGlassIcon,
	ArrowPathIcon,
} from '@heroicons/react/24/outline'

const SaleTable = () => {
	const { user } = useAuth()
	const [sales, setSales] = useState([])
	const [filteredSales, setFilteredSales] = useState([])
	const [loading, setLoading] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedSale, setSelectedSale] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const salesPerPage = 10

	// Загрузка продаж
	useEffect(() => {
		fetchSales()
	}, [])

	// Фильтрация по поиску
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredSales(sales)
		} else {
			const filtered = sales.filter(sale => {
				const searchLower = searchTerm.toLowerCase()
				const saleDate = format(new Date(sale.saleDate), 'dd.MM.yyyy')
				const invoiceNumber = sale.invoiceNumber?.toLowerCase() || ''

				return (
					sale.customer?.name?.toLowerCase().includes(searchLower) ||
					sale._id.toLowerCase().includes(searchLower) ||
					invoiceNumber.includes(searchLower) ||
					sale.items.some(item =>
						item.product?.name?.toLowerCase().includes(searchLower)
					) ||
					sale.total.toString().includes(searchTerm) ||
					saleDate.includes(searchTerm)
				)
			})
			setFilteredSales(filtered)
		}
		setCurrentPage(1)
	}, [searchTerm, sales])

	// Получение продаж из API
	const fetchSales = async () => {
		try {
			setLoading(true)
			const response = await axios.get('/api/sales')
			// Адаптация структуры из backend
			const formattedSales = response.data.sales.map(sale => ({
				...sale,
				grandTotal: sale.total, // переносим total в grandTotal
				items: sale.items.map(item => ({
					...item,
					name: item.product?.name || 'Неизвестный товар',
					price: item.price || item.product?.price || 0,
				})),
			}))
			setSales(formattedSales)
			setFilteredSales(formattedSales)
		} catch (error) {
			toast.error('Ошибка при загрузке продаж')
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	// Открытие модального окна
	const openModal = sale => {
		setSelectedSale(sale)
		setIsModalOpen(true)
	}

	// Закрытие модального окна
	const closeModal = () => {
		setIsModalOpen(false)
		setSelectedSale(null)
	}

	// Отмена продажи
	const cancelSale = async saleId => {
		if (!window.confirm('Вы действительно хотите отменить эту продажу?')) return
		let pass = prompt('Подтвердите пароль.')
		try {
			setLoading(true)
			await axios.post(
				`/api/sales/delete`,
				{ saleId, pass, user },
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				}
			)
			setSales(sales.filter(sale => sale._id !== saleId))
			toast.success('Продажа успешно отменена')
		} catch (error) {
			toast.error(error.response?.data?.message || 'Ошибка при отмене продажи')
		} finally {
			setLoading(false)
		}
	}

	const addPayment = async saleId => {
		const sale = sales.find(s => s._id === saleId)
		if (!sale) return

		const remaining = sale.total - sale.paidAmount
		const amount = parseFloat(
			prompt(
				`Введите сумму платежа (максимум ${remaining.toFixed(2)} $):`,
				remaining.toFixed(2)
			)
		)

		if (!amount || isNaN(amount)) {
			toast.warning('Введена некорректная сумма')
			return
		}

		if (amount <= 0 || amount > remaining) {
			toast.warning(`Сумма должна быть между 0 и ${remaining.toFixed(2)}`)
			return
		}

		try {
			setLoading(true)

			// Подготовка данных платежа
			const paymentData = {
				amount: amount,
				paymentMethod: 'cash',
				// Добавляем необходимые поля
				grandTotal: sale.total, // Отправляем grandTotal в backend
				items: sale.items.map(item => ({
					...item,
					name: item.name || item.product?.name || 'Неизвестный товар', // Обеспечиваем наличие поля name
				})),
			}

			const { data } = await axios.put(
				`/api/sales/${saleId}/pay`,
				paymentData, // Отправляем подготовленные данные
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				}
			)

			// Сохраняем обновленную продажу
			const updatedSale = {
				...data,
				grandTotal: data.total,
				items: data.items.map(item => ({
					...item,
					name: item.name || item.product?.name || 'Неизвестный товар',
				})),
			}

			setSales(sales.map(s => (s._id === saleId ? updatedSale : s)))
			toast.success(`${amount.toFixed(2)} $ успешно оплачено`)
		} catch (error) {
			console.error('Ошибка платежа:', error.response?.data)
			toast.success('Платеж выполнен')
			fetchSales()
		} finally {
			setLoading(false)
		}
	}

	// Печать чека
	const printReceipt = () => {
		if (!selectedSale) return

		const printWindow = window.open('', '_blank')
		printWindow.document.write(`
      <html>
        <head>
          <title>Чек #${
						selectedSale.invoiceNumber ||
						selectedSale._id.slice(-6).toUpperCase()
					}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ЧЕК</h1>
            <h2>#${
							selectedSale.invoiceNumber ||
							selectedSale._id.slice(-6).toUpperCase()
						}</h2>
          </div>

          <div class="info">
            <p><strong>Дата:</strong> ${format(
							new Date(selectedSale.saleDate),
							'dd/MM/yyyy HH:mm'
						)}</p>
            <p><strong>Клиент:</strong> ${
							selectedSale.customer?.name || 'Клиент не указан'
						}</p>
            <p><strong>Продавец:</strong> ${
							selectedSale.seller?.name || 'Система'
						}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Товар</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${selectedSale.items
								.map(
									(item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
								)
								.join('')}
            </tbody>
          </table>

          <table class="summary">
            <tr>
              <td>Итого:</td>
              <td>${selectedSale.total.toFixed(2)} $</td>	
            </tr>
            ${
							selectedSale.isCredit
								? `
            <tr>
              <td>Оплачено:</td>
              <td>${selectedSale.paidAmount.toFixed(2)} $</td>
            </tr>
            <tr class="total-row">
              <td>Остаток:</td>
              <td>${(selectedSale.total - selectedSale.paidAmount).toFixed(
								2
							)} $</td>
            </tr>
            `
								: ''
						}
          </table>

          <div class="footer">
            <p>Дата печати: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            <p>Спасибо за покупку!</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `)
		printWindow.document.close()
	}

	// Пагинация
	const indexOfLastSale = currentPage * salesPerPage
	const indexOfFirstSale = indexOfLastSale - salesPerPage
	const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale)
	const totalPages = Math.ceil(filteredSales.length / salesPerPage)

	// Обновление данных
	const refreshData = () => {
		fetchSales()
	}

	return (
		<div className='bg-white rounded-lg shadow-md overflow-hidden'>
			{/* Поиск и управление */}
			<div className='px-6 py-4 border-b flex justify-between items-center'>
				<div className='relative rounded-md shadow-sm w-1/2'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
					</div>
					<input
						type='text'
						className='focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-2 border-gray-300 rounded-md'
						placeholder='Поиск по клиенту, номеру чека, товару...'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
					/>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm('')}
							className='absolute inset-y-0 right-0 pr-3 flex items-center'
						>
							<XMarkIcon className='h-5 w-5 text-gray-400 hover:text-gray-500' />
						</button>
					)}
				</div>
				<div className='flex items-center space-x-2'>
					<button
						onClick={refreshData}
						className='p-2 text-gray-600 hover:text-blue-600'
						title='Обновить'
					>
						<ArrowPathIcon
							className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
						/>
					</button>
					<span className='text-sm text-gray-500'>
						Показано {filteredSales.length} продаж
					</span>
				</div>
			</div>

			{/* Таблица продаж */}
			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50'>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Дата
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Номер чека
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Клиент
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Товары
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Итого
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Статус
							</th>
							<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Действия
							</th>
						</tr>
					</thead>
					<tbody className='bg-white divide-y divide-gray-200'>
						{currentSales.length > 0 ? (
							currentSales.map(sale => (
								<tr key={sale._id} className='hover:bg-gray-50'>
									<td className='px-6 py-4 whitespace-nowrap'>
										{format(new Date(sale.saleDate), 'dd/MM/yyyy HH:mm')}
									</td>
									<td className='px-6 py-4 whitespace-nowrap font-mono text-sm'>
										{sale.invoiceNumber || sale._id.slice(-6).toUpperCase()}
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										{sale.customer?.name || 'Неизвестный клиент'}
									</td>
									<td className='px-6 py-4'>
										<div className='flex flex-wrap gap-1'>
											{sale.items.slice(0, 3).map((item, idx) => (
												<span
													key={idx}
													className='bg-gray-100 px-2 py-1 rounded text-sm'
												>
													{item.name} × {item.quantity}
												</span>
											))}
											{sale.items.length > 3 && (
												<span className='bg-gray-100 px-2 py-1 rounded text-sm'>
													+{sale.items.length - 3} шт.
												</span>
											)}
										</div>
									</td>
									<td className='px-6 py-4 whitespace-nowrap font-medium'>
										{sale.total.toFixed(2)} $
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												sale.status === 'cancelled'
													? 'bg-red-100 text-red-800'
													: sale.isCredit
													? sale.paidAmount >= sale.total
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
													: 'bg-blue-100 text-blue-800'
											}`}
										>
											{sale.status === 'cancelled' ? (
												'Отменена'
											) : sale.isCredit ? (
												sale.paidAmount >= sale.total ? (
													<>
														<CurrencyDollarIcon className='h-3 w-3 mr-1' />
														Оплачено
													</>
												) : (
													<>
														<CreditCardIcon className='h-3 w-3 mr-1' />
														Долг: {(sale.total - sale.paidAmount).toFixed(2)} $
													</>
												)
											) : (
												<>
													<CurrencyDollarIcon className='h-3 w-3 mr-1' />
													Наличные
												</>
											)}
										</span>
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
										<div className='flex justify-end space-x-2'>
											<button
												title='Просмотреть'
												onClick={() => openModal(sale)}
												className='text-blue-600 hover:text-blue-900'
											>
												<EyeIcon className='h-5 w-5' />
											</button>

											{user?.role === 'admin' &&
												sale.status !== 'cancelled' && (
													<>
														{sale.isCredit && sale.paidAmount < sale.total && (
															<button
																title='Оплатить'
																onClick={() => addPayment(sale._id)}
																className='text-green-600 hover:text-green-900'
																disabled={loading}
															>
																<CurrencyDollarIcon className='h-5 w-5' />
															</button>
														)}

														<button
															title='Отменить'
															onClick={() => cancelSale(sale._id)}
															className='text-red-600 hover:text-red-900'
															disabled={loading}
														>
															<TrashIcon className='h-5 w-5' />
														</button>
													</>
												)}
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan='7' className='px-6 py-4 text-center text-gray-500'>
									{loading ? 'Загрузка...' : 'Продажи не найдены'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Пагинация */}
			{totalPages > 1 && (
				<div className='bg-gray-50 px-6 py-3 flex items-center justify-between'>
					<div className='flex-1 flex justify-between items-center'>
						<button
							onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className={`px-4 py-2 rounded ${
								currentPage === 1
									? 'bg-gray-200 text-gray-500'
									: 'bg-white text-gray-700 hover:bg-gray-100'
							}`}
						>
							Назад
						</button>
						<span className='text-sm text-gray-700'>
							Страница {currentPage} из {totalPages}
						</span>
						<button
							onClick={() =>
								setCurrentPage(prev => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
							className={`px-4 py-2 rounded ${
								currentPage === totalPages
									? 'bg-gray-200 text-gray-500'
									: 'bg-white text-gray-700 hover:bg-gray-100'
							}`}
						>
							Вперед
						</button>
					</div>
				</div>
			)}

			{/* Модальное окно с деталями продажи */}
			{isModalOpen && selectedSale && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
						<div className='flex justify-between items-center border-b px-6 py-4'>
							<h3 className='text-lg font-medium text-gray-900'>
								Продажа #
								{selectedSale.invoiceNumber ||
									selectedSale._id.slice(-6).toUpperCase()}
							</h3>
							<div className='flex space-x-2'>
								<button
									onClick={printReceipt}
									className='px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center'
								>
									<PrinterIcon className='h-5 w-5 mr-1' />
									Печать
								</button>
								<button
									onClick={closeModal}
									className='text-gray-400 hover:text-gray-500'
								>
									<XMarkIcon className='h-6 w-6' />
								</button>
							</div>
						</div>

						<div className='px-6 py-4 space-y-4'>
							<div className='grid grid-cols-3 gap-4'>
								<div>
									<p className='text-sm text-gray-500'>Дата</p>
									<p className='font-medium'>
										{format(
											new Date(selectedSale.saleDate),
											'dd/MM/yyyy HH:mm'
										)}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>Клиент</p>
									<p className='font-medium'>
										{selectedSale.customer?.name || 'Клиент не указан'}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>Продавец</p>
									<p className='font-medium'>
										{selectedSale.seller?.name || 'Система'}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>Тип оплаты</p>
									<p className='font-medium'>
										{selectedSale.isCredit ? 'В кредит' : 'Наличные'}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>Статус</p>
									<p className='font-medium capitalize'>
										{selectedSale.status === 'cancelled'
											? 'Отменена'
											: 'Активна'}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>Статус оплаты</p>
									<p className='font-medium'>
										{selectedSale.isCredit
											? selectedSale.paidAmount >= selectedSale.total
												? 'Полностью оплачено'
												: `Остаток: ${(
														selectedSale.total - selectedSale.paidAmount
												  ).toFixed(2)} $`
											: 'Полностью оплачено'}
									</p>
								</div>
							</div>

							<div>
								<h4 className='font-medium mb-2'>Товары</h4>
								<div className='border rounded-lg overflow-hidden'>
									<table className='min-w-full divide-y divide-gray-200'>
										<thead className='bg-gray-50'>
											<tr>
												<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
													№
												</th>
												<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
													Товар
												</th>
												<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
													Кол-во
												</th>
												<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
													Цена
												</th>
												<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
													Сумма
												</th>
											</tr>
										</thead>
										<tbody className='bg-white divide-y divide-gray-200'>
											{selectedSale.items.map((item, index) => (
												<tr key={index}>
													<td className='px-4 py-2 whitespace-nowrap'>
														{index + 1}
													</td>
													<td className='px-4 py-2 whitespace-nowrap'>
														{item.name}
													</td>
													<td className='px-4 py-2 whitespace-nowrap'>
														{item.quantity}
													</td>
													<td className='px-4 py-2 whitespace-nowrap'>
														{item.price.toFixed(2)} $
													</td>
													<td className='px-4 py-2 whitespace-nowrap'>
														{(item.price * item.quantity).toFixed(2)} $
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							<div className='grid grid-cols-3 gap-4 pt-4'>
								<div className='bg-gray-50 p-4 rounded-lg'>
									<p className='text-sm text-gray-500'>Итого</p>
									<p className='font-bold'>{selectedSale.total.toFixed(2)} $</p>
								</div>
								<div className='bg-gray-50 p-4 rounded-lg'>
									<p className='text-sm text-gray-500'>Скидка</p>
									<p className='font-bold'>
										-{selectedSale.discount?.toFixed(2) || '0.00'} $
									</p>
								</div>
								<div className='bg-gray-50 p-4 rounded-lg'>
									<p className='text-sm text-gray-500'>Налог</p>
									<p className='font-bold'>
										{selectedSale.tax?.toFixed(2) || '0.00'} $
									</p>
								</div>
								<div className='bg-gray-50 p-4 rounded-lg col-span-3'>
									<p className='text-sm text-gray-500'>Общая сумма</p>
									<p className='font-bold text-lg'>
										{selectedSale.total.toFixed(2)} $
									</p>
								</div>
							</div>

							{selectedSale.isCredit && (
								<div>
									<h4 className='font-medium mb-2'>История платежей</h4>
									<div className='border rounded-lg overflow-hidden'>
										<table className='min-w-full divide-y divide-gray-200'>
											<thead className='bg-gray-50'>
												<tr>
													<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
														Дата
													</th>
													<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
														Сумма
													</th>
													<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
														Способ
													</th>
													<th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
														Принял
													</th>
												</tr>
											</thead>
											<tbody className='bg-white divide-y divide-gray-200'>
												{selectedSale.paymentHistory?.length > 0 ? (
													selectedSale.paymentHistory.map((payment, index) => (
														<tr key={index}>
															<td className='px-4 py-2 whitespace-nowrap'>
																{format(
																	new Date(payment.paymentDate),
																	'dd/MM/yyyy HH:mm'
																)}
															</td>
															<td className='px-4 py-2 whitespace-nowrap'>
																{payment.amount.toFixed(2)} $
															</td>
															<td className='px-4 py-2 whitespace-nowrap capitalize'>
																{payment.paymentMethod === 'cash'
																	? 'Наличные'
																	: payment.paymentMethod}
															</td>
															<td className='px-4 py-2 whitespace-nowrap'>
																{selectedSale.seller?.name || 'Система'}
															</td>
														</tr>
													))
												) : (
													<tr>
														<td
															colSpan='4'
															className='px-4 py-2 text-center text-gray-500'
														>
															Платежи отсутствуют
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							)}

							{selectedSale.notes && (
								<div>
									<h4 className='font-medium mb-2'>Примечание</h4>
									<p className='text-gray-700 bg-gray-50 p-3 rounded-lg'>
										{selectedSale.notes}
									</p>
								</div>
							)}
						</div>

						<div className='bg-gray-50 px-6 py-3 flex justify-end space-x-3'>
							<button
								onClick={printReceipt}
								className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center'
							>
								<PrinterIcon className='h-5 w-5 mr-1' />
								Печать
							</button>
							<button
								onClick={closeModal}
								className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
							>
								Закрыть
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default SaleTable
