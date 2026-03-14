# Gerrod | Engineer | Product 2

## Current State
EQ Studio with 30-band graphic equalizer, music player (4 tracks, play/pause/prev/next, volume, shuffle/repeat), real-time EQ curve, and preset system. Clean dark UI.

## Requested Changes (Diff)

### Add
- Book-style opening animation: app pages open like a book revealing the interface
- Hero/branding intro panel: "Gerrod | Engineer | Product 2 | 80,000 Watts | 4 Sound Engines" with blockchain badge
- Smart Chip SRS-22 section: 3 independent volume sliders (Volume 1/2/3), each with dB readout, booster up to 1500W
- 4 Sound Engines panel: each engine has on/off toggle, individual amp slider (0-120W), gain level, connected indicator light; turning one off dims connected engines
- Stabilizer panel: 80,000W zero-center epicenter gauge (big dial/slider), boost/cut meter, harmonic % readout
- Compressor/Monitor panel: signal correction meter (0-100% harmonic), input/output level bars, noise floor indicator
- Room Magnet panel: room size slider (0-50ft), virtual sound radius that grows visually as size increases, centered position indicator
- Blockchain chain panel: animated chain link indicator showing all modules verified/connected, live block hash display (simulated)
- DJ Studio panel: 8 effect switches (reverb, delay, chorus, flare, gate, compress, saturate, spread), each toggle-able and glows when active
- Epicenter gauge: large center dial showing 0-center position for all signal levels, runs through all sections
- All controls functional: every slider, knob, toggle, switch changes visible state and affects related displays

### Modify
- Header: rebrand from "EQ Studio" to "Gerrod | Engineer | Product 2"
- EQ section: keep 30-band but wire gains to stabilizer output (stabilizer gain multiplies EQ output level display)
- Overall layout: sections arranged in a premium engineering console style, top to bottom flow

### Remove
- Nothing removed

## Implementation Plan
1. Add book-open intro animation (CSS perspective transform, two pages swing open)
2. Rebrand header with Gerrod branding + blockchain badge + 80k watts display
3. Add Smart Chip SRS-22 component with 3 volume sliders, booster indicator
4. Add 4 Sound Engines component: each engine card with power toggle, amp fader, status LED
5. Add Stabilizer/Epicenter component: large zero-center dial with harmonic % readout
6. Add Monitor/Compressor component: dual-bar input/output VU meters, harmonic correction display
7. Add Room Magnet component: room size slider with expanding circle visualization
8. Add Blockchain panel: animated chain links, simulated hash, all-connected status
9. Add DJ Studio switcher: 8 toggle buttons with glow-on-active effect
10. Wire all controls: engines affect master level, stabilizer affects curve display, room size affects volume display, DJ switches affect curve shape
11. Keep existing 30-band EQ + curve + presets + music player
