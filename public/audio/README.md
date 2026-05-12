# Audio Files Directory

This directory should contain audio files for decision notifications.

## Expected Files

Place the following audio files in this directory:
- `decision-approve.mp3` - Sound for approval decisions
- `decision-reject.mp3` - Sound for rejection decisions
- `decision-execute.mp3` - Sound for execution decisions

## Audio File Specifications

### Recommended Settings for All Files:
- **Format**: MP3 or WAV
- **Duration**: 200-500ms
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Rate**: 128kbps (MP3) or higher
- **Channels**: Mono or Stereo
- **Loudness**: -10dB to -3dB (for consistent playback)

### Suggestions for Each Sound

#### decision-approve.mp3
- **Tone**: Positive, ascending, happy
- **Frequency Range**: 600Hz to 900Hz
- **Examples**:
  - Rising bell chime
  - Success/positive beep
  - Ascending musical tone
  - "Ding" sound

#### decision-reject.mp3
- **Tone**: Negative, descending, warning
- **Frequency Range**: 400Hz to 800Hz
- **Examples**:
  - Descending tone
  - "Error" buzz
  - Negative notification sound
  - Descending whistle

#### decision-execute.mp3
- **Tone**: Action, neutral, start
- **Frequency Range**: 500Hz to 1000Hz
- **Examples**:
  - Power-up sound
  - Processing start beep
  - Multiple ascending tones
  - Activation sound

## How to Add Audio Files

### Option 1: Using Royalty-Free Libraries
- Freesound.org - Free sound effects
- Zapsplat - No copyright sound effects
- Mixkit - Free audio clips

### Option 2: Generate Audio Programmatically
If you don't add files, the system automatically generates audio using the Web Audio API with synthesized tones.

### Option 3: Create Custom Audio
Using tools like:
- Audacity (free)
- Adobe Audition
- GarageBand (Mac)
- BFXR (8-bit sound generator)

## File Naming Convention

The system looks for files with these exact names:
- `decision-approve.mp3`
- `decision-reject.mp3`
- `decision-execute.mp3`

If files are not found, the system automatically falls back to synthesized tones.

## Testing Your Audio

1. Add MP3 file to this directory
2. Open browser DevTools (F12)
3. Check Network tab when decision is made
4. Should see audio file load

If file doesn't load:
- Check file path: `public/audio/decision-approve.mp3`
- Check file format: Should be valid MP3
- Check browser console for errors

## Browser Audio Support

Audio format compatibility:
- MP3: ✅ All modern browsers
- WAV: ✅ All modern browsers
- OGG: ✅ Firefox, Chrome
- FLAC: ❌ Not recommended

## Volume Management

The system sets volume to 70% (`audio.volume = 0.7`). To adjust:
1. Edit `src/lib/audioManager.ts`
2. Find `audio.volume = 0.7;`
3. Change to desired level (0 = silent, 1 = max)

## Tips for Good Audio

### For Approval Sound
- Use bright, positive tones
- Keep it melodic and pleasant
- 300-500ms duration
- Peak frequency around 800Hz

### For Rejection Sound
- Use darker, lower tones
- Make it distinct from approval
- 200-400ms duration
- Peak frequency around 600Hz

### For Execute Sound
- Use neutral or energetic tones
- Should feel like "action starting"
- 300-600ms duration
- Multi-note sequence (ascending preferred)

## Fallback Behavior

If audio files are missing, the system automatically:
1. Logs a warning to console
2. Falls back to Web Audio API synthesis
3. Creates tone sequences:
   - Approve: 600Hz → 800Hz
   - Reject: 800Hz → 400Hz
   - Execute: 500Hz → 700Hz → 900Hz

This ensures audio always works, either with files or synthesis.

## Legal/Copyright

Ensure any audio files you use have proper licenses:
- ✅ Royalty-free
- ✅ Purchased or commissioned
- ✅ Creative Commons (with attribution)
- ✅ Created by you
- ❌ Copyrighted without permission

## Performance

Adding audio files has minimal impact:
- Files are cached by browser
- Only loaded on first decision action
- ~10-50KB per file (minimal)
- No performance degradation expected

## Next Steps

1. Optional: Add custom audio files to this directory
2. Test decision actions in Dashboard and VR
3. Adjust volume if needed in `audioManager.ts`
4. Customize tone frequencies if desired

For more details, see `src/AUDIO_SYSTEM_GUIDE.md`
