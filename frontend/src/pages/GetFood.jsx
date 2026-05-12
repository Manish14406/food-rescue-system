import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Filter, AlertCircle, CheckCircle } from 'lucide-react'

const donationImageMap = {
  Hotel: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  Restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  Event: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=80",
  "NGO Kitchen": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80"
};

const GetFood = () => {
  const navigate = useNavigate()
  const [donations, setDonations] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [ngo, setNgo] = useState(null)
  const [centers, setCenters] = useState([])
  const [selectedCenter, setSelectedCenter] = useState({})
  const [claimingId, setClaimingId] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem('ngoUser')
    if (user) {
      const ngoData = JSON.parse(user)
      setNgo(ngoData)
      fetch(`/api/ngos/${ngoData.id}/needy-centers`)
        .then(res => res.json())
        .then(data => setCenters(data))
        .catch(err => console.error(err))
    }
    
    fetchDonations()
  }, [search, filter])

  const fetchDonations = () => {
    fetch(`/api/donations?search=${search}&donorType=${filter}`)
      .then(res => res.json())
      .then(data => setDonations(data))
      .catch(err => console.error(err))
  }

  const handleClaim = async (donationId) => {
    if (!ngo) {
      navigate('/ngo-login')
      return
    }

    const centerId = selectedCenter[donationId]
    if (!centerId) {
      alert("Please select a target Needy Center first.")
      return
    }

    try {
      const res = await fetch(`/api/donations/${donationId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId: ngo.id,
          needyCenterId: Number(centerId)
        })
      })
      if (!res.ok) throw new Error('Claim failed')
      fetchDonations()
      alert("Donation claimed successfully!")
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <section className="container">
      <div className="section-heading center" style={{marginTop: '40px'}}>
        <h2>Available Donations</h2>
        <p>NGO Partners can browse surplus food and assign it to verified needy centers.</p>
      </div>

      <div className="filter-shell" style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
        <div style={{flex: 1, position: 'relative'}}>
          <input 
            placeholder="Search by organization, food, or area..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{paddingLeft: '45px'}}
          />
          <Search size={20} style={{position: 'absolute', left: '15px', top: '18px', color: '#999'}} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{width: '200px'}}>
          <option value="All">All Donors</option>
          <option value="Hotel">Hotels</option>
          <option value="Restaurant">Restaurants</option>
          <option value="Event">Events</option>
          <option value="NGO Kitchen">NGO Kitchens</option>
        </select>
      </div>

      {!ngo && (
        <div className="status-panel info" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <AlertCircle size={24} />
          <p style={{ margin: 0 }}>
            Are you an NGO? <Link to="/ngo-login" style={{ fontWeight: 700, color: 'var(--green-dark)' }}>Login to claim</Link> surplus food for your registered centers.
          </p>
        </div>
      )}

      <div className="donations-grid">
        {donations.length > 0 ? donations.map(donation => (
          <article key={donation.id} className="donation-card">
            <div className="donation-card-image">
              <img src={donationImageMap[donation.donorType] || donationImageMap.Event} alt={donation.organizationName} />
            </div>
            <div className="donation-card-body">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>{donation.organizationName}</h3>
                <span className={`status-badge ${donation.status}`}>
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </span>
              </div>
              <span className="section-tag" style={{margin: '10px 0', fontSize: '0.8rem'}}>{donation.donorType}</span>
              
              <div className="donation-meta" style={{marginTop: '15px'}}>
                <p><strong>{donation.foodType}</strong></p>
                <p>{donation.foodDescription}</p>
                <p>{donation.quantityKg}kg · {donation.servings} Servings</p>
                <p>{donation.area}</p>
              </div>

              {ngo && donation.status === 'available' && (
                <div style={{ marginTop: '20px' }}>
                  <label style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Deliver To Center:</label>
                  <select 
                    style={{ marginBottom: '10px' }}
                    value={selectedCenter[donation.id] || ""}
                    onChange={(e) => setSelectedCenter({...selectedCenter, [donation.id]: e.target.value})}
                  >
                    <option value="">-- Select Center --</option>
                    {centers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.location})</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                className="button button-primary" 
                style={{width: '100%', marginTop: '10px'}}
                onClick={() => handleClaim(donation.id)}
                disabled={donation.status !== 'available'}
              >
                {donation.status === 'available' ? 'Claim This Donation' : `Claimed by ${donation.claimedByOrg}`}
              </button>
            </div>
          </article>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
            <p>No donations found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default GetFood
