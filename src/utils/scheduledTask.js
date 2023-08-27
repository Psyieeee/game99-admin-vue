window.intervals = new Set();

export function startInterval(handler, time) {
  let newInterval = setInterval(handler, time);
  window.intervals.add(newInterval);
  return newInterval;
}

export function killInterval(id) {
  window.intervals.delete(id);
  return clearInterval(id);
}

export function killIntervals() {
  window.intervals.forEach( intervalId => clearInterval( intervalId ) );
  window.intervals.clear();
}
