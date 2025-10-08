/**
 * Feature flags for Sprint100 app
 * 
 * These flags can be controlled via environment variables for testing
 * and debugging purposes. They are opt-in and do not affect the default
 * developer workflow.
 */

export const FLAGS = {
  /**
   * Enable verbose logging for debugging
   * Set REACT_NATIVE_APP_VERBOSE=true in .env to enable
   */
  ENABLE_VERBOSE_LOG: process.env.REACT_NATIVE_APP_VERBOSE === "true" || false,
  
  /**
   * Enable additional debug information in race screens
   * Useful for testers to report detailed information
   */
  ENABLE_DEBUG_INFO: process.env.REACT_NATIVE_APP_DEBUG === "true" || false,
  
  /**
   * Enable performance monitoring
   * Can help identify performance issues during testing
   */
  ENABLE_PERFORMANCE_MONITORING: process.env.REACT_NATIVE_APP_PERFORMANCE === "true" || false,
} as const;

/**
 * Helper function to check if verbose logging is enabled
 */
export const isVerboseLoggingEnabled = (): boolean => FLAGS.ENABLE_VERBOSE_LOG;

/**
 * Helper function to check if debug info should be shown
 */
export const isDebugInfoEnabled = (): boolean => FLAGS.ENABLE_DEBUG_INFO;

/**
 * Helper function to check if performance monitoring is enabled
 */
export const isPerformanceMonitoringEnabled = (): boolean => FLAGS.ENABLE_PERFORMANCE_MONITORING;
