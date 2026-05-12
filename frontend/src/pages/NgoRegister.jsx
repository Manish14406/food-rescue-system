import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const NgoRegister = () => {
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
      const res = await fetch('/api/ngos/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Registration failed. Email might already exist.')
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
      <div className="form-shell" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <div className="section-heading center">
          <h2>NGO Registration</h2>
          <p>Join the FoodRescue network as a verified partner.</p>
        </div>

        <form onSubmit={handleSubmit} className="donation-form" style={{ marginTop: '20px' }}>
          <div className="form-grid">
            <div className="full-span">
              <label>NGO Name</label>
              <input name="name" required placeholder="Helping Hands Foundation" />
            </div>
            <div>
              <label>Email Address</label>
              <input name="email" type="email" required placeholder="contact@ngo.org" />
            </div>
            <div>
              <label>Password</label>
              <input name="password" type="password" required placeholder="••••••••" />
            </div>
            <div>
              <label>Contact Person</label>
              <input name="contactPerson" required placeholder="Jane Smith" />
            </div>
            <div>
              <label>Phone Number</label>
              <input name="phone" required placeholder="+91 98765 43210" />
            </div>
            <div className="full-span">
              <label>Official Address</label>
              <input name="address" required placeholder="123 NGO Lane, City Center" />
            </div>
            <div className="full-span">
              <label>Primary Service Area</label>
              <input name="serviceArea" required placeholder="Noida, South Delhi, etc." />
            </div>
          </div>

          <button type="submit" className="button button-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register NGO'}
          </button>
          
          {error && <p className="form-message" style={{ color: 'red' }}>{error}</p>}

          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--muted)' }}>
            Already have an account? <Link to="/ngo-login" style={{ color: 'var(--green)', fontWeight: 700 }}>Login here</Link>
          </p>
        </form>
      </div>
    </section>
  )
}

export default NgoRegister
