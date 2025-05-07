import { Link } from "react-router-dom";

export default function GetDash() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="font-bold m-8">- Get a Dashboard -</h1>
      <Link to={"/dashboard"} className="bg-sky-600 text-white px-6 py-2 rounded hover:bg-sky-500 transition shadow hover:shadow-2xl">Go to Dashboard</Link>
    </div>
  )
}
