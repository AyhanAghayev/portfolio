'use strict';

const field = document.querySelector('#string-field');
const brush = field.getContext('2d');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const strandCount = 19;
const pointCount = 65;
const strands = Array.from({length:strandCount}, () =>
  Array.from({length:pointCount}, () => ({offset:0, velocity:0}))
);
const pointer = {x:0, y:0, active:false};
let width, height, ink, frame, lastTime, remainder = 0, phase = 0;
let running = !reduceMotion.matches;

function restingY(row, t) {
  const spread = (row / (strandCount - 1) - .5) * Math.min(height * .61, 480);
  const fan = .55 + .45 * Math.sin(t * Math.PI * .82);
  return height * (.72 - .34 * t) + spread * fan +
    Math.min(height * .055, 42) * Math.sin(t * 7.2 + row * .13 + phase);
}

function step() {
  phase += .0035;
  const spacing = width / (pointCount - 1);
  for (let row = 0; row < strandCount; row++) {
    const strand = strands[row];
    for (let column = 1; column < pointCount - 1; column++) {
      const point = strand[column];
      const above = strands[row - 1]?.[column].offset ?? point.offset;
      const below = strands[row + 1]?.[column].offset ?? point.offset;
      const along = strand[column - 1].offset + strand[column + 1].offset - 2 * point.offset;
      const across = above + below - 2 * point.offset;
      let pull = 0;
      if (pointer.active) {
        const dx = pointer.x - column * spacing;
        const dy = pointer.y - restingY(row, column / (pointCount - 1));
        const reach = Math.max(0, 1 - Math.hypot(dx, dy) / 150);
        pull = Math.max(-60, Math.min(60, dy)) * reach * reach * .15;
      }
      point.velocity = (point.velocity + .22 * along + .075 * across - .045 * point.offset + pull) * .83;
    }
  }
  for (const strand of strands) {
    for (const point of strand) point.offset += point.velocity;
  }
}

function draw() {
  brush.clearRect(0, 0, width, height);
  brush.strokeStyle = ink;
  strands.forEach((strand, row) => {
    brush.beginPath();
    strand.forEach((point, column) => {
      const t = column / (pointCount - 1);
      const x = width * t;
      const y = restingY(row, t) + point.offset;
      if (column === 0) brush.moveTo(x, y);
      else brush.lineTo(x, y);
    });
    brush.globalAlpha = row % 4 === 0 ? .88 : .53;
    brush.lineWidth = row % 4 === 0 ? 1.15 : .8;
    brush.stroke();
  });
  brush.globalAlpha = 1;
}

function tick(time) {
  frame = undefined;
  if (!running || document.hidden) return;
  remainder += lastTime === undefined ? 0 : Math.min(time - lastTime, 50);
  lastTime = time;
  while (remainder >= 1000 / 60) {
    step();
    remainder -= 1000 / 60;
  }
  draw();
  schedule();
}

function schedule() {
  if (frame === undefined && running && !document.hidden) frame = requestAnimationFrame(tick);
}

function resize() {
  width = field.clientWidth;
  height = field.clientHeight;
  const ratio = Math.min(devicePixelRatio, 2);
  field.width = Math.round(width * ratio);
  field.height = Math.round(height * ratio);
  brush.setTransform(ratio, 0, 0, ratio, 0, 0);
  ink = brush.createLinearGradient(0, 0, Math.max(width, 1), 0);
  ink.addColorStop(0, '#b887fa07');
  ink.addColorStop(.38, '#b887fa22');
  ink.addColorStop(.76, '#c69aff55');
  ink.addColorStop(1, '#b887fa25');
  draw();
}

function setRunning(value) {
  running = value;
  lastTime = undefined;
  remainder = 0;
  schedule();
}

if (brush) {
  reduceMotion.addEventListener('change', () => setRunning(!reduceMotion.matches));
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    Object.assign(pointer, {x:event.clientX, y:event.clientY, active:true});
  }, {passive:true});
  document.documentElement.addEventListener('pointerleave', () => { pointer.active = false; });
  window.addEventListener('blur', () => { pointer.active = false; });
  document.addEventListener('visibilitychange', () => {
    pointer.active = false;
    lastTime = undefined;
    schedule();
  });
  window.addEventListener('resize', resize);
  resize();
  setRunning(running);
}
