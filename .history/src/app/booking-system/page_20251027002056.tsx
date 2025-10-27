'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Settings } from 'lucide-react';

const styles = {
    body: {
        minHeight: '100vh',
        backgroundColor: '#0A1628',
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#ffffff'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto'
    },
    card: {
        backgroundColor: '#1A2842',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
    },
    button: {
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '16px',
        transition: 'all 0.2s'
    } as React.CSSProperties,
    buttonPrimary: {
        backgroundColor: '#00D9FF',
        color: '#0A1628'
    },
    buttonOrange: {
        backgroundColor: '#FF6B00',
        color: '#ffffff'
    },
    buttonSuccess: {
        backgroundColor: '#10B981',
        color: '#ffffff'
    },
    buttonDanger: {
        backgroundColor: '#EF4444',
        color: '#ffffff'
    },
    input: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#243049',
        border: '1px solid rgba(0, 217, 255, 0.3)',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '16px',
        outline: 'none'
    },
    logo: {
        width: '40px',
        height: '40px',
        backgroundColor: '#00D9FF',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0A1628',
        fontWeight: 'bold',
        fontSize: '20px'
    }
};

interface Booking {
    id: string;
    name: string;
    email: string;
    phone: string;
    personType: string;
    reason: string;
    contactMethod: string;
    date: string;
    time: string;
    status: string;
    createdAt: string;
}

interface Contact {
    id: string;
    email: string;
    phone: string;
    tag: string;
    addedAt: string;
}

