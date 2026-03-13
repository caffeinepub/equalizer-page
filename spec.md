# Equalizer Page

## Current State
New project with no existing features.

## Requested Changes (Diff)

### Add
- Interactive equalizer UI with 10 frequency band sliders (Sub-Bass, Bass, Low-Mid, Mid, Upper-Mid, Presence, Brilliance, Air, and two more bands)
- Real-time SVG/Canvas EQ curve visualization that updates as sliders move
- Animated frequency bar visualizer (idle animation simulating audio activity)
- Preset selector: Flat, Rock, Pop, Classical, Jazz, Electronic
- Smooth vertical range sliders for each band with dB labels (-12 to +12 dB)
- Band labels and frequency values displayed under each slider
- Modern dark UI with glowing accent colors

### Modify
- None

### Remove
- None

## Implementation Plan
1. Create main EqualizerPage component with state for 10 band gains
2. Build EQCurve component using SVG to draw smooth bezier curve through band gain points
3. Build FrequencyBars component with CSS animation for idle visualizer bars
4. Build BandSlider component for each frequency band (vertical slider, dB readout, label)
5. Build PresetSelector component with buttons for each preset
6. Wire preset selection to update all band gains simultaneously
7. Animate EQ curve transitions with CSS/JS interpolation
