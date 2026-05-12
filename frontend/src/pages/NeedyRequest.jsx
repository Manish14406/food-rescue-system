import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, Users, MapPin, Phone, User, Info } from 'lucide-react'

const NeedyRequest = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())
    payload.peopleCount = Number(payload.peopleCount)

    try {
      const res = await fetch('/api/needy-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to submit request')
      setMessage('Your request has been logged. Our NGO coordinator will verify the details and match you with a donor.')
      e.target.reset()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="section-heading center" style={{marginTop: '60px'}}>
        <h2>Request Food Support</h2>
        <p>Verified orphanages, shelters, and community kitchens can register their needs here.</p>
      </div>

      <div className="form-shell" style={{ maxWidth: '850px', margin: '40px auto' }}>
        {message && (
          <div className={`status-panel ${message.includes('Error') ? 'error' : 'success'}`} style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            {message.includes('Error') ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            <p style={{ margin: 0, fontWeight: 600 }}>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="donation-form">
          <div className="form-section">
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="var(--green)" /> Complete Support Request Details
            </h4>
            <div className="form-grid">
              <div className="full-span">
                <label>Organization / Center Name*</label>
                <input name="centerName" required placeholder="e.g. Hope Orphanage, City Shelter" />
              </div>
              <div>
                <label>Head Person Name*</label>
                <input name="headPerson" required placeholder="Full Name of Coordinator" />
              </div>
              <div>
                <label>Phone Number*</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    name="phoneNumber" 
                    type="tel" 
                    required 
                    pattern="[0-9]{10}" 
                    placeholder="10-digit mobile number" 
                    style={{ paddingLeft: '40px' }}
                  />
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '18px', color: 'var(--muted)' }} />
                </div>
              </div>
              <div className="full-span">
                <label>Full Delivery Address / Location*</label>
                <div style={{ position: 'relative' }}>
                  <textarea 
                    name="address" 
                    required 
                    rows="2" 
                    placeholder="Provide full address for our delivery team..."
                    style={{ paddingLeft: '40px' }}
                  ></textarea>
                  <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--muted)' }} />
                </div>
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label>Number of People*</label>
                <input name="peopleCount" type="number" required min="1" placeholder="Number of residents" />
              </div>
              <div>
                <label>Est. Quantity Required*</label>
                <input name="quantityRequired" required placeholder="e.g. 50 meals, 10kg grain" />
              </div>
              <div className="full-span">
                <label>Food Preferences / Details*</label>
                <textarea 
                  name="foodPreference" 
                  required 
                  rows="3" 
                  placeholder="e.g. Cooked vegetarian food, dry ration preferred, daily requirement..."
                ></textarea>
              </div>
              <div>
                <label>Urgency Level*</label>
                <select name="urgencyLevel" required>
                  <option value="low">Low (Regular Support)</option>
                  <option value="medium">Medium (Urgent Need)</option>
                  <option value="high">High (Critical / Emergency)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-footer" style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--line)' }}>
            <div className="status-panel info" style={{ marginBottom: '30px', background: '#f0f9ff', borderColor: '#bae6fd', display: 'flex', gap: '12px' }}>
              <Info size={20} color="#0369a1" />
              <p style={{ fontSize: '0.85rem', color: '#0369a1', margin: 0 }}>
                <strong>Note:</strong> Our NGO team will verify the organization details before matching you with a donor. Verification may take 24-48 hours.
              </p>
            </div>
            
            <button type="submit" className="button button-primary" style={{ width: '100%', minHeight: '56px', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Submitting Request...' : 'Submit Support Request'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default NeedyRequest
