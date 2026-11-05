---
title: "Datapipe: Audio-reactive Shorts"
description: "One command turns a song into a finished YouTube Short: the music is measured frame by frame, and the measurements drive a neon tunnel rendered headless in Blender."
date: 2026-10-24
category: 3D Animation
image: /assets/projects/datapipe.webp
---

Datapipe takes a piece of music and returns a finished 9:16 Short, ready for YouTube, with no editing in between. The sound is measured frame by frame (loudness, hits, frequency bands, sections), and each measurement drives one part of a neon tunnel in Blender: its lights, its colour, the speed of the flight. The picture can only move when the music does.

## Made with it

[![Flyby, a spaceship passing at high speed, turned into light](/assets/projects/flyby.webp)](https://www.youtube.com/shorts/TM1tNPyI_hM)

**[Flyby](https://www.youtube.com/shorts/TM1tNPyI_hM).** A spaceship passing at high speed, turned into light: every surge, flare and turn follows the sound.

[![Fly through the neon maze, a tunnel that moves only with the sound](/assets/projects/neon-maze.webp)](https://www.youtube.com/shorts/Xw28GKjG5VY)

**[Fly through the neon maze](https://www.youtube.com/shorts/Xw28GKjG5VY).** A neon maze tunnel that moves only with the sound: every pulse, turn and flash follows a 145 BPM synth loop.

## Six ways in, one way out

The input can be a finished master, a master with its stems, stems with MIDI for exact timing, stems of anything without a beat, or one complex track measured from every side. With nothing at all, Datapipe composes a loop of its own. Every way in writes the same two files, the mix and a list of controls per frame, and from there one back end does the rest: Blender bakes the controls into the scene and renders the frames headless, and the finished MP4 is checked for loudness, true peak, sync, a clean loop seam and flash frames before it counts as done.

The tunnel comes in several shapes (a hex prism, a star vortex, a truchet maze and more), and a tuner panel in Blender sets which sound drives what while the song plays. A second look flies a camera down a winding tunnel instead: through a watch movement whose gears tick to the kick, hyperspace streaks, or a kaleidoscope of mirrored crystals.

## The code

Datapipe is open source: [audiovisual-animations on GitHub](https://github.com/julianhilgemann/audiovisual-animations), with [a step-by-step guide](https://github.com/julianhilgemann/audiovisual-animations/blob/main/docs/how-to-use.md) for anyone who would rather not read code.
