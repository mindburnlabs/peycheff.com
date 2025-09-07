import React, { useState } from 'react';
import SchedulerWidget from '../components/SchedulerWidget';
import SEO from '../components/SEO';

const ScheduleDemo = () => {
  const [selectedService, setSelectedService] = useState('CALL_60');
  const [bookings, setBookings] = useState([]);

  const services = [
    {
      id: 'CALL_60',
      name: '60-min Strategy Call',
      description: 'Deep-dive strategy session to tackle your biggest challenges',
      duration: '60 minutes',
      price: '$300'
    },
    {
      id: 'CALL_30',
      name: '30-min Quick Call',
      description: 'Focused consultation for specific questions',
      duration: '30 minutes',
      price: '$150'
    },
    {
      id: 'SPARRING',
      name: 'Strategy Sparring',
      description: 'Interactive strategy development session',
      duration: '60 minutes',
      price: '$250'
    }
  ];

  const handleBookingComplete = (booking) => {
    setBookings(prev => [...prev, booking]);
  };

  return (
    <>
      <SEO 
        title="Schedule a Session - Ivan Peycheff"
        description="Book a strategy session with Ivan Peycheff. Choose from 30-minute consultations, 60-minute deep dives, or interactive sparring sessions."
      />
      
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Schedule a Session
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Book a one-on-one strategy session to accelerate your growth, solve specific challenges, 
              or explore new opportunities.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Service Selection */}
            <div className="lg:col-span-4">
              <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Choose Your Session
                </h2>
                <div className="space-y-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedService === service.id
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-border hover:border-accent/50 text-foreground'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{service.name}</h3>
                        <span className="text-sm font-semibold">{service.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {service.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {service.duration}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Recent Bookings (Demo) */}
                {bookings.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Recent Bookings
                    </h3>
                    <div className="space-y-2">
                      {bookings.slice(0, 3).map((booking, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="text-sm font-medium text-green-800">
                            {booking.service_type} - {booking.customer_name}
                          </div>
                          <div className="text-xs text-green-600">
                            {new Date(booking.start_time).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduler Widget */}
            <div className="lg:col-span-8">
              <SchedulerWidget
                serviceType={selectedService}
                onBookingComplete={handleBookingComplete}
                className="h-fit"
              />
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Instant Booking
              </h3>
              <p className="text-muted-foreground text-sm">
                See real availability and book instantly. No back-and-forth emails.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Video Call Included
              </h3>
              <p className="text-muted-foreground text-sm">
                High-quality video call link included in your confirmation email.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Money-Back Guarantee
              </h3>
              <p className="text-muted-foreground text-sm">
                If you're not satisfied, get a full refund within 24 hours.
              </p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-16 bg-surface border border-border rounded-xl p-8">
            <div className="max-w-3xl mx-auto text-center">
              <blockquote className="text-lg text-foreground mb-4">
                "Ivan helped us identify three critical growth opportunities we completely missed. 
                The 60-minute session was worth months of internal discussions."
              </blockquote>
              <div className="text-sm text-muted-foreground">
                — Sarah Chen, CEO at TechFlow
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleDemo;
