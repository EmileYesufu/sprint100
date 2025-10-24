/**
 * Centralized Error Handler Utility
 * Provides unified error handling for API calls, socket connections, and general app errors
 * Integrates with ErrorToast for consistent user feedback
 */

import { showErrorToast, showNetworkErrorToast, showAuthErrorToast, showApiErrorToast } from "@/components/ErrorToast";

// Error types for categorization
export enum ErrorType {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  API = "api",
  SOCKET = "socket",
  VALIDATION = "validation",
  UNKNOWN = "unknown",
}

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Error interface
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  title?: string;
  code?: string | number;
  details?: any;
  timestamp: Date;
  context?: string;
}

// Error handler class
class ErrorHandler {
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  /**
   * Handle and categorize errors
   */
  handleError(error: any, context?: string): AppError {
    const appError = this.categorizeError(error, context);
    this.logError(appError);
    this.displayError(appError);
    return appError;
  }

  /**
   * Categorize error based on type and content
   */
  private categorizeError(error: any, context?: string): AppError {
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let message = "An unexpected error occurred";
    let title = "Error";
    let code: string | number | undefined;

    // Network errors
    if (error.name === "NetworkError" || error.message?.includes("Network")) {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
      message = "Network connection failed. Please check your internet connection.";
      title = "Connection Error";
    } else if (error.code === "NETWORK_ERROR" || error.status === 0) {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
      message = "Unable to connect to server. Please try again.";
      title = "Connection Error";
    }
    // Authentication errors
    else if (error.status === 401 || error.message?.includes("Unauthorized")) {
      type = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
      message = "Authentication failed. Please log in again.";
      title = "Authentication Error";
      code = 401;
    } else if (error.status === 403 || error.message?.includes("Forbidden")) {
      type = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
      message = "Access denied. You don't have permission to perform this action.";
      title = "Access Denied";
      code = 403;
    }
    // API errors
    else if (error.status >= 400 && error.status < 500) {
      type = ErrorType.API;
      severity = ErrorSeverity.MEDIUM;
      message = error.message || "Request failed. Please try again.";
      title = "Request Error";
      code = error.status;
    } else if (error.status >= 500) {
      type = ErrorType.API;
      severity = ErrorSeverity.HIGH;
      message = "Server error occurred. Please try again later.";
      title = "Server Error";
      code = error.status;
    }
    // Socket errors
    else if (error.message?.includes("socket") || error.message?.includes("WebSocket")) {
      type = ErrorType.SOCKET;
      severity = ErrorSeverity.MEDIUM;
      message = "Connection to server lost. Attempting to reconnect...";
      title = "Connection Lost";
    }
    // Validation errors
    else if (error.message?.includes("validation") || error.message?.includes("invalid")) {
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
      message = error.message || "Invalid input provided.";
      title = "Validation Error";
    }
    // Generic error handling
    else {
      message = error.message || "An unexpected error occurred";
      title = "Error";
    }

    return {
      type,
      severity,
      message,
      title,
      code,
      details: error,
      timestamp: new Date(),
      context,
    };
  }

  /**
   * Log error to internal storage
   */
  private logError(error: AppError): void {
    this.errorLog.push(error);
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (__DEV__) {
      console.error(`[${error.type.toUpperCase()}] ${error.title}: ${error.message}`, error.details);
    }
  }

  /**
   * Display error to user using appropriate toast
   */
  private displayError(error: AppError): void {
    switch (error.type) {
      case ErrorType.NETWORK:
        showNetworkErrorToast(error.message);
        break;
      case ErrorType.AUTHENTICATION:
        showAuthErrorToast(error.message);
        break;
      case ErrorType.API:
        showApiErrorToast(error.message);
        break;
      case ErrorType.SOCKET:
        showErrorToast({
          title: error.title || "Connection Error",
          message: error.message,
          type: "warning",
          duration: 5000,
        });
        break;
      case ErrorType.VALIDATION:
        showErrorToast({
          title: error.title || "Validation Error",
          message: error.message,
          type: "warning",
          duration: 4000,
        });
        break;
      default:
        showErrorToast({
          title: error.title || "Error",
          message: error.message,
          type: "error",
          duration: 5000,
        });
    }
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(error: any, context?: string): AppError {
    const appError = this.categorizeError(error, context);
    this.logError(appError);
    
    // Don't show toast for low severity API errors
    if (appError.severity !== ErrorSeverity.LOW) {
      this.displayError(appError);
    }
    
    return appError;
  }

  /**
   * Handle socket errors specifically
   */
  handleSocketError(error: any, context?: string): AppError {
    const appError = this.categorizeError(error, context);
    appError.type = ErrorType.SOCKET;
    this.logError(appError);
    
    // Show socket errors as warnings, not errors
    showErrorToast({
      title: "Connection Issue",
      message: appError.message,
      type: "warning",
      duration: 4000,
    });
    
    return appError;
  }

  /**
   * Handle network errors specifically
   */
  handleNetworkError(error: any, context?: string): AppError {
    const appError = this.categorizeError(error, context);
    appError.type = ErrorType.NETWORK;
    appError.severity = ErrorSeverity.HIGH;
    this.logError(appError);
    this.displayError(appError);
    return appError;
  }

  /**
   * Handle authentication errors specifically
   */
  handleAuthError(error: any, context?: string): AppError {
    const appError = this.categorizeError(error, context);
    appError.type = ErrorType.AUTHENTICATION;
    appError.severity = ErrorSeverity.HIGH;
    this.logError(appError);
    this.displayError(appError);
    return appError;
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errorLog.filter(error => error.severity === severity);
  }

  /**
   * Get recent errors (last N errors)
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(-count);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error: any, context?: string) => errorHandler.handleError(error, context);
export const handleApiError = (error: any, context?: string) => errorHandler.handleApiError(error, context);
export const handleSocketError = (error: any, context?: string) => errorHandler.handleSocketError(error, context);
export const handleNetworkError = (error: any, context?: string) => errorHandler.handleNetworkError(error, context);
export const handleAuthError = (error: any, context?: string) => errorHandler.handleAuthError(error, context);

// Export utility functions
export const getErrorLog = () => errorHandler.getErrorLog();
export const clearErrorLog = () => errorHandler.clearErrorLog();
export const getErrorsByType = (type: ErrorType) => errorHandler.getErrorsByType(type);
export const getErrorsBySeverity = (severity: ErrorSeverity) => errorHandler.getErrorsBySeverity(severity);
export const getRecentErrors = (count?: number) => errorHandler.getRecentErrors(count);

// Export the singleton instance
export default errorHandler;
