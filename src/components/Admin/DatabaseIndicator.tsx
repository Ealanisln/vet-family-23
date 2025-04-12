import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function DatabaseIndicator() {
  const [dbStatus, setDbStatus] = useState<'development' | 'production' | 'error'>('error');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch('/api/db-status');
        const data = await response.json();
        
        if (data.status === 'success') {
          setDbStatus(data.environment === 'development' ? 'development' : 'production');
        } else {
          setDbStatus('error');
        }
      } catch (error) {
        console.error('Error checking database status:', error);
        setDbStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    checkDbStatus();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">DB:</span>
      <Badge 
        variant={dbStatus === 'error' ? 'destructive' : 'default'}
        className={dbStatus === 'development' ? 'bg-green-500 hover:bg-green-600' : ''}
      >
        {dbStatus.toUpperCase()}
      </Badge>
    </div>
  );
} 