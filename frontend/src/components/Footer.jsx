import React from 'react'

const Footer = () => {
  return (
    <footer style={{background: '#13233f', color: 'white', padding: '60px 0 30px', marginTop: '80px'}}>
      <div className="container" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px'}}>
        <div>
          <h3 style={{color: 'var(--green)', marginBottom: '20px'}}>FoodRescue</h3>
          <p style={{color: '#94a3b8', lineHeight: 1.6}}>Connecting surplus food with those who need it most. Together, we can end food waste and hunger.</p>
        </div>
        <div>
          <h4 style={{marginBottom: '20px'}}>Quick Links</h4>
          <ul style={{listStyle: 'none', padding: 0, color: '#94a3b8'}}>
            <li style={{marginBottom: '10px'}}>Home</li>
            <li style={{marginBottom: '10px'}}>Donate Food</li>
            <li style={{marginBottom: '10px'}}>Get Food</li>
            <li style={{marginBottom: '10px'}}>Track Delivery</li>
          </ul>
        </div>
        <div>
          <h4 style={{marginBottom: '20px'}}>Contact</h4>
          <p style={{color: '#94a3b8'}}>contact@foodrescue.org</p>
          <p style={{color: '#94a3b8'}}>+91 98765 43210</p>
        </div>
        <div>
           <h4 style={{marginBottom: '20px'}}>Newsletter</h4>
           <input placeholder="Enter your email" style={{background: '#1e293b', border: 'none', color: 'white'}} />
           <button className="button button-primary" style={{width: '100%', marginTop: '10px', minHeight: '40px'}}>Subscribe</button>
        </div>
      </div>
      <div className="container" style={{marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #1e293b', textAlign: 'center', color: '#64748b'}}>
        <p>© 2026 FoodRescue. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
