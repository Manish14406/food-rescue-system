import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Info, Phone, Package, MapPin, Clock } from 'lucide-react'

const Donate = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())
    payload.hygieneConfirmation = e.target.hygieneConfirmation.checked

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to submit donation')
      setMessage('Donation received! Our NGO admins will coordinate the rescue shortly.')
      e.target.reset()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Get current date-time for min attribute
  const now = new Date().toISOString().slice(0, 16);

  return (
    <section className="container">
      <div className="section-heading center" style={{marginTop: '60px'}}>
        <h2>Post Food Donation</h2>
        <p>Help us reduce waste. Your surplus food can feed dozens of people today.</p>
      </div>

      <div className="form-shell" style={{ maxWidth: '850px', margin: '40px auto' }}>
        {message && (
          <div className={`status-panel ${message.includes('Error') ? 'error' : 'success'}`} style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            {message.includes('Error') ? <Info size={24} /> : <CheckCircle size={24} />}
            <p style={{ margin: 0, fontWeight: 600 }}>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="donation-form">
          <div className="form-section">
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={20} color="var(--green)" /> Complete Donation Details
            </h4>
            <div className="form-grid">
              <div>
                <label>Contact Person Name*</label>
                <input name="donorName" required placeholder="e.g. John Doe" />
              </div>
              <div>
                <label>Business / Organization Name*</label>
                <input name="businessName" required placeholder="e.g. Grand Hotel, Wedding Hall" />
              </div>
              <div>
                <label>Phone Number*</label>
                <div style={{ position: 'relative' }}>
                   <input 
                     name="contactNumber" 
                     type="tel" 
                     required 
                     pattern="[0-9]{10}" 
                     placeholder="10-digit mobile number" 
                     style={{ paddingLeft: '40px' }}
                   />
                   <Phone size={16} style={{ position: 'absolute', left: '12px', top: '18px', color: 'var(--muted)' }} />
                </div>
              </div>

              <div>
                <label>Food Type*</label>
                <select name="foodType" required>
                  <option value="">-- Select Type --</option>
                  <option value="Veg Meal">Vegetarian Meal</option>
                  <option value="Non-Veg Meal">Non-Vegetarian Meal</option>
                  <option value="Bakery / Snacks">Bakery / Snacks</option>
                  <option value="Dry Ration">Dry Ration / Groceries</option>
                  <option value="Mixed">Mixed Items</option>
                </select>
              </div>
              <div>
                <label>Quantity / Servings*</label>
                <input name="quantity" required placeholder="e.g. 5kg rice, 40 servings" />
              </div>
              <div className="full-span">
                <label>Collection Address*</label>
                <div style={{ position: 'relative' }}>
                  <textarea 
                    name="pickupAddress" 
                    required 
                    rows="2" 
                    placeholder="Provide full address for our collection team..."
                    style={{ paddingLeft: '40px' }}
                  ></textarea>
                  <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--muted)' }} />
                </div>
              </div>
              <div>
                <label>Available Until* (Date & Time)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    name="availableUntil" 
                    type="datetime-local" 
                    required 
                    min={now}
                    style={{ paddingLeft: '40px' }}
                  />
                  <Clock size={16} style={{ position: 'absolute', left: '12px', top: '18px', color: 'var(--muted)' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-footer" style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '30px' }}>
              <input type="checkbox" name="hygieneConfirmation" required style={{ width: '24px', height: '24px', marginTop: '2px', cursor: 'pointer' }} />
              <label style={{ fontSize: '0.9rem', color: 'var(--muted)', cursor: 'pointer' }}>
                <strong>Hygiene Guarantee:</strong> I confirm that the food is fresh, prepared in a clean environment, and safe for human consumption.
              </label>
            </div>

            <button type="submit" className="button button-primary" style={{ width: '100%', minHeight: '56px', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Processing Submission...' : 'Post Donation Now'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Donate
