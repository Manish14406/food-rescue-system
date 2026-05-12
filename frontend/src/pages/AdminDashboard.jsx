import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, LogOut, Package, Clock, MapPin, Truck } from 'lucide-react'

const ArrowRight = ({ size, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
)

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [donations, setDonations] = useState([])
  const [requests, setRequests] = useState([])
  const [assignments, setAssignments] = useState([])
  const [activeTab, setActiveTab] = useState('match')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const userStr = localStorage.getItem('adminUser')
        const token = localStorage.getItem('adminToken')
        
        if (!userStr || !token || userStr === 'undefined' || token === 'undefined') {
          handleLogout()
          return
        }

        let user;
        try {
          user = JSON.parse(userStr)
        } catch (e) {
          handleLogout()
          return
        }

        if (!user || !user.id) {
          handleLogout()
          return
        }

        setAdmin(user)
        await fetchData(token)
      } catch (err) {
        console.error('Init error:', err)
        handleLogout()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [navigate])

  const fetchData = async (token) => {
    const headers = { 'Authorization': `Bearer ${token}` }
    try {
      const [dRes, rRes, aRes] = await Promise.all([
        fetch('/api/admin/donations?status=pending', { headers }),
        fetch('/api/admin/requests?status=open', { headers }),
        fetch('/api/admin/assignments', { headers })
      ])
      
      if (dRes.status === 401 || rRes.status === 401 || aRes.status === 401) {
        handleLogout()
        return
      }

      const dData = dRes.ok ? await dRes.json() : []
      const rData = rRes.ok ? await rRes.json() : []
      const aData = aRes.ok ? await aRes.json() : []

      setDonations(Array.isArray(dData) ? dData : [])
      setRequests(Array.isArray(rData) ? rData : [])
      setAssignments(Array.isArray(aData) ? aData : [])
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  const handleMatch = async (donationId, requestId) => {
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminId: admin.id, donationId, requestId })
      })
      if (res.status === 401) { handleLogout(); return; }
      if (!res.ok) throw new Error('Matching failed')
      fetchData(token)
      alert("Donation matched successfully!")
    } catch (err) {
      alert(err.message)
    }
  }

  const updateStatus = async (assignmentId, status) => {
    const token = localStorage.getItem('adminToken')
    try {
      const res = await fetch(`/api/admin/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      if (res.status === 401) { handleLogout(); return; }
      fetchData(token)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
    navigate('/admin-login')
  }

  if (loading) return <div className="container center" style={{padding: '100px'}}><h3>Loading Dashboard...</h3></div>
  if (!admin) return null

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <span className="section-tag">NGO Administrator Panel</span>
          <h2 style={{ marginTop: '10px' }}>Dashboard Overview</h2>
          <p style={{ color: 'var(--muted)' }}>Welcome back, {admin.name}</p>
        </div>
        <button onClick={() => navigate('/')} className="button button-secondary">Back to Home</button>
        <button onClick={handleLogout} className="button button-secondary" style={{ gap: '10px' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button className={`button ${activeTab === 'match' ? 'button-primary' : 'button-secondary'}`} onClick={() => setActiveTab('match')}>
          Match Donations ({donations?.length || 0})
        </button>
        <button className={`button ${activeTab === 'tracking' ? 'button-primary' : 'button-secondary'}`} onClick={() => setActiveTab('tracking')}>
          Track Deliveries ({assignments?.length || 0})
        </button>
      </div>

      {activeTab === 'match' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Pending Donations</h4>
            <div className="tracking-list">
              {donations.map(d => (
                <div key={d.id} className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{d.business_name}</strong>
                    <span className="section-tag">{d.food_type}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', margin: '10px 0' }}>{d.pickup_address}</p>
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--line)' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>MATCH WITH:</p>
                    {requests.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {requests.map(r => (
                          <button key={r.id} className="button button-secondary" style={{ minHeight: '34px', fontSize: '0.85rem', justifyContent: 'space-between' }} onClick={() => handleMatch(d.id, r.id)}>
                            <span>{r.center_name} ({r.urgency_level})</span>
                            <ArrowRight size={14} />
                          </button>
                        ))}
                      </div>
                    ) : <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No open requests</p>}
                  </div>
                </div>
              ))}
              {donations.length === 0 && <p>No pending donations.</p>}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Support Requests</h4>
            <div className="tracking-list">
              {requests.map(r => (
                <div key={r.id} className="stat-card" style={{ borderLeft: `4px solid ${r.urgency_level === 'high' ? 'red' : 'orange'}` }}>
                  <strong>{r.center_name}</strong>
                  <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>Needs: {r.quantity_required}</p>
                </div>
              ))}
              {requests.length === 0 && <p>No open requests.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="tracking-list">
          {assignments.map(a => (
            <div key={a.id} className="tracking-card">
              <div className="tracking-header" style={{ background: a.status === 'delivered' ? 'var(--green-dark)' : 'var(--navy)' }}>
                <div><h3>Match #{a.id}</h3><p>{a.business_name} ➔ {a.center_name}</p></div>
                <div className="delivery-pill" style={{ color: 'var(--navy)' }}>{a.status.toUpperCase()}</div>
              </div>
              <div className="tracking-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                   <div><h5 style={{ color: 'var(--muted)' }}>FROM</h5><p><strong>{a.business_name}</strong></p></div>
                   <div><h5 style={{ color: 'var(--muted)' }}>TO</h5><p><strong>{a.center_name}</strong></p></div>
                   <div>
                      <h5 style={{ color: 'var(--muted)' }}>STATUS</h5>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {a.status === 'assigned' && <button onClick={() => updateStatus(a.id, 'picked_up')} className="button button-primary">Picked Up</button>}
                        {a.status === 'picked_up' && <button onClick={() => updateStatus(a.id, 'delivered')} className="button button-primary">Delivered</button>}
                        {a.status === 'delivered' && <CheckCircle color="var(--green)" size={24} />}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
          {assignments.length === 0 && <p style={{ textAlign: 'center', padding: '40px' }}>No deliveries tracked yet.</p>}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
