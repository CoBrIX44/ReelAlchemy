import math
import struct
import wave
import os

SAMPLE_RATE = 44100
DURATION = 20.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

# Load reel_slice.wav if exists
slice_samples = []
slice_path = os.path.join("brag-output", "work", "reel_slice.wav")
if os.path.exists(slice_path):
    with wave.open(slice_path, 'rb') as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        n_frames = wf.getnframes()
        raw_data = wf.readframes(n_frames)
        if sampwidth == 2:
            # 16-bit
            total_ints = n_frames * n_channels
            fmt = f"<{total_ints}h"
            ints = struct.unpack(fmt, raw_data)
            if n_channels == 1:
                slice_samples = [x / 32768.0 for x in ints]
            else:
                slice_samples = [ints[i*2] / 32768.0 for i in range(n_frames)]

left_out = [0.0] * TOTAL_SAMPLES
right_out = [0.0] * TOTAL_SAMPLES

# BPM & grid
BPM = 120.0
SPB = 60.0 / BPM # 0.5s per beat, 0.25s per 16th note

def add_kick(start_time, gain=0.8):
    start_idx = int(start_time * SAMPLE_RATE)
    dur = 0.25
    samples = int(dur * SAMPLE_RATE)
    for i in range(samples):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES: break
        t = i / SAMPLE_RATE
        freq = 140.0 * math.exp(-t * 22.0) + 40.0
        env = math.exp(-t * 12.0)
        val = math.sin(2.0 * math.pi * freq * t) * env * gain
        left_out[idx] += val
        right_out[idx] += val

def add_snare(start_time, gain=0.5):
    start_idx = int(start_time * SAMPLE_RATE)
    dur = 0.22
    samples = int(dur * SAMPLE_RATE)
    import random
    rng = random.Random(int(start_time * 1000))
    for i in range(samples):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES: break
        t = i / SAMPLE_RATE
        noise = (rng.random() * 2.0 - 1.0) * math.exp(-t * 18.0)
        tone = math.sin(2.0 * math.pi * 180.0 * t) * math.exp(-t * 25.0) * 0.5
        val = (noise + tone) * gain
        left_out[idx] += val * 0.95
        right_out[idx] += val * 1.05

def add_hat(start_time, gain=0.2, panned=0.0):
    start_idx = int(start_time * SAMPLE_RATE)
    dur = 0.06
    samples = int(dur * SAMPLE_RATE)
    import random
    rng = random.Random(int(start_time * 1000))
    for i in range(samples):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES: break
        t = i / SAMPLE_RATE
        noise = (rng.random() * 2.0 - 1.0) * math.exp(-t * 60.0)
        val = noise * gain
        left_out[idx] += val * (1.0 - panned)
        right_out[idx] += val * (1.0 + panned)

def add_synth_note(start_time, dur, freq, gain=0.25, pan=0.0):
    start_idx = int(start_time * SAMPLE_RATE)
    samples = int(dur * SAMPLE_RATE)
    for i in range(samples):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES: break
        t = i / SAMPLE_RATE
        # Envelope: quick attack, steady decay
        env = min(t / 0.02, 1.0) * math.exp(-t * (2.5 / dur))
        # Sawtooth/sine hybrid with gentle warmth
        s1 = math.sin(2.0 * math.pi * freq * t)
        s2 = math.sin(2.0 * math.pi * freq * 2.0 * t) * 0.35
        s3 = math.sin(2.0 * math.pi * freq * 3.0 * t) * 0.15
        val = (s1 + s2 + s3) * env * gain
        left_out[idx] += val * (1.0 - pan * 0.3)
        right_out[idx] += val * (1.0 + pan * 0.3)

def add_sub_bass(start_time, dur, freq, gain=0.4):
    start_idx = int(start_time * SAMPLE_RATE)
    samples = int(dur * SAMPLE_RATE)
    for i in range(samples):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES: break
        t = i / SAMPLE_RATE
        env = min(t / 0.03, 1.0) * math.exp(-t * (1.0 / dur))
        val = math.sin(2.0 * math.pi * freq * t) * env * gain
        left_out[idx] += val
        right_out[idx] += val

