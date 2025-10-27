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
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.2s'
  },
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

export default function BookingSystem() {
 const [view, setView] = useState('public');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    personType: '',
    reason: '',
    contactMethod: 'WhatsApp'
  });
  const [bookings, setBookings] = useState([]);
  const [knownContacts, setKnownContacts] = useState([]);
  const [availability, setAvailability] = useState({});
  const [isKnownContact, setIsKnownContact] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', phone: '', tag: '' });
  const [webhookUrl, setWebhookUrl] = useState('');
  const [tempWebhookUrl, setTempWebhookUrl] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bookingsData = await window.storage.get('bookings');
      const contactsData = await window.storage.get('knownContacts');
      const availabilityData = await window.storage.get('availability');
      const webhookData = await window.storage.get('webhookUrl');
      
      if (bookingsData) setBookings(JSON.parse(bookingsData.value));
      if (contactsData) setKnownContacts(JSON.parse(contactsData.value));
      if (availabilityData) setAvailability(JSON.parse(availabilityData.value));
      if (webhookData) {
        setWebhookUrl(webhookData.value);
        setTempWebhookUrl(webhookData.value);
      }
    } catch (error) {
      console.log('No existing data, starting fresh');
    }
  };

  const saveBookings = async (data) => {
    try {
      await window.storage.set('bookings', JSON.stringify(data));
      setBookings(data);
    } catch (error) {
      console.error('Error saving bookings:', error);
    }
  };

  const saveKnownContacts = async (data) => {
    try {
      await window.storage.set('knownContacts', JSON.stringify(data));
      setKnownContacts(data);
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  const saveAvailability = async (data) => {
    try {
      await window.storage.set('availability', JSON.stringify(data));
      setAvailability(data);
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const saveWebhookUrl = async (url) => {
    try {
      await window.storage.set('webhookUrl', url);
      setWebhookUrl(url);
    } catch (error) {
      console.error('Error saving webhook URL:', error);
    }
  };

  const sendWebhook = async (eventType, data) => {
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
    return slots;
  };

  const isSlotAvailable = (date, time) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availability[dateStr];
    
    if (!dayAvailability) return true;
    if (dayAvailability.blocked) return false;
    if (dayAvailability.blockedSlots && dayAvailability.blockedSlots.includes(time)) return false;
    
    const isBooked = bookings.some(b => 
      b.status === 'accepted' && 
      b.date === dateStr && 
      b.time === time
    );
    
    return !isBooked;
  };

  const handleSubmit = async () => {
    if (isKnownContact) return;

    const newBooking = {
      id: Date.now().toString(),
      ...formData,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await saveBookings([...bookings, newBooking]);
    await sendWebhook('booking_created', newBooking);
    
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
  };

  const handleBookingAction = async (bookingId, action) => {
    const booking = bookings.find(b => b.id === bookingId);
    const updated = bookings.map(b => 
      b.id === bookingId ? { ...b, status: action } : b
    );
    await saveBookings(updated);
    
    await sendWebhook(`booking_${action}`, {
      ...booking,
      status: action,
      actionTimestamp: new Date().toISOString()
    });
  };

  const addKnownContact = async () => {
    if (!newContact.email && !newContact.phone) return;
    
    const contact = {
      id: Date.now().toString(),
      email: newContact.email,
      phone: newContact.phone,
      tag: newContact.tag,
      addedAt: new Date().toISOString()
    };
    
    await saveKnownContacts([...knownContacts, contact]);
    setNewContact({ email: '', phone: '', tag: '' });
  };

  const removeKnownContact = async (contactId) => {
    const updated = knownContacts.filter(c => c.id !== contactId);
    await saveKnownContacts(updated);
  };

  const toggleDateAvailability = async (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const newAvailability = {
      ...availability,
      [dateStr]: {
        blocked: !availability[dateStr]?.blocked,
        blockedSlots: availability[dateStr]?.blockedSlots || []
      }
    };
    await saveAvailability(newAvailability);
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const saveWebhookSettings = async () => {
    await saveWebhookUrl(tempWebhookUrl);
    alert('Webhook URL saved successfully!');
  };
  
  return (
    // Copy the entire JSX from the artifact
    <div>Booking System</div>
  );
}