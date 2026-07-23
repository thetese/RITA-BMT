import './index.css';
const React = (window as any).React;
const { useState, useEffect, useCallback } = React;
import TapeChart from './components/TapeChart';
import HousekeepingDash from './components/HousekeepingDash';
import HotelReports from './components/HotelReports';
import RoomManagement from './components/RoomManagement';
import GuestFolio from './components/GuestFolio';
import RateManagement from './components/RateManagement';
import GuestDirectory from './components/GuestDirectory';
import FrontDesk from './components/FrontDesk';
import MaintenanceBoard from './components/MaintenanceBoard';
import RevenueDashboard from './components/RevenueDashboard';
import NightAudit from './components/NightAudit';
import OTASync from './components/OTASync';
import BookingEngine from './components/BookingEngine';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  const colors = { success: 'var(--hotel-success)', error: 'var(--hotel-danger)', info: 'var(--hotel-primary)', warning: 'var(--hotel-warning)' };
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      padding: '14px 20px', borderRadius: '12px', background: 'var(--hotel-card-bg)',
      backdropFilter: 'blur(20px)', border: `1px solid ${colors[type] || colors.info}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', color: 'var(--hotel-text-main)',
      display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem',
      animation: 'slideInRight 0.3s ease', maxWidth: '400px'
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[type] || colors.info, flexShrink: 0 }}></div>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hotel-text-muted)', fontSize: '1.2rem', padding: '0', lineHeight: '1' }}>×</button>
    </div>
  );
};

const HotelPMS = ({ api, onClose }: any) => {
  const [activeTab, setActiveTab] = useState('frontdesk');
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const props = await api.hotelGetProperties();
      setProperties(props);
      if (props.length > 0 && selectedPropertyId === 'default' && props[0].id !== 'default') {
        setSelectedPropertyId(props[0].id);
      }
      const rm = await api.hotelGetRooms(selectedPropertyId);
      const res = await api.hotelGetReservations(selectedPropertyId);
      const hkTasks = await api.hotelGetHousekeepingTasks();
      setRooms(rm);
      setReservations(res);
      setTasks(hkTasks);
    } catch (e) {
      console.error('Failed to load hotel data', e);
      addToast('Failed to load data from server', 'error');
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedPropertyId]);

  const handleUpdateRoomStatus = async (id: string, status: string) => {
    try {
      await api.hotelUpdateRoomStatus(id, status);
      addToast(`Room status updated to ${status}`, 'success');
      loadData();
    } catch (e) {
      addToast('Failed to update room status', 'error');
    }
  };

  const handleNewReservation = async (roomId: string, date: string) => {
    const name = prompt('Enter Guest Name for New Reservation:');
    if (!name) return;
    const groupId = prompt('Group Block ID (Optional, leave blank for individual):');
    const checkout = new Date(date);
    checkout.setDate(checkout.getDate() + 1);
    try {
      await api.hotelAddReservation({
        propertyId: selectedPropertyId, customerId: '', customerName: name,
        roomId: roomId, checkInDate: date,
        checkOutDate: checkout.toISOString().split('T')[0],
        status: 'Pending', ratePlanId: null, groupId: groupId || null
      });
      addToast(`Reservation created for ${name}`, 'success');
      loadData();
    } catch (e) {
      addToast('Failed to create reservation', 'error');
    }
  };

  const handleNewReservationForGuest = async (guest) => {
    setActiveTab('frontdesk');
    addToast(`Select a room to create reservation for ${guest.name}`, 'info');
  };

  const handleOpenFolio = (reservation) => {
    setSelectedReservation(reservation);
  };

  const tabs = [
    { key: 'frontdesk', label: 'Front Desk', icon: '◉' },
    { key: 'tapechart', label: 'Tape Chart', icon: '▦' },
    { key: 'housekeeping', label: 'Housekeeping', icon: '◻' },
    { key: 'inventory', label: 'Room Inventory', icon: '▣' },
    { key: 'rates', label: 'Rate Plans', icon: '¤' },
    { key: 'guests', label: 'Guest Directory', icon: '◎' },
    { key: 'nightaudit', label: 'Night Audit', icon: '◐' },
    { key: 'otasync', label: 'Channel Manager', icon: '♺' },
    { key: 'bookingengine', label: 'Booking Engine', icon: '☁' },
    { key: 'maintenance', label: 'Maintenance', icon: '⚙' },
    { key: 'reports', label: 'Reports', icon: '◈' },
    { key: 'revenue', label: 'Revenue', icon: '◆' },
  ];

  return (
    <div className="hotel-plugin-wrapper">
      <div style={{ padding: '32px', maxWidth: '1500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, var(--hotel-primary), var(--hotel-accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Hotel Property Management System
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="hotel-text-muted" style={{ fontSize: '0.85rem' }}>Property:</span>
              <select className="hotel-input" style={{ width: '220px', padding: '6px 10px', fontSize: '0.85rem', background: 'var(--hotel-card-bg)' }}
                value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}>
                {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <button onClick={onClose} className="hotel-btn hotel-btn-secondary" style={{ fontSize: '0.85rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Close Module
          </button>
        </div>

        {/* Scrollable Tab Navigation */}
        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '24px' }}>
          <div className="hotel-tabs" style={{ display: 'inline-flex' }}>
            {tabs.map(t => (
              <div key={t.key} className={`hotel-tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}>
                <span style={{ marginRight: '6px', fontSize: '0.9rem' }}>{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', color: 'var(--hotel-text-muted)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--hotel-border)', borderTopColor: 'var(--hotel-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }}></div>
            <div>Loading property data...</div>
          </div>
        ) : (
          <div style={{ animation: 'slideInRight 0.3s ease' }}>
            {activeTab === 'frontdesk' && (
              <FrontDesk api={api} rooms={rooms} reservations={reservations}
                selectedPropertyId={selectedPropertyId} reload={loadData} onOpenFolio={handleOpenFolio} />
            )}
            {activeTab === 'tapechart' && (
              <TapeChart rooms={rooms} reservations={reservations}
                onNewReservation={handleNewReservation}
                onSelectReservation={res => setSelectedReservation(res)} />
            )}
            {activeTab === 'housekeeping' && (
              <HousekeepingDash rooms={rooms} updateStatus={handleUpdateRoomStatus} tasks={tasks} />
            )}
            {activeTab === 'inventory' && (
              <RoomManagement rooms={rooms} properties={properties}
                selectedPropertyId={selectedPropertyId} api={api} reload={loadData} />
            )}
            {activeTab === 'rates' && (
              <RateManagement api={api} selectedPropertyId={selectedPropertyId} reload={loadData} />
            )}
            {activeTab === 'guests' && (
              <GuestDirectory api={api} onNewReservationForGuest={handleNewReservationForGuest} />
            )}
            {activeTab === 'nightaudit' && (
              <NightAudit api={api} rooms={rooms} reservations={reservations} />
            )}
            {activeTab === 'otasync' && (
              <OTASync />
            )}
            {activeTab === 'bookingengine' && (
              <BookingEngine />
            )}
            {activeTab === 'maintenance' && (
              <MaintenanceBoard api={api} rooms={rooms} />
            )}
            {activeTab === 'reports' && (
              <HotelReports rooms={rooms} reservations={reservations} />
            )}
            {activeTab === 'revenue' && (
              <RevenueDashboard rooms={rooms} reservations={reservations} />
            )}
          </div>
        )}
      </div>

      {selectedReservation && (
        <GuestFolio reservation={selectedReservation} api={api}
          onClose={() => setSelectedReservation(null)} reload={loadData} />
      )}

      {/* Toast Notifications */}
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type}
          onClose={() => setToasts(prev => prev.filter(tt => tt.id !== t.id))} />
      ))}
    </div>
  );
};

(window as any).RitaPlugin = {
  mount: (container: any, props: any) => {
    const ReactDOM = (window as any).ReactDOM;
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(HotelPMS, props));
    (window as any).RitaPlugin._root = root;
  },
  unmount: () => {
    const root = (window as any).RitaPlugin._root;
    if (root) root.unmount();
  }
};