export default function BookingSystem() {
    const [view, setView] = useState<'public' | 'admin'>('public');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        personType: '',
        reason: '',
        contactMethod: 'WhatsApp'
    });
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [knownContacts, setKnownContacts] = useState<Contact[]>([]);
    const [availability, setAvailability] = useState<any>({});
    const [isKnownContact, setIsKnownContact] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [newContact, setNewContact] = useState({ email: '', phone: '', tag: '' });
    const [webhookUrl, setWebhookUrl] = useState('');
    const [tempWebhookUrl, setTempWebhookUrl] = useState('');
    const [activeTab, setActiveTab] = useState('bookings');

    const N8N_BASE_URL = 'https://n8n.edgecodershub.com/webhook-test';

    useEffect(() => {
        loadData();
    }, []);

    // Add this new useEffect to periodically refresh bookings
    useEffect(() => {
        // Reload data every 5 seconds when on public view
        if (view === 'public') {
            const interval = setInterval(() => {
                loadData();
            }, 5000); // Check every 5 seconds

            return () => clearInterval(interval);
        }
    }, [view]);

    const loadData = async () => {
        try {
             console.log('🔄 Loading data from n8n...');
            // Fetch bookings
            const bookingsRes = await fetch(`${N8N_BASE_URL}/get-bookings`);
            const bookingsData = await bookingsRes.json();

            console.log('Raw bookings data:', bookingsData); // Debug log

            if (bookingsData.booking && Array.isArray(bookingsData.booking)) {
                 // Transform the nested n8n structure to flat booking objects
      const transformedBookings = bookingsData.booking.map((item: any) => {
        const bookingData = item.json;
        
        // Normalize time format: "9:30" → "09:30"
        let normalizedTime = bookingData.Time || '';
        if (normalizedTime && !normalizedTime.match(/^\d{2}:/)) {
          const parts = normalizedTime.split(':');
          normalizedTime = parts[0].padStart(2, '0') + ':' + parts[1];
        }

                     return {
          id: bookingData.ID?.toString() || '',
          name: bookingData.Name || '',
          email: bookingData.Email || '',
          phone: bookingData.Phone?.toString() || '',
          personType: bookingData.PersonType || '',
          reason: bookingData.Reason || '',
          contactMethod: bookingData.ContactMethod || '',
          date: bookingData.Date || '',
          time: normalizedTime,
          status: bookingData.Status || '',
          createdAt: bookingData.CreatedAt || '',
        };
      });



                console.log('Transformed bookings:', transformedBookings); // Debug log
                setBookings(transformedBookings);

                // Also save to localStorage as backup
                localStorage.setItem('bookings', JSON.stringify(transformedBookings));
            }

            // Fetch known contacts
            const contactsRes = await fetch(`${N8N_BASE_URL}/get-contacts`);
            const contactsData = await contactsRes.json();

            if (contactsData.contacts) {
                const transformedContacts = contactsData.contacts.map((row: any[]) => ({
                    id: row[0],
                    email: row[1],
                    phone: row[2],
                    tag: row[3],
                    addedAt: row[4],
                }));
                setKnownContacts(transformedContacts);
            }
        } catch (error) {
            console.log('Error loading data:', error);
        }

        try {
            const localBookings = localStorage.getItem('bookings');
            if (localBookings) {
                setBookings(JSON.parse(localBookings));
            }
        } catch (localError) {
            console.error('Error loading from localStorage:', localError);
        }
    };

    const saveBookings = (data: Booking[]) => {
        try {
            localStorage.setItem('bookings', JSON.stringify(data));
            setBookings(data);
        } catch (error) {
            console.error('Error saving bookings:', error);
        }
    };

    const saveKnownContacts = (data: Contact[]) => {
        try {
            localStorage.setItem('knownContacts', JSON.stringify(data));
            setKnownContacts(data);
        } catch (error) {
            console.error('Error saving contacts:', error);
        }
    };

    const saveAvailability = (data: any) => {
        try {
            localStorage.setItem('availability', JSON.stringify(data));
            setAvailability(data);
        } catch (error) {
            console.error('Error saving availability:', error);
        }
    };

    const saveWebhookUrlData = (url: string) => {
        try {
            localStorage.setItem('webhookUrl', url);
            setWebhookUrl(url);
        } catch (error) {
            console.error('Error saving webhook URL:', error);
        }
    };

    const sendWebhook = async (eventType: string, data: any) => {
        if (!webhookUrl) return;

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventType,
                    timestamp: new Date().toISOString(),
                    data: data
                })
            });
        } catch (error) {
            console.error('Webhook error:', error);
        }
    };

    useEffect(() => {
        const checkKnownContact = () => {
            const isKnown = knownContacts.some(contact =>
                contact.email.toLowerCase() === formData.email.toLowerCase() ||
                contact.phone === formData.phone
            );
            setIsKnownContact(isKnown);
        };

        if (formData.email || formData.phone) {
            checkKnownContact();
        }
    }, [formData.email, formData.phone, knownContacts]);

    const generateDates = () => {
        const dates = [];
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        console.log('⏰ Generated time slots:', slots);
        return slots;
    };

    const isSlotAvailable = (date: Date, time: string) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayAvailability = availability[dateStr];

        console.log(`🔍 Checking slot: ${dateStr} at ${time}`);
        console.log('📚 All bookings:', bookings);

        // Log each booking for this date
        bookings.forEach((b, index) => {
            console.log(`Booking ${index + 1}:`, {
                id: b.id,
                name: b.name,
                date: b.date,
                time: b.time,
                status: b.status,
                dateMatch: b.date === dateStr,
                timeMatch: b.time === time,
                statusMatch: b.status === 'accepted'
            });
        });

        // Check if date is blocked
        if (dayAvailability?.blocked) {
            console.log('❌ Date is blocked in availability');
            return false;
        }
        if (dayAvailability?.blockedSlots?.includes(time)) {
            console.log('❌ Time slot is blocked in availability');
            return false;
        }

        // Check if slot is already booked (accepted bookings)
        const isBooked = bookings.some(b => {
            return b.status === 'accepted' &&
                b.date === dateStr &&
                b.time === time;
        });

        console.log(`Result: ${isBooked ? '❌ SLOT IS BOOKED' : '✅ SLOT IS AVAILABLE'}`);
        console.log('=== End Check ===\n');


        const handleSubmit = async () => {
            if (isKnownContact || !selectedDate || !selectedTime) return;

            const newBooking: Booking = {
                id: Date.now().toString(),
                ...formData,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            try {
                // Send to n8n webhook
                const response = await fetch(`${N8N_BASE_URL}/booking-create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'booking_created',
                        timestamp: new Date().toISOString(),
                        data: newBooking
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create booking');
                }

                // Wait a moment for Google Sheets to update
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Reload all bookings from Google Sheets
                await loadData();

                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    personType: '',
                    reason: '',
                    contactMethod: 'WhatsApp'
                });
                setSelectedDate(null);
                setSelectedTime(null);
                alert('Booking request submitted! You will receive a confirmation once reviewed.');
            } catch (error) {
                console.error('Error submitting booking:', error);
                alert('Failed to submit booking. Please try again.');
            }
        };

        const handleBookingAction = async (bookingId: string, action: string) => {
            const booking = bookings.find(b => b.id === bookingId);

            // Send to n8n (which will update Google Sheets and send email)
            await fetch(`${N8N_BASE_URL}/booking-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: `booking_${action}`,
                    timestamp: new Date().toISOString(),
                    data: {
                        ...booking,
                        status: action,
                        actionTimestamp: new Date().toISOString()
                    }
                })
            });

            // Reload data
            await loadData();
        };

        // Add auto-refresh for public view
        useEffect(() => {
            if (view === 'public') {
                const interval = setInterval(() => {
                    loadData();
                }, 10000); // Refresh every 10 seconds

                return () => clearInterval(interval);
            }
        }, [view]);

        const addKnownContact = () => {
            if (!newContact.email && !newContact.phone) return;

            const contact: Contact = {
                id: Date.now().toString(),
                email: newContact.email,
                phone: newContact.phone,
                tag: newContact.tag,
                addedAt: new Date().toISOString()
            };

            saveKnownContacts([...knownContacts, contact]);
            setNewContact({ email: '', phone: '', tag: '' });
        };

        const removeKnownContact = (contactId: string) => {
            const updated = knownContacts.filter(c => c.id !== contactId);
            saveKnownContacts(updated);
        };

        const toggleDateAvailability = (date: Date) => {
            const dateStr = date.toISOString().split('T')[0];
            const newAvailability = {
                ...availability,
                [dateStr]: {
                    blocked: !availability[dateStr]?.blocked,
                    blockedSlots: availability[dateStr]?.blockedSlots || []
                }
            };
            saveAvailability(newAvailability);
        };

        const handleAdminLogin = () => {
            if (adminPassword === 'admin123') {
                setIsAuthenticated(true);
            } else {
                alert('Incorrect password');
            }
        };

        const saveWebhookSettings = () => {
            saveWebhookUrlData(tempWebhookUrl);
            alert('Webhook URL saved successfully!');
        };

        // PUBLIC VIEW
        if (view === 'public') {
            return (
                <div style={styles.body}>
                    <div style={styles.container}>
                        <div style={styles.card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={styles.logo}>EC</div>
                                <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#ffffff' }}>EdgeCodersHub</h1>
                            </div>
                            <p style={{ fontSize: '18px', color: '#B0B0B0', marginBottom: '16px' }}>Schedule a call with me</p>
                            <button
                                onClick={() => {
                                    console.log('Switching to admin view');
                                    setView('admin');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#00D9FF',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Admin Access
                            </button>
                        </div>

                        {isKnownContact && (formData.email || formData.phone) && (
                            <div style={{
                                ...styles.card,
                                border: '2px solid #00D9FF'
                            }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <CheckCircle color="#00D9FF" size={24} />
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                            Hey there! 👋
                                        </h3>
                                        <p style={{ color: '#B0B0B0' }}>
                                            You don&apos;t need to book through this system! I&apos;ll get back to you directly soon.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isKnownContact && (
                            <>
                                <div style={styles.card}>
                                    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar color="#00D9FF" size={24} />
                                        Select a Date
                                    </h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                                        {generateDates().map((date, idx) => {
                                            const isAvailable = !availability[date.toISOString().split('T')[0]]?.blocked;
                                            const isSelected = selectedDate?.toDateString() === date.toDateString();

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => isAvailable && setSelectedDate(date)}
                                                    disabled={!isAvailable}
                                                    style={{
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                                                        backgroundColor: isSelected ? '#00D9FF' : isAvailable ? '#243049' : '#1A2030',
                                                        color: isSelected ? '#0A1628' : isAvailable ? '#ffffff' : '#666',
                                                        textAlign: 'center',
                                                        fontWeight: isSelected ? 'bold' : 'normal'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '12px' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                    <div style={{ fontWeight: '600' }}>{date.getDate()}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedDate && (
                                    <div style={styles.card}>
                                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock color="#00D9FF" size={24} />
                                            Select a Time
                                        </h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                            {generateTimeSlots().map((time, idx) => {
                                                const available = isSlotAvailable(selectedDate, time);
                                                const isSelected = selectedTime === time;

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => available && setSelectedTime(time)}
                                                        disabled={!available}
                                                        style={{
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            cursor: available ? 'pointer' : 'not-allowed',
                                                            backgroundColor: isSelected ? '#00D9FF' : available ? '#243049' : '#1A2030',
                                                            color: isSelected ? '#0A1628' : available ? '#ffffff' : '#666',
                                                            fontWeight: isSelected ? 'bold' : 'normal',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        {time}
                                                        {!available && (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', color: '#EF4444' }}>
                                                                Booked
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {selectedDate && selectedTime && (
                                    <div style={styles.card}>
                                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Your Details</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#B0B0B0', marginBottom: '4px' }}>
                                                    Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    style={styles.input}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#B0B0B0', marginBottom: '4px' }}>
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    style={styles.input}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#B0B0B0', marginBottom: '4px' }}>
                                                    Phone Number (WhatsApp) *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    style={styles.input}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#B0B0B0', marginBottom: '4px' }}>
                                                    I am a... *
                                                </label>
                                                <select
                                                    value={formData.personType}
                                                    onChange={(e) => setFormData({ ...formData, personType: e.target.value })}
                                                    style={styles.input}
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="Developer">Developer</option>
                                                    <option value="Recruiter">Recruiter</option>
                                                    <option value="Business Partner">Business Partner</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#B0B0B0', marginBottom: '4px' }}>
                                                    Reason for Meeting *
                                                </label>
                                                <textarea
                                                    value={formData.reason}
                                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                    rows={4}
                                                    style={styles.input}
                                                    placeholder="Please briefly describe what you'd like to discuss..."
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#B0B0B0', marginBottom: '4px' }}>
                                                    Preferred Contact Method *
                                                </label>
                                                <select
                                                    value={formData.contactMethod}
                                                    onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                                                    style={styles.input}
                                                >
                                                    <option value="WhatsApp">WhatsApp Call</option>
                                                    <option value="Online Meeting">Online Meeting (Zoom/Teams)</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={handleSubmit}
                                                style={{
                                                    ...styles.button,
                                                    ...styles.buttonOrange,
                                                    width: '100%',
                                                    marginTop: '8px'
                                                }}
                                            >
                                                Submit Booking Request
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        }

        // LOGIN VIEW
        if (!isAuthenticated) {
            return (
                <div style={{ ...styles.body, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ ...styles.card, maxWidth: '400px', width: '100%' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Admin Login</h2>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                            style={{ ...styles.input, marginBottom: '16px' }}
                        />
                        <button
                            onClick={handleAdminLogin}
                            style={{
                                ...styles.button,
                                ...styles.buttonPrimary,
                                width: '100%',
                                marginBottom: '12px'
                            }}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setView('public')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#B0B0B0',
                                cursor: 'pointer',
                                width: '100%',
                                padding: '8px'
                            }}
                        >
                            Back to Public View
                        </button>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '16px' }}>Default password: admin123</p>
                    </div>
                </div>
            );
        }

        // ADMIN DASHBOARD
        return (
            <div style={styles.body}>
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={styles.logo}>EC</div>
                                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Admin Dashboard</h1>
                            </div>
                            <button
                                onClick={() => {
                                    setView('public');
                                    setIsAuthenticated(false);
                                    setAdminPassword('');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#00D9FF',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Public View
                            </button>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 217, 255, 0.2)' }}>
                            {['bookings', 'contacts', 'availability', 'settings'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: activeTab === tab ? '2px solid #00D9FF' : '2px solid transparent',
                                        color: activeTab === tab ? '#00D9FF' : '#B0B0B0',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        fontWeight: '500'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: '24px 0' }}>
                            {activeTab === 'bookings' && (
                                <>
                                    <div style={{ marginBottom: '32px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Pending Requests</h3>
                                        {bookings.filter(b => b.status === 'pending').length === 0 ? (
                                            <p style={{ color: '#B0B0B0' }}>No pending bookings</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {bookings.filter(b => b.status === 'pending').map((booking) => (
                                                    <div key={booking.id} style={{
                                                        backgroundColor: '#243049',
                                                        border: '1px solid rgba(0, 217, 255, 0.2)',
                                                        borderRadius: '8px',
                                                        padding: '16px'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                            <div>
                                                                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{booking.name}</h4>
                                                                <p style={{ fontSize: '14px', color: '#B0B0B0' }}>{booking.personType}</p>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <p style={{ fontWeight: '500', color: '#00D9FF' }}>{booking.date}</p>
                                                                <p style={{ fontSize: '14px', color: '#B0B0B0' }}>{booking.time}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '14px', color: '#B0B0B0', marginBottom: '12px' }}>
                                                            <p style={{ marginBottom: '4px' }}><strong style={{ color: '#fff' }}>Email:</strong> {booking.email}</p>
                                                            <p style={{ marginBottom: '4px' }}><strong style={{ color: '#fff' }}>Phone:</strong> {booking.phone}</p>
                                                            <p style={{ marginBottom: '4px' }}><strong style={{ color: '#fff' }}>Contact via:</strong> {booking.contactMethod}</p>
                                                            <p><strong style={{ color: '#fff' }}>Reason:</strong> {booking.reason}</p>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleBookingAction(booking.id, 'accepted')}
                                                                style={{
                                                                    ...styles.button,
                                                                    ...styles.buttonSuccess,
                                                                    flex: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '8px'
                                                                }}
                                                            >
                                                                <CheckCircle size={18} />
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleBookingAction(booking.id, 'declined')}
                                                                style={{
                                                                    ...styles.button,
                                                                    ...styles.buttonDanger,
                                                                    flex: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '8px'
                                                                }}
                                                            >
                                                                <XCircle size={18} />
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Upcoming Appointments</h3>
                                        {bookings.filter(b => b.status === 'accepted').length === 0 ? (
                                            <p style={{ color: '#B0B0B0' }}>No upcoming appointments</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {bookings.filter(b => b.status === 'accepted').map((booking) => (
                                                    <div key={booking.id} style={{
                                                        backgroundColor: '#243049',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        borderRadius: '8px',
                                                        padding: '16px'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <div>
                                                                <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{booking.name}</h4>
                                                                <p style={{ fontSize: '14px', color: '#B0B0B0' }}>{booking.email} • {booking.phone}</p>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <p style={{ fontWeight: '500', color: '#10B981' }}>{booking.date} at {booking.time}</p>
                                                                <p style={{ fontSize: '14px', color: '#B0B0B0' }}>{booking.contactMethod}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {activeTab === 'contacts' && (
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Manage Known Contacts</h3>
                                    <div style={{
                                        backgroundColor: '#243049',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '16px',
                                        border: '1px solid rgba(0, 217, 255, 0.2)'
                                    }}>
                                        <h4 style={{ fontWeight: '500', marginBottom: '12px' }}>Add New Contact</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={newContact.email}
                                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                                style={styles.input}
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone"
                                                value={newContact.phone}
                                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                                style={styles.input}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Tag (e.g., Friend)"
                                                value={newContact.tag}
                                                onChange={(e) => setNewContact({ ...newContact, tag: e.target.value })}
                                                style={styles.input}
                                            />
                                        </div>
                                        <button
                                            onClick={addKnownContact}
                                            style={{
                                                ...styles.button,
                                                ...styles.buttonPrimary
                                            }}
                                        >
                                            Add Contact
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {knownContacts.length === 0 ? (
                                            <p style={{ color: '#B0B0B0' }}>No known contacts added yet</p>
                                        ) : (
                                            knownContacts.map((contact) => (
                                                <div key={contact.id} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    backgroundColor: '#243049',
                                                    border: '1px solid rgba(0, 217, 255, 0.2)',
                                                    borderRadius: '8px',
                                                    padding: '12px'
                                                }}>
                                                    <div>
                                                        <p style={{ fontWeight: '500' }}>{contact.email || contact.phone}</p>
                                                        {contact.tag && <p style={{ fontSize: '14px', color: '#B0B0B0' }}>{contact.tag}</p>}
                                                    </div>
                                                    <button
                                                        onClick={() => removeKnownContact(contact.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#EF4444',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'availability' && (
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Manage Availability</h3>
                                    <p style={{ color: '#B0B0B0', marginBottom: '16px' }}>Click on dates to block/unblock them</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                                        {generateDates().map((date, idx) => {
                                            const dateStr = date.toISOString().split('T')[0];
                                            const isBlocked = availability[dateStr]?.blocked;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => toggleDateAvailability(date)}
                                                    style={{
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        border: isBlocked ? '2px solid #EF4444' : '2px solid rgba(16, 185, 129, 0.3)',
                                                        backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.1)' : '#243049',
                                                        color: isBlocked ? '#EF4444' : '#ffffff',
                                                        cursor: 'pointer',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '12px' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                    <div style={{ fontWeight: '600' }}>{date.getDate()}</div>
                                                    <div style={{ fontSize: '12px', marginTop: '4px' }}>{isBlocked ? 'Blocked' : 'Available'}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>n8n Webhook Integration</h3>
                                    <div style={{
                                        backgroundColor: '#243049',
                                        borderRadius: '8px',
                                        padding: '24px',
                                        border: '1px solid rgba(0, 217, 255, 0.2)'
                                    }}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <h4 style={{ fontWeight: '500', marginBottom: '8px' }}>Webhook URL</h4>
                                            <p style={{ fontSize: '14px', color: '#B0B0B0', marginBottom: '12px' }}>
                                                Enter your n8n webhook URL to receive booking notifications
                                            </p>
                                            <input
                                                type="url"
                                                placeholder="https://your-n8n-instance.com/webhook/..."
                                                value={tempWebhookUrl}
                                                onChange={(e) => setTempWebhookUrl(e.target.value)}
                                                style={{ ...styles.input, marginBottom: '12px' }}
                                            />
                                            <button
                                                onClick={saveWebhookSettings}
                                                style={{
                                                    ...styles.button,
                                                    ...styles.buttonPrimary
                                                }}
                                            >
                                                Save Webhook URL
                                            </button>
                                        </div>

                                        <div style={{
                                            backgroundColor: '#1A2842',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            border: '1px solid rgba(0, 217, 255, 0.2)',
                                            marginBottom: '24px'
                                        }}>
                                            <h4 style={{ fontWeight: '500', marginBottom: '12px' }}>Webhook Events</h4>
                                            <div style={{ fontSize: '14px', color: '#B0B0B0' }}>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <span style={{ color: '#00D9FF' }}>• </span>
                                                    <strong style={{ color: '#ffffff' }}>booking_created:</strong> Triggered when a new booking is submitted
                                                </div>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <span style={{ color: '#00D9FF' }}>• </span>
                                                    <strong style={{ color: '#ffffff' }}>booking_accepted:</strong> Triggered when you accept a booking
                                                </div>
                                                <div>
                                                    <span style={{ color: '#00D9FF' }}>• </span>
                                                    <strong style={{ color: '#ffffff' }}>booking_declined:</strong> Triggered when you decline a booking
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            backgroundColor: '#1A2842',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            border: '1px solid rgba(0, 217, 255, 0.2)'
                                        }}>
                                            <h4 style={{ fontWeight: '500', marginBottom: '8px' }}>Example Payload</h4>
                                            <pre style={{
                                                fontSize: '12px',
                                                color: '#B0B0B0',
                                                overflowX: 'auto',
                                                margin: 0
                                            }}>
                                                {`{
  "event": "booking_created",
  "timestamp": "2025-10-26T10:30:00Z",
  "data": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "personType": "Developer",
    "reason": "Discuss project...",
    "contactMethod": "WhatsApp",
    "date": "2025-10-30",
    "time": "14:00",
    "status": "pending"
  }
}`}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}