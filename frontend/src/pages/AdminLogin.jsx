import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle } from 'lucide-react'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json().catch(() => ({}))
      console.log('Server Raw Response:', data)

      if (!res.ok) {
        throw new Error(data.detail || 'Invalid admin credentials')
      }

      // Strict validation of response keys and role
      if (!data.access_token || !data.user || !data.user.id || data.user.role !== 'admin') {
        console.error('Response is missing keys or invalid role:', data)
        throw new Error('Unauthorized: Admin access required')
      }

      localStorage.setItem('adminUser', JSON.stringify(data.user))
      localStorage.setItem('adminToken', data.access_token)
      navigate('/admin-dashboard')
    } catch (err) {
      setError(err.message)
      console.error('Login system error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="form-shell" style={{ maxWidth: '400px', margin: '100px auto' }}>
        <div className="section-heading center">
          <div className="brand-icon" style={{ margin: '0 auto 20px' }}>
            <Lock size={20} />
          </div>
          <h2>Admin Access</h2>
          <p>NGO administrator login only.</p>
        </div>

        <form onSubmit={handleSubmit} className="donation-form" style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Admin Email</label>
            <input name="email" type="email" required placeholder="admin@foodrescue.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" required placeholder="••••••••" />
          </div>

          <button type="submit" className="button button-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Login to Dashboard'}
          </button>
          
          {error && (
            <div style={{ marginTop: '15px', color: '#dc2626', background: '#fef2f2', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

export default AdminLogin
