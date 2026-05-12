# Decision Audio Notification System

## Overview
The decision audio notification system provides real-time audio feedback when users make decisions (Approve, Reject, Execute) in both the Dashboard and VR environments. This enhances user experience by providing immediate audio confirmation of actions.

## Features

### 🔊 Audio Feedback Types
1. **Approve** - Rising tone sequence (600Hz → 800Hz) - indicates approval accepted
2. **Reject** - Falling tone sequence (800Hz → 400Hz) - indicates rejection confirmed
3. **Execute** - Ascending tone sequence (500Hz → 700Hz → 900Hz) - indicates execution started

### 📍 Where Audio Plays
- **Dashboard**: DecisionLayerPanel component
  - Pending Decisions section (Approve/Reject buttons)
  - Active Decisions section (Execute buttons)
- **VR View**: IndustrialVRScene HUD
  - Pending Decisions panel (Execute/Reject buttons)
  - All decision interactions

## Implementation Architecture

### Files Created/Modified

#### New Files:
1. **`src/lib/audioManager.ts`**
   - Core audio management utilities
   - Supports both file-based and Web Audio API audio
   - Functions:
     - `playDecisionSound()` - Play audio files from public folder
     - `playDecisionNotification()` - Play programmatic tones
     - `playBeepSound()` - Single frequency sound
     - `createAudioContext()` - Web Audio API context creation

2. **`src/hooks/use-decision-audio.ts`**
   - React custom hook for easy audio integration
   - Provides callbacks for different decision actions
   - Functions:
     - `playApproveSound()` - Play approval sound
     - `playRejectSound()` - Play rejection sound
     - `playExecuteSound()` - Play execution sound
     - `playSoundForAction()` - Universal handler

#### Modified Files:
1. **`src/contexts/VRContext.tsx`**
   - Added audio playback to decision handlers:
     - `approveDecision()` - Plays approve notification
     - `rejectDecision()` - Plays reject notification
     - `executeDecision()` - Plays execute notification

2. **`src/components/dashboard/DecisionLayerPanel.tsx`**
   - Integrated `useDecisionAudio` hook
   - Added audio playback to Pending Decisions buttons
   - Added audio playback to Active Decisions buttons

3. **`src/components/vr/IndustrialVRScene.tsx`**
   - Integrated `useDecisionAudio` hook
   - Added audio playback to VR decision buttons

## Usage

### For Component Developers
```typescript
import { useDecisionAudio } from '@/hooks/use-decision-audio';

const MyComponent = () => {
  const { playSoundForAction } = useDecisionAudio();

  const handleApprove = () => {
    playSoundForAction('approve');
    // Handle approval logic
  };

  return (
    <button onClick={handleApprove}>
      Approve
    </button>
  );
};
```

### For Direct Audio Playback
```typescript
import { playDecisionNotification } from '@/lib/audioManager';

// Play approve sound
playDecisionNotification('approve');

// Play reject sound
playDecisionNotification('reject');

// Play execute sound
playDecisionNotification('execute');
```

## Audio File Support (Optional)

For higher quality audio, you can add MP3 files:

1. Create `public/audio/` directory
2. Add audio files:
   - `decision-approve.mp3`
   - `decision-reject.mp3`
   - `decision-execute.mp3`

The system will automatically play files if they exist, with fallback to programmatic tones.

### Recommended Audio Specifications:
- **Format**: MP3 or WAV
- **Duration**: 200-500ms per sound
- **Sample Rate**: 44.1kHz or higher
- **Bit Rate**: 128kbps minimum

## Customization

### Change Tone Frequencies
Edit `src/lib/audioManager.ts` `frequencies` object:
```typescript
const frequencies: Record<DecisionAction, number[]> = {
  approve: [600, 800],  // Change these
  reject: [800, 400],   // Change these
  execute: [500, 700, 900], // Change these
};
```

### Adjust Volume
In `audioManager.ts` `playDecisionSound()`:
```typescript
audio.volume = 0.7; // Change from 0 (silent) to 1 (max)
```

### Disable Audio
Comment out audio calls in:
- `src/contexts/VRContext.tsx` - Decision handlers
- `src/components/dashboard/DecisionLayerPanel.tsx` - Button handlers
- `src/components/vr/IndustrialVRScene.tsx` - Button handlers

## Browser Compatibility

- ✅ Chrome/Edge 14+
- ✅ Firefox 25+
- ✅ Safari 14+
- ✅ Mobile browsers (with user interaction)

**Note**: Audio requires user interaction (button click) in most browsers due to autoplay policies.

## Accessibility

The audio system includes:
- Non-blocking error handling
- Graceful fallbacks if Web Audio API unavailable
- Console warnings for debugging
- Does not prevent button functionality if audio fails

For users with hearing impairments:
- Visual feedback is still provided (UI state changes)
- Consider adding haptic feedback for future enhancement

## Testing

### Manual Testing Steps:
1. Navigate to Dashboard with Decision Layer Panel
2. Click "Approve" button - hear rising tone
3. Click "Reject" button - hear falling tone
4. Click "Execute" button - hear ascending tones
5. Switch to VR view and test same actions
6. Test in multiple browsers and devices

## Performance Considerations

- Web Audio API: Uses hardware-efficient synthesis (negligible CPU)
- File-based audio: Minimal impact if files cached
- Multiple simultaneous sounds: Supported
- Memory usage: < 1MB per audio context

## Future Enhancements

Potential improvements:
- [ ] Custom audio file upload
- [ ] Volume control in settings
- [ ] Haptic feedback for mobile
- [ ] Spatialized audio in VR (3D sound positioning)
- [ ] Decision success/failure confirmation sounds
- [ ] Alarm sounds for critical decisions
- [ ] Music background for different system states
- [ ] Voice notifications in Arabic/English

## Troubleshooting

### No Sound When Clicking Buttons
1. Check browser volume and mute status
2. Allow audio permissions if prompted
3. Try different browser
4. Check browser console for errors

### Audio Plays But File Not Found
- This is expected - system falls back to programmatic tones
- To use audio files, add MP3s to `public/audio/`

### Distorted or Strange Sounds
- Check Web Audio API implementation in your browser
- Try disabling and re-enabling audio
- Report issue with browser version

## API Reference

### audioManager.ts

```typescript
// Play decision sound (file or fallback to tones)
playDecisionSound(action: 'approve' | 'reject' | 'execute'): Promise<void>

// Play programmatic notification sound
playDecisionNotification(action: 'approve' | 'reject' | 'execute'): void

// Play single beep
playBeepSound(frequency?: number, duration?: number, type?: 'sine' | 'square' | 'sawtooth'): void

// Get or create Web Audio context
createAudioContext(): AudioContext | null

// Play sounds in sequence
playSequentialSounds(actions: DecisionAction[], delayMs?: number): Promise<void>
```

### use-decision-audio.ts (Hook)

```typescript
// Returns all audio functions
const {
  playApproveSound: () => Promise<void>,
  playRejectSound: () => Promise<void>,
  playExecuteSound: () => Promise<void>,
  playNotification: (action) => void,
  playSoundForAction: (action) => Promise<void>
} = useDecisionAudio()
```

## License & Attribution

This audio system uses Web Audio API (browser built-in - no dependencies).

For custom audio files, ensure you have rights to use them in your project.
