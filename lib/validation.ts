/**
 * Validation utilities for form inputs and data.
 */

/**
 * Validates an email address format.
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email.trim());
}

/**
 * Validates a phone number format.
 * Supports international formats with optional country codes.
 * @param phoneNumber - Phone number to validate
 * @returns true if phone format is valid, false otherwise
 */
export function isValidPhone(phoneNumber: string): boolean {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return false;
  }

  // Remove common formatting characters
  const cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, "");

  // Must contain only digits and be between 10-15 digits (international format)
  const phoneRegex = /^\d{10,15}$/;

  return phoneRegex.test(cleaned);
}

/**
 * Validates a URL format.
 * @param url - URL to validate
 * @returns true if URL format is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    // Must have http or https protocol
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates that a string is not empty (after trimming).
 * @param value - String to validate
 * @returns true if string is not empty, false otherwise
 */
export function isNotEmpty(value: string): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates that a string meets minimum length requirement.
 * @param value - String to validate
 * @param minLength - Minimum length required
 * @returns true if string meets minimum length, false otherwise
 */
export function meetsMinLength(value: string, minLength: number): boolean {
  return typeof value === "string" && value.trim().length >= minLength;
}

/**
 * Validates that a string does not exceed maximum length.
 * @param value - String to validate
 * @param maxLength - Maximum length allowed
 * @returns true if string does not exceed maximum length, false otherwise
 */
export function meetsMaxLength(value: string, maxLength: number): boolean {
  return typeof value === "string" && value.trim().length <= maxLength;
}

