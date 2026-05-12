import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Shield, Zap, TrendingUp, Users, ArrowRight } from 'lucide-react'

const Home = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalRequests: 0,
    totalDelivered: 0
  })

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err))
  }, [])

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="section-tag">Empowering NGOs to End Hunger</span>
            <h1>Fighting <span>Food Waste</span>, One Meal at a Time.</h1>
            <p className="hero-description">
              FoodRescue is a specialized platform for NGO coordination. We bridge the gap between surplus food from businesses and the specific needs of orphanages and shelters.
            </p>
            <div className="hero-actions">
              <Link to="/donate" className="button button-primary">Donate Food</Link>
              <Link to="/request-support" className="button button-secondary">Need Food Support</Link>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalDonations}</h3>
                <p>Total Donations</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalRequests}</h3>
                <p>Support Requests</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalDelivered}</h3>
                <p>Lives Impacted</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img src="/hero.png" alt="NGO Food Rescue Mission" />
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '80px 0' }}>
        <div className="section-heading center">
          <h2>Our Core Mission</h2>
          <p>We provide a centralized system for NGOs to manage the entire food rescue lifecycle.</p>
        </div>
        <div className="donations-grid">
          <div className="stat-card" style={{ textAlign: 'center', padding: '40px' }}>
             <Zap size={40} color="var(--green)" style={{ margin: '0 auto 20px' }} />
             <h4>Zero Waste</h4>
             <p>Redirecting surplus from hotels and events before it becomes waste.</p>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', padding: '40px' }}>
             <Shield size={40} color="var(--green)" style={{ margin: '0 auto 20px' }} />
             <h4>Verified Impact</h4>
             <p>NGOs vet every orphanage and shelter to ensure responsible distribution.</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
