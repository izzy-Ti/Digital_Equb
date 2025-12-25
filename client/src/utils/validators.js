/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid
 */
export const isValidEthAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} Is valid
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate number is positive
 * @param {number} value - Number to validate
 * @returns {boolean} Is valid
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate form data
 * @param {object} data - Form data
 * @param {object} rules - Validation rules
 * @returns {object} Validation errors
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && !isRequired(value)) {
      errors[field] = `${field} is required`;
    } else if (rule.email && !isValidEmail(value)) {
      errors[field] = 'Invalid email address';
    } else if (rule.password) {
      const result = validatePassword(value);
      if (!result.isValid) {
        errors[field] = result.message;
      }
    } else if (rule.ethAddress && !isValidEthAddress(value)) {
      errors[field] = 'Invalid Ethereum address';
    } else if (rule.positive && !isPositiveNumber(value)) {
      errors[field] = `${field} must be a positive number`;
    } else if (rule.min && parseFloat(value) < rule.min) {
      errors[field] = `${field} must be at least ${rule.min}`;
    } else if (rule.max && parseFloat(value) > rule.max) {
      errors[field] = `${field} must be at most ${rule.max}`;
    }
  });
  
  return errors;
};
