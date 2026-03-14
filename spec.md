# Gerrod Engineer Product 2

## Current State
Large App.tsx (~2959 lines) with book-style intro, 30-band EQ, music player with file picker, 4 sound engines, blockchain panel, waveform visualizer. Dark navy/black color scheme.

## Requested Changes (Diff)

### Add
- 2 physical battery displays (each rated 800,000 mAh), combined total shown as 1,600,000
- Battery charger unit displaying 200,000 output wattage
- Animated battery charging sequence: batteries visually fill up from 0% to 100% before music can play
- Music playback locked until both batteries reach 100% charge
- Equalizer sliders wired to Web Audio API so moving any band up/down makes an audible effect on playing audio
- Dark blue (#0a1628 deep navy) and yellow (#FFD700 gold) as primary color scheme
- Super high resolution premium visual quality (sharp gradients, glowing edges, metallic textures via CSS)

### Modify
- Color scheme: replace current dark/teal with dark blue + yellow/gold throughout
- Battery section replaces or augments the existing engine power display
- File picker remains, but playback button is disabled with a visual lock until batteries are charged
- EQ sliders now control real Web Audio API biquad filter nodes
- Waveform visualizer stays but reacts to actual audio frequencies

### Remove
- Nothing removed -- all existing features kept

## Implementation Plan
1. Build BatteryUnit component: animated SVG battery with fill animation from 0-100%, labeled 800,000 mAh, glowing yellow when full
2. Build BatteryCharger component: shows 200,000W charger, charging progress bar, start charge button
3. Build charging state machine: when user hits "Charge", both batteries animate filling over ~5 seconds. Once 100%, music player unlocks
4. Wire Web Audio API: AudioContext -> source -> 10-band BiquadFilterNode chain -> AnalyserNode -> destination. EQ sliders set filter gain in real time
5. File picker loads audio file into AudioBufferSourceNode or MediaElementSource
6. Apply dark blue / gold color scheme across all panels
7. Keep all existing components: 4 sound engines, blockchain panel, 30-band EQ bands, waveform, book intro
