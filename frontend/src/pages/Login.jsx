import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login(formData)
      loginUser(data.user, data.token)
      toast.success('Welcome back! 👋')
      navigate('/chat')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="bg-[#1C2541] p-8 rounded-2xl w-full max-w-md border border-[#FFA630]/20">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#FFA630]">NexChat</h1>
          <p className="text-[#E5E4E2]/70 mt-2">Welcome back!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[#E5E4E2] text-sm mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full bg-[#0D0D0D] text-[#E5E4E2] rounded-lg px-4 py-3 border border-[#E5E4E2]/20 focus:outline-none focus:ring-2 focus:ring-[#FFA630]"
            />
          </div>

          <div>
            <label className="text-[#E5E4E2] text-sm mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full bg-[#0D0D0D] text-[#E5E4E2] rounded-lg px-4 py-3 border border-[#E5E4E2]/20 focus:outline-none focus:ring-2 focus:ring-[#FFA630]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFA630] hover:bg-[#e89525] text-[#0D0D0D] font-semibold py-3 rounded-lg transition duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-[#E5E4E2]/70 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#FFA630] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login