import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

export function RealtimeStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-status-check')
      .subscribe((status, err) => {
        console.log('[RealtimeStatus] Connection status:', status, err);
        
        if (status === 'SUBSCRIBED') {
          setStatus('connected');
          setLastUpdate(new Date());
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setStatus('error');
        } else if (status === 'CLOSED') {
          setStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Real-time Active',
        };
      case 'connecting':
        return {
          icon: Wifi,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: 'Connecting...',
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Disconnected',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Connection Error',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <Icon className={`w-4 h-4 ${config.color} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
      <span className={`text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
      {lastUpdate && status === 'connected' && (
        <span className="text-[10px] text-gray-400">
          ({lastUpdate.toLocaleTimeString()})
        </span>
      )}
    </div>
  );
}
