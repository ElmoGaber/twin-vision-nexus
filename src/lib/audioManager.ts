/**
 * Audio Manager
 * Handles playing decision notification sounds across the application
 */

export type DecisionAction = 'approve' | 'reject' | 'execute';

interface AudioFiles {
  approve: string;
  reject: string;
  execute: string;
}

const AUDIO_FILES: AudioFiles = {
  approve: '/audio/decision-approve.mp3',
  reject: '/audio/decision-reject.mp3',
  execute: '/audio/decision-execute.mp3',
};

let sharedAudioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      sharedAudioContext = null;
    }
  }

  return sharedAudioContext;
};

const ensureAudioReady = async (audioContext: AudioContext | null): Promise<boolean> => {
  if (!audioContext) return false;

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return true;
  } catch (error) {
    console.warn('AudioContext resume failed:', error);
    return false;
  }
};

const playToneSequence = async (action: DecisionAction): Promise<void> => {
  const audioContext = getAudioContext();
  const ready = await ensureAudioReady(audioContext);
  if (!audioContext || !ready) return;

  const frequencies: Record<DecisionAction, number[]> = {
    approve: [650, 850],
    reject: [850, 450],
    execute: [520, 720, 920],
  };

  const tones = frequencies[action];
  const toneDuration = 130;
  const delayBetweenTones = 60;

  tones.forEach((frequency, index) => {
    const time = index * (toneDuration + delayBetweenTones);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    const startTime = audioContext.currentTime + time / 1000;
    gainNode.gain.setValueAtTime(0.45, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.015, startTime + toneDuration / 1000);

    oscillator.start(startTime);
    oscillator.stop(startTime + toneDuration / 1000);
  });
};

export const broadcastDecisionAction = (action: DecisionAction, source: string = 'system'): void => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent('tvnx:decision-action', {
    detail: {
      action,
      source,
      timestamp: Date.now(),
    },
  }));
};

/**
 * Play decision sound globally
 * Works in both Dashboard and VR views
 */
export const playDecisionSound = async (action: DecisionAction): Promise<void> => {
  try {
    const audioPath = AUDIO_FILES[action];
    const audio = new Audio(audioPath);
    audio.volume = 0.9;
    await audio.play();
  } catch (error) {
    console.warn(`Could not play ${action} file sound, using synthesized fallback:`, error);
    await playToneSequence(action);
  }
};

/**
 * Play multiple sounds in sequence
 */
export const playSequentialSounds = async (
  actions: DecisionAction[],
  delayMs: number = 300
): Promise<void> => {
  for (const action of actions) {
    await playDecisionSound(action);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
};

/**
 * Create an audio context for Web Audio API
 * Useful for advanced audio manipulation
 */
export const createAudioContext = (): AudioContext | null => {
  return getAudioContext();
};

/**
 * Play a sound effect using Web Audio API (no file needed)
 * Creates a simple beep sound programmatically
 */
export const playBeepSound = (
  frequency: number = 800,
  duration: number = 100,
  type: 'sine' | 'square' | 'sawtooth' = 'sine'
): void => {
  try {
    const audioContext = createAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Beep sound error:', error);
  }
};

/**
 * Play notification sounds based on decision action
 * Uses different frequencies for different actions
 */
export const playDecisionNotification = (action: DecisionAction): void => {
  void playDecisionSound(action);
};

export const playSystemDecisionEvent = (action: DecisionAction, source: string = 'system'): void => {
  broadcastDecisionAction(action, source);
  playDecisionNotification(action);
};
