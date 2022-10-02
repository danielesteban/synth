const _analyserBands = [2, 4, 8, 16, 32, 64, 128, 256, 512];
const _distortionCurves = new Map();

const createAnalyser = (context) => {
  const analyser = context.createAnalyser();
  analyser.fftSize = 4096;
  const buffer = new Uint8Array(analyser.frequencyBinCount);
  const bins = new Uint8Array(8);
  analyser.getBands = () => {
    analyser.getByteFrequencyData(buffer);
    let count = 0;
    let sum = 0;
    const len = _analyserBands.length - 1;
    for (let i = 0; i < len; i += 1) {
      count = 0;
      sum = 0;
      for (let j = _analyserBands[i]; j <= _analyserBands[i + 1]; j += 1) {
        count += 1;
        sum += buffer[j];
      }
      bins[i] = sum / count;
    }
    return bins;
  };
  return analyser;
}

const getDistortionCurve = (k) => {
  let curve = _distortionCurves.get(k);
  if (!curve) {
    const deg = Math.PI / 180;
    const samples = 44100;
    curve = new Float32Array(samples);
    for (let i = 0; i < samples; i += 1) {
      const j = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * j * 20 * deg) / (Math.PI + k * Math.abs(j));
    }
    _distortionCurves.set(k, curve);
  }
  return curve;
}

class Channel {
  constructor({
    context,
    filters,
    gain = 1,
    muted = false,
  }) {
    this.context = context;
    this.output = context.createGain();
    this.output.gain.setValueAtTime(muted ? 0 : gain, context.currentTime);
    if (filters) {
      this.filters = filters.map(({
        type,
        amount,
        detune,
        frequency,
        gain,
        Q,
      }) => {
        let filter;
        switch (type) {
          case 'analyser':
            filter = createAnalyser(context);
            break;
          case 'distortion':
            filter = context.createWaveShaper();
            filter.curve = getDistortionCurve(amount);
            filter.oversample = '4x';
            break;
          case 'panner':
            filter = context.createPanner();
            break;
          default:
            filter = context.createBiquadFilter();
            filter.type = type;
            if (detune !== undefined) {
              filter.detune.setValueAtTime(detune, context.currentTime);
            }
            if (frequency !== undefined) {
              filter.frequency.setValueAtTime(frequency, context.currentTime);
            }
            if (gain !== undefined) {
              filter.gain.setValueAtTime(gain, context.currentTime);
            }
            if (Q !== undefined) {
              filter.Q.setValueAtTime(Q, context.currentTime);
            }
        }
        return filter;
      });
      this.filters.forEach((filter, i) => {
        if (i > 0) {
          this.filters[i - 1].connect(filter);
        } else {
          this.input = filter;
        }
        if (i === this.filters.length - 1) {
          filter.connect(this.output);
        }
      });
    } else {
      this.input = this.output;
    }
    this._gain = gain;
    this._muted = muted;
  }

  get gain() {
    return this._gain;
  }

  set gain(value) {
    if (this._gain === value) {
      return;
    }
    this._gain = value;
    this.updateGain();
  }

  get muted() {
    return this._muted;
  }

  set muted(value) {
    if (this._muted === value) {
      return;
    }
    this._muted = value;
    this.updateGain();
  }

  updateGain() {
    const {
      context,
      gain,
      muted,
      output,
    } = this;
    const target = muted ? 0 : gain;
    output.gain.cancelScheduledValues(0);
    output.gain.linearRampToValueAtTime(
      target,
      context.currentTime + 0.02
    );
  }
}

export default Channel;
