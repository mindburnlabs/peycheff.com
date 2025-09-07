import React, { useEffect, useState } from 'react';
import { trackEvent } from '../lib/analytics';

const SuccessAnimation = ({ 
  show, 
  onComplete, 
  title = "Success!", 
  message = "Your purchase has been completed.",
  duration = 3000,
  showConfetti = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('initial'); // initial, checkmark, content, exit

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Track success animation show
      trackEvent('success_animation_shown', {
        title,
        duration
      });

      // Animation sequence
      const sequence = [
        { phase: 'checkmark', delay: 200 },
        { phase: 'content', delay: 800 },
        { phase: 'exit', delay: duration - 500 }
      ];

      sequence.forEach(({ phase, delay }) => {
        setTimeout(() => {
          setAnimationPhase(phase);
        }, delay);
      });

      // Complete and cleanup
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, duration);
    }
  }, [show, duration, onComplete, title]);

  if (!isVisible) return null;

  return (
    <>
      {/* Confetti Background */}
      {showConfetti && animationPhase === 'checkmark' && <Confetti />}
      
      {/* Success Overlay */}
      <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ${
        animationPhase === 'exit' 
          ? 'opacity-0 scale-95' 
          : 'opacity-100 scale-100'
      }`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
        
        {/* Success Card */}
        <div className={`relative bg-surface border border-border rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center transition-all duration-700 ${
          animationPhase === 'initial' 
            ? 'opacity-0 scale-90 translate-y-8' 
            : 'opacity-100 scale-100 translate-y-0'
        }`}>
          
          {/* Checkmark Animation */}
          <div className="mb-6">
            <div className={`relative mx-auto w-20 h-20 transition-all duration-500 ${
              animationPhase === 'checkmark' ? 'scale-100' : 'scale-0'
            }`}>
              {/* Circle background with animated border */}
              <div className="absolute inset-0 rounded-full bg-green-50 border-4 border-green-500">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="46" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-20"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="46" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="289"
                    strokeDashoffset={animationPhase === 'checkmark' ? 0 : 289}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
              </div>
              
              {/* Checkmark Icon */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 delay-300 ${
                animationPhase === 'checkmark' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}>
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7"
                    className="animate-[draw-check_0.5s_ease-out_forwards]"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className={`transition-all duration-500 delay-200 ${
            animationPhase === 'content' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}>
            <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
          </div>
          
          {/* Subtle pulse animation */}
          <div className={`absolute inset-0 rounded-3xl bg-accent/5 transition-all duration-1000 ${
            animationPhase === 'checkmark' ? 'animate-pulse-slow' : ''
          }`} />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 100;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 100 0;
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.1;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

// Confetti Component
const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 2 + 2,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
      size: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    }));

    setParticles(newParticles);

    // Animate particles
    const animate = () => {
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            rotation: particle.rotation + particle.rotationSpeed
          }))
          .filter(particle => particle.y < 120) // Remove particles that fall off screen
      );
    };

    const animationId = setInterval(animate, 16); // ~60fps

    // Cleanup after 3 seconds
    setTimeout(() => {
      clearInterval(animationId);
      setParticles([]);
    }, 3000);

    return () => clearInterval(animationId);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[190] overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: Math.max(0, 1 - particle.y / 100)
          }}
        />
      ))}
    </div>
  );
};

export default SuccessAnimation;
