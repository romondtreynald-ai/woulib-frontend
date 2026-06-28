import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';

const API = 'https://woulib-backend-production.up.railway.app';

const colors = {
  dark: '#1a1a2e',
  yellow: '#f5c518',
  green: '#1D9E75',
  red: '#D85A30',
  bgLight: '#f7f7f5',
  border: '#e5e3dd',
  textSecondary: '#8a8780'
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('woulib_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('woulib_user') || 'null'));
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function logout() {
    localStorage.removeItem('woulib_token');
    localStorage.removeItem('woulib_user');
    setToken('');
    setUser(null);
  }

  if (!token || !user) {
    return <AuthScreen onAuth={(t, u) => {
      setToken(t); setUser(u);
      localStorage.setItem('woulib_token', t);
      localStorage.setItem('woulib_user', JSON.stringify(u));
    }} />;
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#fff' }}>
      <TopBar user={user} onLogout={logout} />
      {user.role === 'rider'
        ? <RiderApp token={token} showToast={showToast} />
        : <DriverApp token={token} showToast={showToast} />}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: colors.dark, color: colors.yellow, padding: '10px 20px',
          borderRadius: 20, fontSize: 13, fontWeight: 500, zIndex: 999, whiteSpace: 'nowrap'
        }}>{toast}</div>
      )}
    </div>
  );
}

function TopBar({ user, onLogout }) {
  return (
    <div style={{ background: colors.dark, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
        Woulib<span style={{ color: colors.yellow }}>+</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{user.name} ({user.role === 'rider' ? 'Pasaje' : 'Chofè'})</span>
        <button onClick={onLogout} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
          borderRadius: 16, padding: '4px 10px', fontSize: 12, cursor: 'pointer'
        }}>Dekonekte</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AUTH SCREEN — login & register
// ─────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('rider');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    if (!phone || !password || (mode === 'register' && !name)) {
      setError('Tanpri ranpli tout chan yo');
      return;
    }
    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { phone, password } : { name, phone, password, role };
      const res = await fetch(API + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Yon erè rive');
        setLoading(false);
        return;
      }
      onAuth(data.token, data.user);
    } catch (e) {
      setError('Pa ka konekte ak sèvè a. Tcheke koneksyon entènèt ou.');
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: colors.dark, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 600 }}>
          Woulib<span style={{ color: colors.yellow }}>+</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6 }}>Ride-hailing app pou Ayiti</p>
      </div>

      <div style={{ padding: 24, flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button onClick={() => setMode('login')} style={tabBtn(mode === 'login')}>Konekte</button>
          <button onClick={() => setMode('register')} style={tabBtn(mode === 'register')}>Enskri</button>
        </div>

        {mode === 'register' && (
          <>
            <label style={labelStyle}>Ki tip kont?</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={() => setRole('rider')} style={tabBtn(role === 'rider')}>Pasaje</button>
              <button onClick={() => setRole('driver')} style={tabBtn(role === 'driver')}>Chofè</button>
            </div>

            <label style={labelStyle}>Non konplè</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Jan Pyè" style={inputStyle} />
          </>
        )}

        <label style={labelStyle}>Nimewo telefòn</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+509 3X XX XXXX" style={inputStyle} />

        <label style={labelStyle}>Modpas</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={inputStyle} />

        {error && <p style={{ color: colors.red, fontSize: 13, marginTop: 8 }}>{error}</p>}

        <button onClick={submit} disabled={loading} style={{
          width: '100%', padding: 14, background: colors.dark, color: colors.yellow,
          border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 16
        }}>
          {loading ? 'Tann...' : mode === 'login' ? 'Konekte' : 'Kreye kont'}
        </button>
      </div>
    </div>
  );
}

const tabBtn = (active) => ({
  flex: 1, padding: 10, borderRadius: 8, border: active ? `2px solid ${colors.dark}` : `1px solid ${colors.border}`,
  background: active ? '#fff' : colors.bgLight, color: colors.dark, fontSize: 13, fontWeight: 600, cursor: 'pointer'
});

