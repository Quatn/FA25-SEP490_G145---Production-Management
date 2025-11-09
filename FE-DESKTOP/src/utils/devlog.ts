const wrap = () => {
  const ISSERVER = typeof window === "undefined";
  if (!ISSERVER && process.env.NODE_ENV === "development") {
    return console.log.bind(window.console);
  } else return function() { };
};

/**
 * Logs messages to the console only in the development environment.
 * In production environment, this function does nothing.
 * @param {...any} args - The values to log to the console.
 */
export const devlog = wrap();
