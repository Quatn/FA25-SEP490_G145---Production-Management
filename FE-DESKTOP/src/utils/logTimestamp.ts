// Global timestamp function kill switch. We don't always need to see timestamps after all
const USE_TIMESTAMP = false

const getTimeStamp = (dateObj: Date) => {
  const hour = dateObj.getHours().toString().padStart(2, '0');
  const minute = dateObj.getMinutes().toString().padStart(2, '0');
  const second = dateObj.getSeconds().toString().padStart(2, '0');
  const millisecond = dateObj.getMilliseconds().toString().padStart(3, '0');

  return `${hour}:${minute}:${second}.${millisecond}`;
}

function _logTimestamp(label = '', anchor?: Date, replaceAnchor?: boolean) {
  const now = new Date();
  let diffStr = '';
  if (anchor) {
    const diffMs = now.getTime() - anchor.getTime();
    const diffSec = (diffMs / 1000).toFixed(3);
    diffStr = `${replaceAnchor ? " -" : ":"} ${(diffMs >= 0) ? "+" : ""}${diffSec}s`;
  }
  console.log(`${getTimeStamp(now)}${diffStr} - ${label ? label + ' ' : ''}`);
  if (replaceAnchor) anchor?.setTime(now.getTime())
}

const wrap = () => {
  if (USE_TIMESTAMP) {
    return _logTimestamp;
  } else return function() { };
};

/**
 * Log a time stime with an optional label.
 * In production environment, this function does nothing.
 * @param {...any} args - The values to log to the console.
 */
export const logTimestamp = wrap();
