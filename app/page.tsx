'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

interface Call {
  id: string;
  caller: string;
  phone: string;
  time: string;
  duration: number;
  status: 'incoming' | 'active' | 'completed' | 'missed';
  transcript: Message[];
}

interface Message {
  role: 'caller' | 'agent';
  text: string;
  time: string;
}

const callerNames = [
  'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson',
  'Jennifer Brown', 'Robert Taylor', 'Amanda Miller', 'Christopher Lee',
  'Jessica Martinez', 'Daniel Anderson', 'Ashley Thomas', 'Matthew Jackson'
];

const callerMessages = [
  "Hi, I'm calling about my recent order. Can you help me track it?",
  "Hello, I have a question about your business hours.",
  "Hey, I need to reschedule my appointment for next week.",
  "Hi there, I'm interested in your services. Can you tell me more?",
  "Good morning, I'm calling to follow up on my previous inquiry.",
  "Hello, I'd like to make a reservation for this weekend.",
  "Hi, I have a complaint about a product I purchased.",
  "Hey, can you help me with my account settings?",
  "Good afternoon, I'm calling about the job posting.",
  "Hi, I need technical support with your app.",
];

const agentResponses: { [key: string]: string[] } = {
  order: [
    "I'd be happy to help you track your order! Let me look that up for you.",
    "I can see your order is currently being processed and will be shipped within 2-3 business days.",
    "Is there anything else I can help you with regarding your order?"
  ],
  hours: [
    "Of course! Our business hours are Monday through Friday, 9 AM to 6 PM.",
    "We're also open on Saturdays from 10 AM to 4 PM.",
    "Would you like me to schedule an appointment during these hours?"
  ],
  appointment: [
    "Absolutely, I can help you reschedule your appointment.",
    "I have availability on Tuesday and Thursday next week. Which works better for you?",
    "Great, I've rescheduled your appointment. You'll receive a confirmation shortly."
  ],
  services: [
    "I'd love to tell you about our services!",
    "We offer comprehensive solutions tailored to your needs.",
    "Would you like me to send you a detailed brochure via email?"
  ],
  default: [
    "Thank you for calling! I'm your AI assistant and I'm here to help.",
    "I understand. Let me assist you with that right away.",
    "Is there anything else I can help you with today?",
    "Thank you for your patience. I've noted your request.",
    "I'll make sure this is handled promptly for you."
  ]
};

