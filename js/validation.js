/**
 * FreshCart - Real-Time Form Validation Engine
 * Handles real-time input verification, visual error/success states,
 * email/phone/password checks, and prevents invalid form submissions.
 */

const FormValidator = {
  // Regex Patterns
  patterns: {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[6-9]\d{9}$/, // Standard 10-digit Indian Mobile Number
    pincode: /^[1-9][0-9]{5}$/, // Indian 6-digit PIN code
    name: /^[a-zA-Z\s'.]{3,50}$/,
  },

  /**
   * Display a clear error message below the field and apply red border.
   */
  showError(input, message) {
    if (!input) return;
    input.classList.add('input-invalid');
    input.classList.remove('input-valid');
    input.style.borderColor = '#e53935';

    // Locate or create error label
    let errorEl = input.parentElement.querySelector('.validation-error-msg');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'validation-error-msg';
      errorEl.style.color = '#e53935';
      errorEl.style.fontSize = '0.82rem';
      errorEl.style.marginTop = '4px';
      errorEl.style.display = 'flex';
      errorEl.style.alignItems = 'center';
      errorEl.style.gap = '5px';
      input.parentElement.appendChild(errorEl);
    }
    errorEl.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${message}`;
    errorEl.style.display = 'flex';
  },

  /**
   * Remove red border, remove error message, and show success state.
   */
  showSuccess(input) {
    if (!input) return;
    input.classList.remove('input-invalid');
    input.classList.add('input-valid');
    input.style.borderColor = '#4CAF50';

    const errorEl = input.parentElement.querySelector('.validation-error-msg');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.innerText = '';
    }
  },

  /**
   * Reset field state
   */
  resetState(input) {
    if (!input) return;
    input.classList.remove('input-invalid', 'input-valid');
    input.style.borderColor = '';
    const errorEl = input.parentElement.querySelector('.validation-error-msg');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.innerText = '';
    }
  },

  /**
   * Validate Email
   */
  validateEmail(input) {
    const val = input.value.trim();
    if (!val) {
      this.showError(input, 'Email address is required.');
      return false;
    }
    if (!this.patterns.email.test(val)) {
      this.showError(input, 'Please enter a valid email address (e.g. name@domain.com).');
      return false;
    }
    this.showSuccess(input);
    return true;
  },

  /**
   * Validate Phone
   */
  validatePhone(input) {
    const val = input.value.trim().replace(/[\s-]/g, '');
    if (!val) {
      this.showError(input, 'Phone number is required.');
      return false;
    }
    if (!this.patterns.phone.test(val)) {
      this.showError(input, 'Please enter a valid 10-digit mobile number starting with 6-9.');
      return false;
    }
    this.showSuccess(input);
    return true;
  },

  /**
   * Validate Full Name
   */
  validateName(input) {
    const val = input.value.trim();
    if (!val) {
      this.showError(input, 'Full name is required.');
      return false;
    }
    if (val.length < 3) {
      this.showError(input, 'Name must be at least 3 characters long.');
      return false;
    }
    this.showSuccess(input);
    return true;
  },

  /**
   * Validate Password
   */
  validatePassword(input, minLength = 6) {
    const val = input.value;
    if (!val) {
      this.showError(input, 'Password is required.');
      return false;
    }
    if (val.length < minLength) {
      this.showError(input, `Password must be at least ${minLength} characters.`);
      return false;
    }
    this.showSuccess(input);
    return true;
  },

  /**
   * Validate Password Confirmation
   */
  validatePasswordConfirm(passwordInput, confirmInput) {
    const pass = passwordInput.value;
    const confirm = confirmInput.value;
    if (!confirm) {
      this.showError(confirmInput, 'Please confirm your password.');
      return false;
    }
    if (pass !== confirm) {
      this.showError(confirmInput, 'Passwords do not match.');
      return false;
    }
    this.showSuccess(confirmInput);
    return true;
  },

  /**
   * Validate Required Generic Text / Select
   */
  validateRequired(input, fieldName = 'This field') {
    const val = input.value.trim();
    if (!val) {
      this.showError(input, `${fieldName} is required.`);
      return false;
    }
    this.showSuccess(input);
    return true;
  },

  /**
   * Attach real-time input listeners to a form
   */
  bindRealTime(formElement, fieldRules) {
    if (!formElement) return;

    for (const [selector, rule] of Object.entries(fieldRules)) {
      const field = formElement.querySelector(selector);
      if (!field) continue;

      const runCheck = () => {
        if (typeof rule === 'function') {
          return rule(field);
        } else if (rule === 'email') {
          return this.validateEmail(field);
        } else if (rule === 'phone') {
          return this.validatePhone(field);
        } else if (rule === 'name') {
          return this.validateName(field);
        } else if (rule === 'password') {
          return this.validatePassword(field);
        } else if (rule === 'required') {
          return this.validateRequired(field, field.getAttribute('placeholder') || 'Field');
        }
        return true;
      };

      field.addEventListener('input', runCheck);
      field.addEventListener('blur', runCheck);
    }
  }
};
