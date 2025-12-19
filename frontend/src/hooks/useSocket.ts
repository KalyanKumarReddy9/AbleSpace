import { useEffect } from 'react';
import socketService from '../services/socketService';

export const useSocket = (userId: string | null) => {
  useEffect(() => {
    if (userId) {
      socketService.connect(userId);
    }

    return () => {
      socketService.disconnect();
    };
  }, [userId]);
};