export default function Home() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    answeredCalls: 0,
    avgDuration: 0,
    satisfaction: 98
  });
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Generate random phone number
  const generatePhone = () => {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `+1 (${areaCode}) ${prefix}-${line}`;
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Simulate incoming call
  useEffect(() => {
    if (!isAgentActive) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7 && !activeCall) {
        const newCall: Call = {
          id: Date.now().toString(),
          caller: callerNames[Math.floor(Math.random() * callerNames.length)],
          phone: generatePhone(),
          time: formatTime(new Date()),
          duration: 0,
          status: 'incoming',
          transcript: []
        };
        
        setCalls(prev => [newCall, ...prev]);
        
        // Auto-answer after 2 seconds
        setTimeout(() => {
          setCalls(prev => prev.map(c => 
            c.id === newCall.id ? { ...c, status: 'active' } : c
          ));
          setActiveCall({ ...newCall, status: 'active' });
          setStats(prev => ({ ...prev, totalCalls: prev.totalCalls + 1, answeredCalls: prev.answeredCalls + 1 }));
        }, 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAgentActive, activeCall]);

  // Handle active call conversation
  useEffect(() => {
    if (!activeCall || activeCall.status !== 'active') return;

    const callerMessage = callerMessages[Math.floor(Math.random() * callerMessages.length)];
    
    // Caller speaks first
    setTimeout(() => {
      const callerMsg: Message = {
        role: 'caller',
        text: callerMessage,
        time: formatTime(new Date())
      };
      
      setActiveCall(prev => prev ? {
        ...prev,
        transcript: [...prev.transcript, callerMsg]
      } : null);
    }, 1500);

    // Agent responds
    setTimeout(() => {
      const responseKey = callerMessage.toLowerCase().includes('order') ? 'order' :
                          callerMessage.toLowerCase().includes('hour') ? 'hours' :
                          callerMessage.toLowerCase().includes('appointment') || callerMessage.toLowerCase().includes('reschedule') ? 'appointment' :
                          callerMessage.toLowerCase().includes('service') ? 'services' : 'default';
      
      const responses = agentResponses[responseKey];
      const agentMsg: Message = {
        role: 'agent',
        text: responses[0],
        time: formatTime(new Date())
      };
      
      setActiveCall(prev => prev ? {
        ...prev,
        transcript: [...prev.transcript, agentMsg]
      } : null);
    }, 3500);

    // Continue conversation
    setTimeout(() => {
      const followUp: Message = {
        role: 'caller',
        text: "That's helpful, thank you.",
        time: formatTime(new Date())
      };
      
      setActiveCall(prev => prev ? {
        ...prev,
        transcript: [...prev.transcript, followUp]
      } : null);
    }, 6000);

    // Agent final response
    setTimeout(() => {
      const finalMsg: Message = {
        role: 'agent',
        text: "You're welcome! Is there anything else I can help you with?",
        time: formatTime(new Date())
      };
      
      setActiveCall(prev => prev ? {
        ...prev,
        transcript: [...prev.transcript, finalMsg]
      } : null);
    }, 8000);

    // End call
    setTimeout(() => {
      const endMsg: Message = {
        role: 'caller',
        text: "No, that's all. Thanks for your help!",
        time: formatTime(new Date())
      };
      
      setActiveCall(prev => prev ? {
        ...prev,
        transcript: [...prev.transcript, endMsg]
      } : null);

      setTimeout(() => {
        const duration = Math.floor(Math.random() * 180) + 60;
        setCalls(prev => prev.map(c => 
          c.id === activeCall.id ? { ...c, status: 'completed', duration, transcript: activeCall.transcript } : c
        ));
        setActiveCall(null);
        setStats(prev => ({
          ...prev,
          avgDuration: Math.floor((prev.avgDuration * (prev.answeredCalls - 1) + duration) / prev.answeredCalls)
        }));
      }, 2000);
    }, 10000);

  }, [activeCall?.id]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [activeCall?.transcript]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h1>AI Call Agent</h1>
        </div>
        <div className={styles.agentToggle}>
          <span className={styles.toggleLabel}>Agent Status</span>
          <button 
            className={`${styles.toggleButton} ${isAgentActive ? styles.active : ''}`}
            onClick={() => setIsAgentActive(!isAgentActive)}
          >
            <span className={styles.toggleSlider}></span>
            {isAgentActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.totalCalls}</span>
          <span className={styles.statLabel}>Total Calls</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.answeredCalls}</span>
          <span className={styles.statLabel}>Answered</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatDuration(stats.avgDuration)}</span>
          <span className={styles.statLabel}>Avg Duration</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.satisfaction}%</span>
          <span className={styles.statLabel}>Satisfaction</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Active Call Panel */}
        <div className={styles.activeCallPanel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.pulsingDot}></span>
            Live Call
          </h2>
          
          {activeCall ? (
            <div className={styles.activeCall}>
              <div className={styles.callerInfo}>
                <div className={styles.avatar}>
                  {activeCall.caller.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={styles.callerDetails}>
                  <h3>{activeCall.caller}</h3>
                  <p>{activeCall.phone}</p>
                </div>
                <div className={styles.callStatus}>
                  <span className={styles.statusBadge}>In Progress</span>
                </div>
              </div>
              
              <div className={styles.transcript} ref={transcriptRef}>
                {activeCall.transcript.map((msg, idx) => (
                  <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageSender}>
                        {msg.role === 'caller' ? activeCall.caller : 'AI Agent'}
                      </span>
                      <span className={styles.messageTime}>{msg.time}</span>
                    </div>
                    <p className={styles.messageText}>{msg.text}</p>
                  </div>
                ))}
                {activeCall.transcript.length === 0 && (
                  <div className={styles.connecting}>
                    <div className={styles.connectingDots}>
                      <span></span><span></span><span></span>
                    </div>
                    <p>Connecting call...</p>
                  </div>
                )}
              </div>
              
              <div className={styles.agentStatus}>
                <div className={styles.agentAvatar}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div className={styles.agentInfo}>
                  <span className={styles.agentName}>AI Agent Active</span>
                  <span className={styles.agentAction}>Handling conversation...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noActiveCall}>
              <div className={styles.waitingIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3>Waiting for calls...</h3>
              <p>The AI agent will automatically answer incoming calls</p>
            </div>
          )}
        </div>

        {/* Call History */}
        <div className={styles.callHistory}>
          <h2 className={styles.sectionTitle}>Call History</h2>
          <div className={styles.callList}>
            {calls.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No calls yet</p>
                <span>Incoming calls will appear here</span>
              </div>
            ) : (
              calls.map(call => (
                <div key={call.id} className={`${styles.callItem} ${styles[call.status]}`}>
                  <div className={styles.callItemAvatar}>
                    {call.caller.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={styles.callItemInfo}>
                    <h4>{call.caller}</h4>
                    <p>{call.phone}</p>
                  </div>
                  <div className={styles.callItemMeta}>
                    <span className={`${styles.callItemStatus} ${styles[call.status]}`}>
                      {call.status === 'incoming' ? '📞 Incoming' :
                       call.status === 'active' ? '🟢 Active' :
                       call.status === 'completed' ? '✓ Completed' : '✗ Missed'}
                    </span>
                    <span className={styles.callItemTime}>{call.time}</span>
                    {call.duration > 0 && (
                      <span className={styles.callItemDuration}>{formatDuration(call.duration)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Agent Capabilities */}
      <div className={styles.capabilities}>
        <h2 className={styles.sectionTitle}>Agent Capabilities</h2>
        <div className={styles.capabilityGrid}>
          <div className={styles.capability}>
            <div className={styles.capabilityIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <h3>Voice Recognition</h3>
            <p>Advanced speech-to-text for accurate call transcription</p>
          </div>
          <div className={styles.capability}>
            <div className={styles.capabilityIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3>Smart Responses</h3>
            <p>Context-aware AI that understands caller intent</p>
          </div>
          <div className={styles.capability}>
            <div className={styles.capabilityIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>24/7 Availability</h3>
            <p>Never miss a call, day or night</p>
          </div>
          <div className={styles.capability}>
            <div className={styles.capabilityIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3>Call Logging</h3>
            <p>Complete transcripts and call analytics</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>AI Call Agent &copy; 2024 | Powered by Advanced AI</p>
      </footer>
    </main>
  );
}
