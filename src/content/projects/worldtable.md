---
title: "Worldtable: Earth's Magnetic Field as a Drone"
description: "A drone instrument in the making: a generative aurora, nudged by real magnetometer and solar-wind data, heard as slowly shifting chords, seen as an all-sky dome and sent on to TouchDesigner."
date: 2026-11-06
category: Generative Audiovisual
image: /assets/projects/worldtable.webp
---

Worldtable is a plug-in (VST3, AU and Standalone) that plays Earth's magnetic field as the sun shakes it. It is a drone first: load it, press nothing, and it plays, slowly and without repeating, for as long as you let it. Under the sound runs a simple model of the aurora, pulled along by what magnetometers and solar-wind satellites actually measured, and that one model is heard, drawn as the sky above Alaska and sent on to TouchDesigner. It is a work in progress, built in the open on [GitHub](https://github.com/julianhilgemann/worldtable-vst).

## It started with the whole planet

The first plan wanted to hear everything at once: earthquakes from USGS, space weather from NOAA, the local weather from Open-Meteo, CO₂ from Mauna Loa, sunspot counts, ocean buoys and tides, the position of the ISS, solar flares from NASA. Each feed would become a slow modulation: a quake as a low rumble, the swell period as an LFO, the storm level as shimmer. The world's data, read into wavetables: hence the name.

## The proof of concept

The first working build took two of those feeds, both free and keyless. NOAA's buoys send a swell spectrum every half hour; the USGS observatories in Boulder and in College, Alaska, send the magnetic field every minute. Each feed became a wavetable of 64 frames, about 32 hours of ocean or field folded into one playable sound, with a synth voice, a filter, envelopes, two LFOs, a Euclidean sequencer, a delay and a shimmer reverb behind it. It fetched live, fell back to a bundled recording when offline, and played in Ableton Live.

![The proof of concept: a NOAA buoy's swell spectrum off San Francisco, read into a 64-frame wavetable and drawn as a stack of traces, with filter, envelopes, LFOs, sequencer and effects around it in navy and yellow](/assets/projects/worldtable-poc.webp)

**The proof of concept.** Pick a buoy or an observatory under "Listen to", and its last 32 hours become the wavetable. Swell and magnetic field shared the same panels.

It proved the pipeline. It also showed the problem: a wavetable synth fed by unrelated sources has no single story, and the sound and the picture say different things.

## One phenomenon

The direction was then reworked away from the laptop, in short sessions on the phone with Claude, written into a living project brief that the repository follows. The sessions cut everything but the magnetosphere: the geomagnetic field, the solar wind, the Kp index, the aurora. They made it a drone, with MIDI only to set the chord. And they put the picture first, with its colours fixed by physics: only the aurora's real emission lines, oxygen green at 557.7 nm, oxygen red at 630 nm and nitrogen violet at 427.8 nm, on night-sky black.

Two mockups explored what the main view should be.

![Mockup A, Curtain: the 64 wavetable frames drawn as the rays of an aurora curtain, green at the base fading to violet and red, with a magnetogram strip and five thin-line macro dials below](/assets/projects/worldtable-curtain.webp)

**Curtain.** Looking up: the wavetable's 64 frames are the rays of an aurora curtain, and the playing position is where it glows.

![Mockup B, Oval: a view down onto the North Pole with the auroral oval glowing in green, red and violet, magnetometer stations as points, and the wavetable drawn as a ring around it](/assets/projects/worldtable-oval.webp)

**Oval.** Looking down at the North Pole: the auroral oval glows around it, the observatories are points on the map, and the wavetable is a ring.

## A person on the ground, looking up

Neither won. The view became an all-sky dome, the way scientists photograph the aurora: zenith in the centre, horizon at the rim, seen from the observatory at College, Alaska, so the field its magnetometer measures really is the sky you see. Sun, moon and a few bright stars move with the time of day.

Behind the dome sits the Sky Model, a simplified aurora that is the single source of truth. Energy loads from the solar wind when its magnetic field turns south, and is released in substorms: a quiet sky, a slow brightening, a sudden onset with rays and folds, a patchy recovery. A curtain of 64 points carries the folds and the colours across the sky, and the disturbance measured at the observatory keeps the model honest. The data sets the mood; the model fills in plausible, seeded detail.

![The browser sketch of the Sky Model at 08:00 UT on 11 May 2024: the all-sky dome over College, Alaska, with a red-topped green aurora arc low in the south, readouts of phase, energy and solar wind on the right, and the magnetogram of the storm day below](/assets/projects/worldtable-dome.webp)

**The sketch.** The Sky Model in the browser, replaying the storm of 10 and 11 May 2024, the strongest in two decades. The strip below is the observatory's magnetogram: the measured field in green, the model's in violet.

## The sky, heard

Each point of the curtain plays resonators tuned to a chord: red as a low drone with long tails, green as the chord's body, violet as the shimmer above it. Its brightness sets how loud they ring, and its place on the dome sets its place in the stereo field. The sky also writes the harmony, slowly, over minutes: a quiet sky holds a home chord, a growing storm leans into suspensions, an onset shifts to a surprising chord a third away, the moment of awe, and the recovery comes home through a bittersweet borrowed chord. Boards of Canada is the lesson behind it: the emotion is in the harmony, and in a little pitch drift. After the resonators come drive, phaser, chorus, a tape delay and a large shimmer reverb, and five macros: Storm, Breath, Glow, Space and Drift.

## How it is built

The phone brief holds the ideas; the repository holds the spec that follows it, and every step starts as a task file with its scope and its tests. AI coding agents do the building, mostly Claude Code, on branches that merge one pull request at a time. The Sky Model and its sound were sketched in the browser first, in plain JavaScript, tuned by eye and ear, and only then ported to C++ and JUCE, where they have to match the sketch's reference recordings. A few rules hold throughout: nothing reaches the sound or the picture without gliding, so no change is ever a click; the same day and seed always give the same sound, whatever the buffer size; and it never needs the network, with three recorded days on board.

## Where it is going

Today the plug-in replays the May 2024 storm in a DAW, through the resonators, the chord progression and the full effects chain. Still to come: sparse high sparkles and the falling whistler tones of a real storm; slow modulation, and an autopilot that follows the live sky, replays a recorded day as a time-lapse or holds it still; live data from USGS and NOAA; the dome as the plug-in's own interface; and the sky sent over OSC to TouchDesigner, where the dome maps straight onto a fulldome projection. It is meant as the first of a family on the same frame, with ocean data next.

## The code

Worldtable is open source: [worldtable-vst on GitHub](https://github.com/julianhilgemann/worldtable-vst), with the spec, the task files and the browser sketch next to the plug-in. The data comes from the USGS Geomagnetism Program, NOAA's Space Weather Prediction Center, GFZ Potsdam (Kp) and NASA's OMNI service.
