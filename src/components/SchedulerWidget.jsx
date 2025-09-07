import React, { useState, useEffect } from 'react';
import { trackEvent } from '../lib/analytics';
import { showToast } from './Toast';

const SchedulerWidget = ({ 
  serviceType = 'CALL_60', 
  onBookingComplete,
  className = ''
}) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStep, setBookingStep] = useState('calendar'); // calendar, details, confirmation
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days ahead
  });

  // Service type configurations
  const serviceConfig = {
    'CALL_60': {
      name: '60-min Strategy Call',
      duration: 60,
      description: 'Deep-dive strategy session to tackle your biggest challenges',
      price: '$300'
    },
    'CALL_30': {
      name: '30-min Quick Call',
      duration: 30,
      description: 'Focused consultation for specific questions',
      price: '$150'
    },
    'SPARRING': {
      name: 'Strategy Sparring',
      duration: 60,
      description: 'Interactive strategy development session',
      price: '$250'
    }
  };

  const config = serviceConfig[serviceType];

  // Load available slots
  useEffect(() => {
    loadAvailableSlots();
  }, [serviceType, dateRange]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        service_type: serviceType,
        start_date: dateRange.start.toISOString(),
        end_date: dateRange.end.toISOString()
      });

      const response = await fetch(`/api/schedule/available?${params}`);
      const data = await response.json();

      if (data.success) {
        setSlots(data.data.slots || []);
        
        // Track scheduler usage
        trackEvent('scheduler_loaded', {
          service_type: serviceType,
          available_slots: data.data.slots?.length || 0
        });
      } else {
        showToast('Failed to load available time slots', 'error');
      }
    } catch (error) {
      console.error('Failed to load slots:', error);
      showToast('Error loading available times', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setBookingStep('details');
    
    trackEvent('scheduler_slot_selected', {
      service_type: serviceType,
      slot_id: slot.id,
      slot_time: slot.start_time
    });
  };

  const handleBooking = async () => {
    if (!selectedSlot || !customerInfo.name || !customerInfo.email) {
      showToast('Please fill in all required information', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/schedule/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          customer_email: customerInfo.email,
          customer_name: customerInfo.name,
          notes: customerInfo.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        setBookingStep('confirmation');
        
        // Track successful booking
        trackEvent('scheduler_booking_completed', {
          service_type: serviceType,
          slot_id: selectedSlot.id,
          customer_email: customerInfo.email,
          has_notes: !!customerInfo.notes
        });

        // Trigger calendar download
        if (data.data.calendar) {
          downloadCalendarEvent(data.data.calendar);
        }

        // Notify parent component
        if (onBookingComplete) {
          onBookingComplete(data.data.booking);
        }

        showToast('Booking confirmed! Calendar invite sent.', 'success');
      } else {
        showToast(data.error || 'Booking failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Booking error:', error);
      showToast('Error processing booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadCalendarEvent = (calendar) => {
    const blob = new Blob([calendar.ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = calendar.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatSlotTime = (slot) => {
    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);
    
    return {
      date: start.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: `${start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      })} - ${end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit'
      })}`
    };
  };

  const groupSlotsByDate = (slots) => {
    return slots.reduce((groups, slot) => {
      const date = new Date(slot.start_time).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(slot);
      return groups;
    }, {});
  };

  const renderCalendarView = () => {
    const groupedSlots = groupSlotsByDate(slots);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Select a time for your {config.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {config.description}
          </p>
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
            <span>{config.duration} minutes</span>
            <span>•</span>
            <span>{config.price}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading available times...</p>
          </div>
        ) : Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-muted-foreground mb-4">No available slots found</p>
            <button
              onClick={loadAvailableSlots}
              className="text-accent hover:text-accent/80 text-sm underline"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedSlots).map(([date, dateSlots]) => (
              <div key={date} className="space-y-2">
                <h4 className="font-medium text-foreground border-b border-border pb-1">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {dateSlots.map((slot) => {
                    const timeInfo = formatSlotTime(slot);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        className="p-3 text-left border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground">
                          {timeInfo.time.split(' - ')[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {config.duration} min
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Booking Details
        </h3>
        {selectedSlot && (
          <div className="bg-accent/10 rounded-lg p-4 mb-6">
            <div className="text-accent font-medium">
              {formatSlotTime(selectedSlot).date}
            </div>
            <div className="text-accent text-sm">
              {formatSlotTime(selectedSlot).time}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={customerInfo.notes}
            onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent h-20 resize-none"
            placeholder="Anything you'd like me to know before our session?"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setBookingStep('calendar')}
          className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleBooking}
          disabled={loading || !customerInfo.name || !customerInfo.email}
          className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-xl font-semibold text-foreground">
        Booking Confirmed!
      </h3>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-medium mb-2">
          Your {config.name} is scheduled
        </p>
        {selectedSlot && (
          <div className="text-green-700 text-sm">
            <div>{formatSlotTime(selectedSlot).date}</div>
            <div>{formatSlotTime(selectedSlot).time}</div>
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-sm">
        You'll receive a confirmation email with calendar invite and video call link.
      </p>
    </div>
  );

  return (
    <div className={`bg-surface border border-border rounded-xl p-6 ${className}`}>
      {bookingStep === 'calendar' && renderCalendarView()}
      {bookingStep === 'details' && renderDetailsForm()}
      {bookingStep === 'confirmation' && renderConfirmation()}
    </div>
  );
};

export default SchedulerWidget;
