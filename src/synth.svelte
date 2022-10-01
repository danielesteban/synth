<script>
  import Analyser from './audio/analyser.svelte';
  import Audio from './audio/context.js';
  import Channel from './audio/channel.js';
  import Voice from './audio/voice.js';

  export let simulation;

  const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const scales = [
    { name: 'Aeolian', intervals: [2, 1, 2, 2, 1, 2] },
    { name: 'Locrian', intervals: [1, 2, 2, 1, 2, 2] },
    { name: 'Ionian', intervals: [2, 2, 1, 2, 2, 2] },
    { name: 'Dorian', intervals: [2, 1, 2, 2, 2, 1] },
    { name: 'Phrygian', intervals: [1, 2, 2, 2, 1, 2] },
    { name: 'Lydian', intervals: [2, 2, 2, 1, 2, 2] },
    { name: 'Mixolydian', intervals: [2, 2, 1, 2, 2, 1] },
    { name: 'Melodic ascending minor', intervals: [2, 1, 2, 2, 2, 2] },
    { name: 'Phrygian raised sixth', intervals: [1, 2, 2, 2, 2, 2] },
    { name: 'Lydian raised fifth', intervals: [2, 2, 2, 2, 1, 2] },
    { name: 'Major minor', intervals: [2, 2, 1, 2, 1, 2] },
    { name: 'Altered', intervals: [1, 2, 1, 2, 2, 2] },
  ].map(({ name, intervals }) => ({
    name,
    intervals: intervals.reduce((intervals, interval, i) => {
      intervals.push(intervals[i] + interval);
      return intervals;
    }, [0]),
  }));

  const root = roots[Math.floor(Math.random() * roots.length)];
  const scale = scales[Math.floor(Math.random() * scales.length)];
  const waves = [
    { type: 'sawtooth', offset: 0 },
    { type: 'sine', offset: 12 },
  ];

  let voices;
  Audio().then(({ context, output }) => {
    const vibrato = context.createOscillator();
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(4, context.currentTime);
    vibrato.start(context.currentTime);
    vibrato.output = context.createGain();
    vibrato.output.gain.setValueAtTime(30, context.currentTime);
    vibrato.connect(vibrato.output);

    voices = Array.from({ length: simulation.count }, (v, i) => {
      const octave = 2 + Math.floor(i / 7) + (i > 7 ? 1 : 0);
      const note = (octave * 12) + roots.indexOf(root) + scale.intervals[i % 7];    
      const voice = new Voice({ context, note, waves });
      voice.oscillators.forEach((oscillator) => (
        vibrato.output.connect(oscillator.detune)
      ));

      const channel = new Channel({
        context,
        filters: [
          { type: 'bandpass', frequency: 100, Q: 0.5 },
          { type: 'distortion', amount: 128 },
        ],
        gain: 0.5,
      });  
      channel.output.connect(output.input);
      voice.output.connect(channel.input);

      const delay = context.createDelay();
      delay.delayTime.setValueAtTime(0.5, context.currentTime);
      delay.feedback = context.createGain();
      delay.feedback.gain.setValueAtTime(0.5, context.currentTime);
      delay.connect(delay.feedback);
      delay.feedback.connect(delay);
      delay.output = context.createGain();
      delay.output.gain.setValueAtTime(0.2, context.currentTime);
      delay.connect(delay.output);
      delay.output.connect(channel.input);
      voice.output.connect(delay);

      return voice;
    });
  });

  simulation.onHit = ({ note, duration }) => {
    if (voices) {
      voices[note].trigger(duration);
    }
  };
</script>

<div class="synth">
  <div class="box">
    <div>{root}</div>
    <div>Root</div>
  </div>
  <div class="box">
    <div><div>{scale.name}</div></div>
    <div>Scale</div>
  </div>
  <div class="analyser">
    <Analyser />
  </div>
</div>

<style>
  .synth {
    box-sizing: border-box;
    border: 1px solid hsl(0, 0%, 10%);
    padding: 0.5rem;
    height: 4rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  .box {
    padding: 0.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid hsl(0, 0%, 15%);
    width: 6rem;
  }

  .box > div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .box > div > div {
    max-width: 6rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .box > div:nth-child(2) {
    color: #999;
    text-transform: uppercase;
    font-size: 0.7em;
  }

  .analyser {
    margin-left: auto;
  }
</style>