def add_chime(start_time, freq=1200.0, gain=0.3):
    start_idx = int(start_time * SAMPLE_RATE)
    dur = 0.8
    samples = int(dur * SAMPLE_RATE)
    for i in range(samples):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES: break
        t = i / SAMPLE_RATE
        env = math.exp(-t * 5.0)
        val = math.sin(2.0 * math.pi * freq * t) * env * gain
        harm = math.sin(2.0 * math.pi * freq * 2.04 * t) * env * gain * 0.4
        left_out[idx] += val * 0.8 + harm * 0.2
        right_out[idx] += val * 0.2 + harm * 0.8

def add_whoosh(start_time, dur=0.6, gain=0.35, reverse=False):
    start_idx = int(start_time * SAMPLE_RATE)
    samples = int(dur * SAMPLE_RATE)
    import random
    rng = random.Random(int(start_time * 500))
    for i in range(samples):
        idx = start_idx + i
        if idx >= TOTAL_SAMPLES: break
        t = i / SAMPLE_RATE
        prog = t / dur
        if reverse:
            env = (prog ** 2) * gain
        else:
            env = ((1.0 - prog) ** 2) * gain
        noise = (rng.random() * 2.0 - 1.0) * env
        left_out[idx] += noise * 0.9
        right_out[idx] += noise * 1.1

# 1. Base drone & intro (0.0 to 3.5s)
for t in range(int(3.5 * SAMPLE_RATE)):
    sec = t / SAMPLE_RATE
    drone = (math.sin(2.0 * math.pi * 55.0 * sec) + math.sin(2.0 * math.pi * 110.0 * sec) * 0.3) * 0.15
    left_out[t] += drone
    right_out[t] += drone

# Scene 1 hook chords
add_synth_note(0.5, 2.5, 146.83, gain=0.25, pan=-0.2) # D3
add_synth_note(0.5, 2.5, 220.00, gain=0.20, pan=0.2)  # A3
add_synth_note(0.5, 2.5, 349.23, gain=0.15, pan=0.0)  # F4

# Transition at 3.3s
add_whoosh(2.8, dur=0.6, gain=0.25, reverse=True)
add_chime(3.4, freq=1760.0, gain=0.35)

# 2. Main beat kicks in at 3.5s and drives through 16.5s!
# BPM = 120, quarter note = 0.5s
# Chords progression: Dm -> F -> C -> G
progression = [
    (146.83, 174.61, 220.00), # Dm
    (174.61, 220.00, 261.63), # F
    (130.81, 164.81, 196.00), # C
    (196.00, 246.94, 293.66)  # G
]

beat_times = []
cur_time = 3.5
while cur_time < 16.5:
    beat_times.append(cur_time)
    cur_time += SPB

