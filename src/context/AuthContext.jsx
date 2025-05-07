import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../utils/axiosConfig'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize auth state
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }

        const { data } = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(data)
      } catch (error) {
        localStorage.removeItem('token')
        console.error('Authentication check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('https://inventory-app-theta-two.vercel.app/api/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      setUser(data)
      navigate('/dashboard')
      toast.success('Login successful')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData)
      localStorage.setItem('token', data.token)
      setUser(data)
      navigate('/dashboard')
      toast.success('Registration successful')
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  // Value to provide to consumers
  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}