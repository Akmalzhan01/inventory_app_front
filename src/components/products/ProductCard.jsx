import axios from "../../utils/axiosConfig";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductCard() {
  const [product, setProduct] = useState({});
  
const param = useParams()

  useEffect(() => {
    axios.get(`/api/products/${param.id}`)
      .then((response) => {
        console.log(response.data);
        setProduct(response.data);
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
      });
  }, [])
  
  
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {product.code}
          </span>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <span className="text-gray-600">Qoldiq:</span>
          <span className="font-medium">{product.quantity} dona</span>
        </div>

        <div className="mt-1 flex justify-between items-center">
          <span className="text-gray-600">Narx:</span>
          <span className="font-medium">{product.price?.toLocaleString() || '0'} so'm</span>
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Tahrirlash
        </button>
        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
          O'chirish
        </button>
      </div>
    </div>
  );
};