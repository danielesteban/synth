const equalTemperament = (note) => (
  (2 ** ((note - 69) / 12)) * 440
);

class Voice {
  constructor({
    context,
    gain = 0,
    note,
    waves,
  }) {
    this.context = context;
    this.output = context.createGain();
    this.output.gain.setValueAtTime(gain, context.currentTime);
    this.oscillators = waves.map(({ type, offset }) => {
      const gain = context.createGain();
      gain.gain.setValueAtTime((1 / waves.length) * 0.5, context.currentTime);
      gain.connect(this.output);
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(equalTemperament(note + offset), context.currentTime);
      oscillator.start(context.currentTime);
      oscillator.connect(gain);
      return oscillator;
    });
  }

  trigger(duration) {
    const { context, output } = this;
    output.gain.cancelScheduledValues(0);
    output.gain.linearRampToValueAtTime(
      1,
      context.deltaTime
    );
    output.gain.linearRampToValueAtTime(
      0,
      context.deltaTime + duration
    );
  }
}

export default Voice;
