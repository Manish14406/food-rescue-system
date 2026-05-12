import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Heart, Truck, LogOut } from 'lucide-react'

const NgoDashboard = () => {
  const navigate = useNavigate()
  const [ngo, setNgo] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem('ngoUser')
    if (!user) {
      navigate('/ngo-login')
      return
    }
    setNgo(JSON.parse(user))
    
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('ngoUser')
    navigate('/')
  }

  if (!ngo) return null

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <span className="section-tag">NGO Partner Dashboard</span>
          <h2 style={{ marginTop: '10px' }}>Welcome, {ngo.name}</h2>
        </div>
        <button onClick={handleLogout} className="button button-secondary" style={{ minHeight: '44px', gap: '10px' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h3>{stats?.availableDonations || 0}</h3>
              <p>Food Available</p>
            </div>
            <Heart size={32} color="var(--green)" />
          </div>
          <Link to="/get-food" className="nav-link" style={{ padding: '8px 0', fontSize: '0.9rem', display: 'block' }}>Browse & Claim →</Link>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h3>{stats?.totalNeedyCenters || 0}</h3>
              <p>Needy Centers</p>
            </div>
            <Users size={32} color="var(--green)" />
          </div>
          <Link to="/manage-centers" className="nav-link" style={{ padding: '8px 0', fontSize: '0.9rem', display: 'block' }}>Manage Centers →</Link>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h3>{stats?.totalClaims || 0}</h3>
              <p>Total Rescues</p>
            </div>
            <Truck size={32} color="var(--green)" />
          </div>
          <Link to="/track" className="nav-link" style={{ padding: '8px 0', fontSize: '0.9rem', display: 'block' }}>Tracking History →</Link>
        </div>
      </div>

      <div className="section-heading">
        <h3>Operational Focus</h3>
        <p>Manage your registered needy centers and coordinate food distribution efficiently.</p>
      </div>

      <div className="form-grid" style={{ marginTop: '20px' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/manage-centers')}>
          <h4>Register New Needy Center</h4>
          <p>Add an orphanage, shelter, or slum community to your network.</p>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/get-food')}>
          <h4>Claim Donations</h4>
          <p>View surplus food from local restaurants and assign it to a center.</p>
        </div>
      </div>
    </div>
  )
}

export default NgoDashboard
