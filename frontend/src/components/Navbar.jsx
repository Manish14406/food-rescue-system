import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, ShieldCheck } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    const admin = localStorage.getItem('adminUser')
    const token = localStorage.getItem('adminToken')
    setIsAdmin(!!(admin && token))
  }, [location])

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Heart size={24} fill="white" />
          </div>
          <span className="brand-text">FoodRescue NGO</span>
        </Link>

        <nav className="main-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/donate" className={`nav-link ${isActive('/donate') ? 'active' : ''}`}>Donate Food</Link>
          <Link to="/request-support" className={`nav-link ${isActive('/request-support') ? 'active' : ''}`}>Need Support</Link>
          
          {isAdmin ? (
            <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`} style={{ color: 'var(--green)', fontWeight: 700 }}>
              <ShieldCheck size={18} /> Admin Dashboard
            </Link>
          ) : (
            <Link to="/admin-login" className={`nav-link ${isActive('/admin-login') ? 'active' : ''}`}>Admin Login</Link>
          )}
        </nav>

        {!isAdmin && (
          <Link to="/donate" className="nav-cta">Donate Now</Link>
        )}
      </div>
    </header>
  )
}

export default Navbar