const labelStyle = { display: 'block', fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12, fontWeight: 600 };

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${colors.border}`,
  fontSize: 14, outline: 'none', background: colors.bgLight, color: colors.dark, boxSizing: 'border-box'
};

// ─────────────────────────────────────────────
// RIDER APP
// ─────────────────────────────────────────────
function RiderApp({ token, showToast }) {
  const [pickup, setPickup] = useState('Lokasyon aktyèl ou');
  const [destination, setDestination] = useState('');
  const [rideType, setRideType] = useState('WouGo');
  const [booking, setBooking] = useState(false);
  const [activeRide, setActiveRide] = useState(null);

  const fares = { WouGo: 850, WouPlus: 1400, WouXL: 2100 };

  async function bookRide() {
    if (!destination.trim()) { showToast('Antre yon destinasyon'); return; }
    setBooking(true);
    try {
      const res = await fetch(API + '/api/rides/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pickup, destination, rideType, estimatedFare: fares[rideType] })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Erè'); setBooking(false); return; }
      setActiveRide(data.ride);
      showToast('Kous bwoke! Ap tann yon chofè...');
    } catch (e) {
      showToast('Pa ka konekte ak sèvè a');
    }
    setBooking(false);
  }

  if (activeRide) {
    return <PaymentScreen ride={activeRide} token={token} showToast={showToast}
      onDone={() => setActiveRide(null)} fares={fares} rideType={rideType} />;
  }

  return (
    <div>
      <MapContainer center={[18.5392, -72.3288]} zoom={13} style={{ height: 200, width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /></MapContainer>
      <div style={{ padding: 16 }}>
        <p style={sectionLabel}>Kibò ou prale?</p>
        <div style={inputRow}>
          <div style={{ ...dot, background: colors.green }} />
          <input value={pickup} onChange={e => setPickup(e.target.value)} style={rowInput} />
        </div>
        <div style={inputRow}>
          <div style={{ ...dot, background: colors.red }} />
          <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Antre destinasyon" style={rowInput} />
        </div>

        <p style={{ ...sectionLabel, marginTop: 14 }}>Chwazi kous</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {Object.entries(fares).map(([type, fare]) => (
            <div key={type} onClick={() => setRideType(type)} style={{
              border: rideType === type ? `2px solid ${colors.dark}` : `1px solid ${colors.border}`,
              borderRadius: 8, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', background: colors.bgLight
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{type}</div>
              <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{fare} HTG</div>
            </div>
          ))}
        </div>

        <button onClick={bookRide} disabled={booking} style={{
          width: '100%', padding: 14, background: colors.dark, color: colors.yellow,
          border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 16
        }}>
          {booking ? 'Ap chèche chofè...' : 'Bwoke kous'}
        </button>
      </div>
    </div>
  );
}

const sectionLabel = { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 };
const inputRow = { display: 'flex', alignItems: 'center', gap: 10, background: colors.bgLight, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8 };
const rowInput = { border: 'none', background: 'transparent', flex: 1, fontSize: 14, outline: 'none', color: colors.dark };
const dot = { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 };

// ─────────────────────────────────────────────
// PAYMENT SCREEN — MonCash / NatCash
// ─────────────────────────────────────────────
function PaymentScreen({ ride, token, showToast, onDone, fares, rideType }) {
  const [method, setMethod] = useState('moncash');
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const amount = fares[rideType];

  async function pay() {
    if (!phone.trim()) { showToast('Antre nimewo telefòn ou'); return; }
    setPaying(true);
    try {
      const res = await fetch(API + '/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rideId: ride.id, method, phone, amount })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Peman echwe');
        setPaying(false);
        return;
      }
      setPaid(true);
    } catch (e) {
      showToast('Pa ka konekte ak sèvè peman');
    }
    setPaying(false);
  }

  if (paid) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#EAF3DE',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          color: '#27500A', margin: '0 auto 16px'
        }}>✓</div>
        <h3 style={{ marginBottom: 6 }}>Peman lanse!</h3>
        <p style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 20 }}>
          Apwouve peman {amount} HTG la sou aplikasyon {method === 'moncash' ? 'MonCash' : 'NatCash'} ou.
          Chofè ou ap konfime kous la byento.
        </p>
        <button onClick={onDone} style={{
          width: '100%', padding: 13, background: colors.dark, color: colors.yellow,
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>Tounen lakay</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '14px 16px', background: colors.bgLight, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{ride.pickup} → {ride.destination}</div>
          <div style={{ fontSize: 12, color: colors.textSecondary }}>{rideType}</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>{amount} HTG</div>
      </div>

      <div style={{ padding: 16 }}>
        <p style={sectionLabel}>Chwazi metòd peman</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div onClick={() => setMethod('moncash')} style={methodCard(method === 'moncash')}>
            <div style={{ ...methodLogo, background: '#E6F1FB', color: '#0C447C' }}>MC</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>MonCash</div>
            <div style={{ fontSize: 11, color: colors.textSecondary }}>Digicel</div>
          </div>
          <div onClick={() => setMethod('natcash')} style={methodCard(method === 'natcash')}>
            <div style={{ ...methodLogo, background: '#EAF3DE', color: '#27500A' }}>NC</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>NatCash</div>
            <div style={{ fontSize: 11, color: colors.textSecondary }}>Natcom</div>
          </div>
        </div>

        <p style={sectionLabel}>Nimewo telefòn ou</p>
        <div style={inputRow}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>+509</span>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="3X XX XXXX" style={rowInput} maxLength={10} />
        </div>

        <button onClick={pay} disabled={paying} style={{
          width: '100%', padding: 14, background: colors.dark, color: colors.yellow,
          border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 16
        }}>
          {paying ? 'Ap tann apwobasyon...' : `Peye ${amount} HTG ak ${method === 'moncash' ? 'MonCash' : 'NatCash'}`}
        </button>
      </div>
    </div>
  );
}

const methodCard = (active) => ({
  border: active ? `2px solid ${colors.dark}` : `1px solid ${colors.border}`,
  borderRadius: 8, padding: 12, textAlign: 'center', cursor: 'pointer', background: '#fff'
});
const methodLogo = { width: 44, height: 44, borderRadius: '50%', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 };

// ─────────────────────────────────────────────
// DRIVER APP
// ─────────────────────────────────────────────
function DriverApp({ token, showToast }) {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const res = await fetch(API + '/api/rides/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRides(data.rides || []);
    } catch (e) {}
  }

  return (
    <div>
      <div style={{ padding: '12px 16px', background: colors.bgLight, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.green }} />
          Anliy — ap tann demand
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <p style={sectionLabel}>Kous ou fè</p>
        {rides.length === 0 && (
          <p style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', padding: 20 }}>
            Ou poko gen okenn kous fini.
          </p>
        )}
        {rides.map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
            <div>
              <div style={{ fontSize: 13 }}>{r.pickup} → {r.destination}</div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>{new Date(r.completed_at).toLocaleDateString()}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.green }}>{r.estimated_fare} HTG</div>
          </div>
        ))}
      </div>
    </div>
  );
}
