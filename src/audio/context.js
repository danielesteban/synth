import Channel from './channel.js';

let context = null;
let output = null;
const promises = [];

const onFirstInteraction = () => {
  window.removeEventListener('mousedown', onFirstInteraction);
  context = new window.AudioContext();
  output = new Channel({ context, filters: [{ type: 'analyser' }], gain: 0.5 });
  output.analyser = output.filters[0];
  output.output.connect(context.destination);
  document.addEventListener('visibilitychange', () => {
    output.muted = document.visibilityState !== 'visible';
  });
  promises.forEach((resolve) => resolve({ context, output }));
  promises.length = 0;
};
window.addEventListener('mousedown', onFirstInteraction);

export default () => {
  if (context) {
    return Promise.resolve({ context, output });
  }
  return new Promise((resolve) => promises.push(resolve));
};
