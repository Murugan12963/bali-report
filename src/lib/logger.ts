import { isDevelopment } from "./utils"; // Assuming a utility to check if NODE_ENV is 'development'

// Basic logger that outputs to console only in development
const logger = {
  log: (...args: any[]) => {
    if (isDevelopment()) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment()) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment()) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
};

export default logger;
