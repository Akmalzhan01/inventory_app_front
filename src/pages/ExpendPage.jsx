import { useState, useEffect } from 'react'
import axios from '../utils/axiosConfig'
import ProductForm from '../components/expend/ExprendForm'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

const ProductList = () => {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [editingProduct, setEditingProduct] = useState(null)
	const [showForm, setShowForm] = useState(false)
	const { user } = useAuth()

	useEffect(() => {
		fetchProducts()
	}, [])

	const fetchProducts = async () => {
		try {
			setLoading(true)
			const response = await axios.get('/api/expend')
			setProducts(response.data)
			setLoading(false)
		} catch (err) {
			setError(err.message)
			setLoading(false)
		}
	}

	const handleDelete = async id => {
		let pass = prompt('Пароль')
		try {
			await axios.post(`/api/expend/delete`, { id, pass, user })
			fetchProducts()
		} catch (err) {
			console.error('Ошибка при удалении продукта:', err)
		}
	}

	const handleEdit = product => {
		setEditingProduct(product)
		setShowForm(true)
	}

	const handleAddNew = () => {
		setEditingProduct(null)
		setShowForm(true)
	}

	const handleFormClose = () => {
		setShowForm(false)
		setEditingProduct(null)
	}

	const handleSaveSuccess = () => {
		fetchProducts()
		handleFormClose()
	}

	if (loading) return <div className='text-center py-8'>Загрузка...</div>
	if (error)
		return <div className='text-center py-8 text-red-500'>Ошибка: {error}</div>

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold'>
					Список продуктов - {products.length}
				</h1>
				<button
					onClick={handleAddNew}
					className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
				>
					Добавить новый продукт
				</button>
			</div>

			{showForm && (
				<div className='mb-8'>
					<ProductForm
						product={editingProduct}
						onSave={handleSaveSuccess}
						onCancel={handleFormClose}
					/>
				</div>
			)}

			<div className='bg-white shadow-md rounded-lg overflow-hidden'>
				<table className='min-w-full leading-normal'>
					<thead>
						<tr>
							<th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
								Название
							</th>
							<th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
								Цена
							</th>
							<th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
								Категория
							</th>
							<th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
								Дата добавления
							</th>
							<th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
								Действия
							</th>
						</tr>
					</thead>
					<tbody>
						{products.length === 0 ? (
							<tr>
								<td
									colSpan='5'
									className='px-5 py-5 border-b border-gray-200 bg-white text-sm text-center'
								>
									Продукты не найдены
								</td>
							</tr>
						) : (
							products.map(product => (
								<tr key={product._id}>
									<td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
										<p className='text-gray-900 whitespace-no-wrap'>
											{product.name}
										</p>
									</td>
									<td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
										<p className='text-gray-900 whitespace-no-wrap'>
											${product.price.toFixed(2)}
										</p>
									</td>
									<td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
										<p className='text-gray-900 whitespace-no-wrap'>
											{product.category}
										</p>
									</td>
									<td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
										<p className='text-gray-900 whitespace-no-wrap'>
											{new Date(product.date).toLocaleDateString()}
										</p>
									</td>
									<td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
										<div className='flex gap-2'>
											<button
												onClick={() => handleEdit(product)}
												className='text-blue-600 hover:text-blue-900 p-1'
												title='Редактировать'
											>
												<PencilIcon className='h-5 w-5' />
											</button>
											<button
												onClick={() => handleDelete(product._id)}
												className='text-red-500 hover:text-red-700'
												title='Удалить'
											>
												<TrashIcon className='h-5 w-5' />
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default ProductList
