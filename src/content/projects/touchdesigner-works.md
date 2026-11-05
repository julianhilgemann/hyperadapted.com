---
title: "TouchDesigner Works"
description: "Real-time audiovisual pieces built in TouchDesigner: a Bundesbank series played as a synth, sound drawn as point clouds and ferrofluid, particle fields that follow the music, and a live set driven by an Octatrack."
date: 2026-11-05
category: Generative Audiovisual
image: /assets/projects/touchdesigner-works.webp
---

Where [Datapipe](/projects/datapipe) renders a finished video, these pieces run live. Each one is a TouchDesigner network that listens to something (a track, a microphone, a camera, a data series) and draws the picture while it plays. All of them are standalone projects in [av-td-works on GitHub](https://github.com/julianhilgemann/av-td-works), most with a moving preview in their README.

## Data played as sound

- **[Time-series wavetable](https://github.com/julianhilgemann/av-td-works/tree/main/time-series-wavetable).** The Bundesbank housing-loan series turned into a playable wavetable synth, with a live dashboard.
- **[Touch the sonogram](https://github.com/julianhilgemann/av-td-works/tree/main/touch-the-sonogram).** An installation: the same wavetable drone, shaped by a camera and a microphone and drawn as a point-cloud sonogram.
- **[Kaleidoscopic sonogram video](https://github.com/julianhilgemann/av-td-works/tree/main/caleidoscopic-sonogram-video).** A square music video: the sonogram point cloud driven by an audio track and a modulator video.

## Sound made visible

- **[Ferroscope](https://github.com/julianhilgemann/av-td-works/tree/main/ferroscope).** Sound as ferrofluid: a spike lattice raised by a kaleidoscope-folded sonogram, leaning toward the viewer on camera, seen through a CRT tube.
- **[Async spectral](https://github.com/julianhilgemann/av-td-works/tree/main/async-spectral).** A vertical Short cut out of sync with itself: a sweeping line holds the picture as streaks, and the streaks play as an additive synth through echo and reverb.
- **[Iridescent viz](https://github.com/julianhilgemann/av-td-works/tree/main/iridiscent-viz).** A music visualizer: a turbulent particle stream lit by the track, the kick to bloom, the rhythm to glow, the highs to colour and rotation.
- **[Audio-reactive point cloud](https://github.com/julianhilgemann/av-td-works/tree/main/audioreactive-pointcloud).** A point cloud that moves with the music.

## Generative fields

- **[Color ribbon butterfly](https://github.com/julianhilgemann/av-td-works/tree/main/color-ribbon-butterfly).** 250,000 hexagons placed by animated 4D noise and smeared into coloured ribbons by feedback, RGBA delay and a radial blur.
- **[Infinite hypercube](https://github.com/julianhilgemann/av-td-works/tree/main/infinite-hypercube).** 262,144 points carried by a self-displacing noise field inside a cube whose faces wrap around.
- **[Noise attractor landscape](https://github.com/julianhilgemann/av-td-works/tree/main/noise-attractor-landscape).** A GPU particle swarm in turbulence, wind and force fields.
- **[Liquid paint](https://github.com/julianhilgemann/av-td-works/tree/main/liquid-paint).** Mouse painting into a fluid shader: strokes smear into dripping, marbled trails.

## Live with the Octatrack

- **[Octatrack AV setup](https://github.com/julianhilgemann/av-td-works/tree/main/octatrack-av-setup).** The live AV set: an Elektron Octatrack drives a noise-field particle generator, sent out at 1920×1080 over Syphon or Spout.
- **[Octatrack audio modulation](https://github.com/julianhilgemann/av-td-works/tree/main/octatrack-audio-modulation).** A sketch: audio and MIDI read in and shaped, with a million instanced points moved by LFOs.
- **[Octatrack, Heat and MIDI](https://github.com/julianhilgemann/av-td-works/tree/main/octatrack-heat-midi-audio-mapping).** The Octatrack's audio through an Analog Heat MKII, split into three bands, plus the note triggers of four MIDI tracks. Sound only, no visuals.

## Shared modules

The projects are built from the same parts, kept in [one folder](https://github.com/julianhilgemann/av-td-works/tree/main/00-custom-modules): a source deck for cameras, files and YouTube, audio and MIDI analysers, a modulator, an output deck that frames the picture for a phone or a TV and records movies and GIFs, a CRT filter and a blob tracker.
