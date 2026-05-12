import { useCallback } from 'react';
import {
  playDecisionSound,
  playDecisionNotification,
  DecisionAction,
} from '@/lib/audioManager';

/**
 * Custom hook for handling decision audio notifications
 * Provides easy access to audio playback functions
 */
export const useDecisionAudio = () => {
  const playApproveSound = useCallback(async () => {
    await playDecisionSound('approve');
  }, []);

  const playRejectSound = useCallback(async () => {
    await playDecisionSound('reject');
  }, []);

  const playExecuteSound = useCallback(async () => {
    await playDecisionSound('execute');
  }, []);

  const playNotification = useCallback((action: DecisionAction) => {
    playDecisionNotification(action);
  }, []);

  const playSoundForAction = useCallback(async (action: DecisionAction) => {
    // Try to play file first
    await playDecisionSound(action);
    // Also play notification sound as fallback/additional feedback
    playDecisionNotification(action);
  }, []);

  return {
    playApproveSound,
    playRejectSound,
    playExecuteSound,
    playNotification,
    playSoundForAction,
  };
};
