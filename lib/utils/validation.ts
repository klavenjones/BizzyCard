/**
 * Validation utilities for email, phone, URL, etc.
 */

import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Validates email address format
 * @param email Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number in international format (E.164)
 * @param phone Phone number to validate
 * @returns true if valid E.164 format, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
}

/**
 * Formats phone number to E.164 international format
 * @param phone Phone number to format
 * @param defaultCountry Default country code (e.g., 'US')
 * @returns Formatted phone number in E.164 format or original if invalid
 */
export function formatPhoneToE164(phone: string, defaultCountry: string = 'US'): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, defaultCountry);
    return phoneNumber.format('E.164');
  } catch {
    return phone;
  }
}

/**
 * Validates URL format
 * @param url URL to validate
 * @returns true if valid URL, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates URL uses HTTPS
 * @param url URL to validate
 * @returns true if HTTPS URL, false otherwise
 */
export function isHttpsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

