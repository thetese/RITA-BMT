import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, CheckCircle, Trash2, Plus, Edit } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function Appointments({ currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const { showToast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutApt, setCheckoutApt] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountRate, setDiscountRate] = useState(0);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    providerId: '',
    startTime: '09:00',
    duration: 60,
    notes: ''
  });

  const loadData = async () => {
    if (!window.api) return;
    const apts = await window.api.getAppointments();
    setAppointments(apts || []);
    
    const prods = await window.api.getProducts();
    // Only standard or service products
    setServices(prods.filter(p => p.type !== 'combo'));

    // We can use accounters or users as providers
    const users = await window.api.getUsers();
    setProviders(users.map(u => ({ id: u.id, name: u.username })));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const openModal = (apt = null) => {
    if (apt) {
      setEditingAppointment(apt);
      setFormData({
        customerName: apt.customerName,
        customerPhone: apt.customerPhone,
        serviceId: apt.serviceId,
        providerId: apt.providerId,
        startTime: apt.startTime,
        duration: apt.duration,
        notes: apt.notes
      });
      setSelectedDate(apt.appointmentDate);
    } else {
      setEditingAppointment(null);
      setFormData({
        customerName: '',
        customerPhone: '',
        serviceId: '',
        providerId: '',
        startTime: '09:00',
        duration: 60,
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const saveAppointment = async (e) => {
    e.preventDefault();
    const service = services.find(s => s.id === formData.serviceId);
    const provider = providers.find(p => p.id === formData.providerId);
    
    if (!service || !provider) {
      showToast("Please select a valid service and provider.", "error");
      return;
    }

    const payload = {
      ...formData,
      appointmentDate: selectedDate,
      serviceName: service.productName,
      providerName: provider.name
    };

    if (editingAppointment) {
      await window.api.updateAppointment({ ...payload, id: editingAppointment.id });
      showToast("Appointment updated!", "success");
    } else {
      await window.api.addAppointment(payload);
      showToast("Appointment scheduled!", "success");
    }
    
    setIsModalOpen(false);
    loadData();
  };

  const deleteAppointment = async (id) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await window.api.deleteAppointment(id);
      showToast("Appointment cancelled.", "success");
      loadData();
    }
  };

  const openCheckout = (apt) => {
    setCheckoutApt(apt);
    setPaymentMethod('Cash');
    setDiscountRate(0);
    setIsCheckingOut(true);
  };

  const processCheckout = async () => {
    const service = services.find(s => s.id === checkoutApt.serviceId);
    if (!service) {
      showToast("Service product no longer exists.", "error");
      return;
    }

    const price = service.unitPrice;
    const discAmt = (price * discountRate) / 100;
    const total = price - discAmt;

    const saleItems = [{
      productId: service.id,
      productName: service.productName,
      category: service.category,
      quantity: 1,
      unitPrice: price,
      costPrice: service.costPrice || 0,
      taxTyCd: service.taxTyCd || 'B',
      itemCd: service.itemCd,
      itemClsCd: service.itemClsCd,
      discount: discountRate + '%'
    }];

    const payload = {
      items: saleItems,
      customerName: checkoutApt.customerName,
      paymentMethod,
      discountAmount: discAmt,
      discountRate: discountRate,
      waiterName: checkoutApt.providerName, // Provider acts as waiter/commission earner
      userId: currentUser.id,
      status: 'COMPLETED',
      date: new Date().toISOString()
    };

    try {
      await window.api.checkoutTransaction(payload);
      await window.api.updateAppointment({ ...checkoutApt, status: 'Completed' });
      showToast("Checkout successful! Sale recorded.", "success");
      setIsCheckingOut(false);
      setCheckoutApt(null);
      loadData();
    } catch (e) {
      showToast("Checkout failed: " + e.message, "error");
    }
  };

  const filteredApts = appointments.filter(a => a.appointmentDate === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={24} className="text-primary" /> Appointments Agenda
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="form-control"
          />
          <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={18} /> New Booking
          </button>
        </div>
      </div>

      <div className="table-wrap">
        {filteredApts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No appointments scheduled for this day.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Client</th>
                <th>Service</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApts.map(apt => (
                <tr key={apt.id} style={{ opacity: apt.status === 'Completed' ? 0.6 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                      <Clock size={16} /> {apt.startTime}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{apt.duration} min</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{apt.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{apt.customerPhone}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Scissors size={16} /> {apt.serviceName}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={16} /> {apt.providerName}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: apt.status === 'Completed' ? 'var(--success)' : 'var(--warning)', color: '#fff' }}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    {apt.status !== 'Completed' && (
                      <>
                        <button className="btn-sm btn-success" onClick={() => openCheckout(apt)} title="Checkout & Pay" style={{ marginRight: '5px' }}>
                          Checkout
                        </button>
                        <button className="btn-sm" onClick={() => openModal(apt)} title="Edit" style={{ marginRight: '5px' }}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => deleteAppointment(apt.id)} title="Cancel">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</h2>
            <form onSubmit={saveAppointment}>
              <div className="form-group">
                <label>Client Name</label>
                <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Client Phone</label>
                <input type="text" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Service</label>
                  <select required value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})}>
                    <option value="">Select Service...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.productName}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Provider</label>
                  <select required value={formData.providerId} onChange={e => setFormData({...formData, providerId: e.target.value})}>
                    <option value="">Select Provider...</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Time</label>
                  <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Duration (mins)</label>
                  <input required type="number" min="5" step="5" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCheckingOut && checkoutApt && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ color: 'var(--success)' }}>Checkout Appointment</h2>
            <div style={{ marginBottom: '20px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{checkoutApt.serviceName}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Client: {checkoutApt.customerName}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Provider: {checkoutApt.providerName}</div>
            </div>
            
            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="Cash">Cash</option>
                <option value="MoMo">Mobile Money (MoMo)</option>
                <option value="Card">Credit/Debit Card</option>
              </select>
            </div>

            <div className="form-group">
              <label>Discount (%)</label>
              <input type="number" min="0" max="100" value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} />
            </div>

            <div className="form-actions" style={{ marginTop: '30px' }}>
              <button className="btn-secondary" onClick={() => setIsCheckingOut(false)}>Cancel</button>
              <button className="btn-success" onClick={processCheckout} style={{ fontWeight: 'bold' }}>Complete Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