for i, b_time in enumerate(beat_times):
    # Kicks on 1 and 3 of every 4-beat bar
    bar_pos = i % 4
    if bar_pos == 0 or bar_pos == 2:
        add_kick(b_time, gain=0.7)
    # Snares on 2 and 4
    if bar_pos == 1 or bar_pos == 3:
        add_snare(b_time, gain=0.45)
    
    # 8th note hi-hats
    add_hat(b_time, gain=0.15, panned=-0.1)
    add_hat(b_time + 0.25, gain=0.12, panned=0.1)

    # Bassline note
    chord_idx = (i // 4) % len(progression)
    root_freq = progression[chord_idx][0] / 2.0
    if bar_pos == 0 or bar_pos == 2:
        add_sub_bass(b_time, 0.45, root_freq, gain=0.4)
    elif bar_pos == 1:
        add_sub_bass(b_time, 0.2, root_freq * 1.5, gain=0.25)

    # Arp plucks on 16th notes
    chord = progression[chord_idx]
    add_synth_note(b_time, 0.2, chord[bar_pos % 3] * 2.0, gain=0.18, pan=(bar_pos - 1.5) * 0.3)
    add_synth_note(b_time + 0.25, 0.2, chord[(bar_pos + 1) % 3] * 2.0, gain=0.14, pan=-(bar_pos - 1.5) * 0.3)

# Sound effects at scene boundaries
# Scene 3 transition (7.5s): Lyric & Ollama reveal
add_chime(7.5, freq=1318.5, gain=0.3)
add_whoosh(7.4, dur=0.4, gain=0.2)

# Scene 4 transition (12.0s): Instagram live update
add_whoosh(11.7, dur=0.5, gain=0.3, reverse=True)
add_chime(12.0, freq=2093.0, gain=0.4)
add_sub_bass(12.0, 0.8, 73.42, gain=0.5) # Sub impact on edit trigger!

# Scene 5 transition (16.5s): Outro triumph
add_whoosh(16.2, dur=0.6, gain=0.35, reverse=True)
add_chime(16.5, freq=1760.0, gain=0.45)
add_sub_bass(16.5, 2.5, 73.42, gain=0.6)
# Majestic closing chord
add_synth_note(16.5, 3.2, 293.66, gain=0.35, pan=-0.2) # D4
add_synth_note(16.5, 3.2, 440.00, gain=0.30, pan=0.2)  # A4
add_synth_note(16.5, 3.2, 587.33, gain=0.25, pan=0.0)  # D5
add_synth_note(16.5, 3.2, 739.99, gain=0.20, pan=0.1)  # F#5 (Majestic tierce de Picardie!)

# Blend in reel_slice.wav during Scene 2 (5.5s to 11.5s)
if slice_samples:
    slice_start = int(5.5 * SAMPLE_RATE)
    slice_dur_samples = min(len(slice_samples), int(6.0 * SAMPLE_RATE))
    for s_idx in range(slice_dur_samples):
        target_idx = slice_start + s_idx
        if target_idx >= TOTAL_SAMPLES: break
        # Smooth window fade in and fade out
        prog = s_idx / slice_dur_samples
        if prog < 0.2:
            win = prog / 0.2
        elif prog > 0.8:
            win = (1.0 - prog) / 0.2
        else:
            win = 1.0
        val = slice_samples[s_idx] * win * 0.22 # gentle level sitting nicely in mix
        left_out[target_idx] += val
        right_out[target_idx] += val

# Master bus: soft clipping and fade-out
max_val = 0.01
for i in range(TOTAL_SAMPLES):
    # Master fade out in last 0.8 seconds
    t = i / SAMPLE_RATE
    fade = 1.0
    if t > 19.2:
        fade = max(0.0, 1.0 - (t - 19.2) / 0.8)
    
    # Soft tanh saturation
    l = math.tanh(left_out[i] * 1.1) * fade
    r = math.tanh(right_out[i] * 1.1) * fade
    left_out[i] = l
    right_out[i] = r
    max_val = max(max_val, abs(l), abs(r))

# Normalize to -1.0 dB (~0.89)
norm_factor = 0.89 / max_val
int_data = bytearray()
for i in range(TOTAL_SAMPLES):
    l_int = max(-32767, min(32767, int(left_out[i] * norm_factor * 32767)))
    r_int = max(-32767, min(32767, int(right_out[i] * norm_factor * 32767)))
    int_data.extend(struct.pack("<hh", l_int, r_int))

out_path = os.path.join("brag-output", "work", "brag_audio.wav")
with wave.open(out_path, 'wb') as out_wf:
    out_wf.setnchannels(2)
    out_wf.setsampwidth(2)
    out_wf.setframerate(SAMPLE_RATE)
    out_wf.writeframes(int_data)

print(f"Rendered brag_audio.wav successfully: {out_path} ({DURATION}s, peak {max_val:.2f})")
