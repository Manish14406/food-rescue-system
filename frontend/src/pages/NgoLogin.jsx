import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const NgoLogin = () => {
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
      const res = await fetch('/api/ngos/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Invalid email or password')
      const ngo = await res.json()
      localStorage.setItem('ngoUser', JSON.stringify(ngo))
      navigate('/ngo-dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="form-shell" style={{ maxWidth: '500px', marginTop: '60px' }}>
        <div className="section-heading center">
          <h2>NGO Login</h2>
          <p>Access your dashboard to manage rescues.</p>
        </div>

        <form onSubmit={handleSubmit} className="donation-form" style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" required placeholder="ngo@example.org" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" required placeholder="••••••••" />
          </div>

          <button type="submit" className="button button-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          {error && <p className="form-message" style={{ color: 'red' }}>{error}</p>}

          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--muted)' }}>
            Don't have an NGO account? <Link to="/ngo-register" style={{ color: 'var(--green)', fontWeight: 700 }}>Register here</Link>
          </p>
        </form>
      </div>
    </section>
  )
}

export default NgoLogin
