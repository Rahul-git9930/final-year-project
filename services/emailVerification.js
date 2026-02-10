const axios = require('axios');

/**
 * Email Verification Service
 * Supports multiple providers: APILayer, NeverBounce, Kickbox, MailerCheck
 */

class EmailVerificationService {
  constructor() {
    this.provider = process.env.EMAIL_VERIFICATION_PROVIDER || 'apilayer';
    this.apiKey = process.env.EMAIL_VERIFICATION_API_KEY;
    this.enabled = process.env.EMAIL_VERIFICATION_ENABLED === 'true';
  }

  /**
   * Verify email using APILayer
   */
  async verifyWithAPILayer(email) {
    try {
      const response = await axios.get(`https://api.apilayer.com/email_verification/check`, {
        params: { email },
        headers: {
          'apikey': this.apiKey
        },
        timeout: 10000
      });

      const data = response.data;
      return {
        valid: data.format_valid && data.smtp_check && !data.disposable,
        score: data.score || 0,
        details: {
          format: data.format_valid,
          smtp: data.smtp_check,
          disposable: data.disposable,
          role: data.role,
          free: data.free,
          domain: data.domain,
          reason: data.reason || 'Email verified'
        }
      };
    } catch (error) {
      console.error('APILayer verification error:', error.message);
      throw new Error('Email verification failed');
    }
  }

  /**
   * Verify email using NeverBounce
   */
  async verifyWithNeverBounce(email) {
    try {
      const response = await axios.get('https://api.neverbounce.com/v4/single/check', {
        params: {
          key: this.apiKey,
          email: email
        },
        timeout: 10000
      });

      const result = response.data.result;
      return {
        valid: result === 'valid',
        score: result === 'valid' ? 100 : 0,
        details: {
          result: result,
          reason: response.data.execution_time ? 'Verified in real-time' : 'Cached result'
        }
      };
    } catch (error) {
      console.error('NeverBounce verification error:', error.message);
      throw new Error('Email verification failed');
    }
  }

  /**
   * Verify email using Kickbox
   */
  async verifyWithKickbox(email) {
    try {
      const response = await axios.get(`https://api.kickbox.com/v2/verify`, {
        params: {
          email: email,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      const data = response.data;
      return {
        valid: data.result === 'deliverable',
        score: data.sendex || 0,
        details: {
          result: data.result,
          reason: data.reason,
          role: data.role,
          free: data.free,
          disposable: data.disposable,
          accept_all: data.accept_all
        }
      };
    } catch (error) {
      console.error('Kickbox verification error:', error.message);
      throw new Error('Email verification failed');
    }
  }

  /**
   * Verify email using MailerCheck
   */
  async verifyWithMailerCheck(email) {
    try {
      const response = await axios.post('https://api.mailercheck.com/v1/email/verify', {
        email: email
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const data = response.data;
      return {
        valid: data.status === 'valid',
        score: data.quality_score || 0,
        details: {
          status: data.status,
          reason: data.reason,
          disposable: data.disposable,
          role: data.role_account,
          free: data.free_email
        }
      };
    } catch (error) {
      console.error('MailerCheck verification error:', error.message);
      throw new Error('Email verification failed');
    }
  }

  /**
   * Verify email using Emailable
   */
  async verifyWithEmailable(email) {
    try {
      const response = await axios.get('https://api.emailable.com/v1/verify', {
        params: {
          email: email,
          api_key: this.apiKey
        },
        timeout: 10000
      });

      const data = response.data;
      return {
        valid: data.state === 'deliverable',
        score: data.score || 0,
        details: {
          state: data.state,
          reason: data.reason,
          role: data.role,
          free: data.free,
          disposable: data.disposable
        }
      };
    } catch (error) {
      console.error('Emailable verification error:', error.message);
      throw new Error('Email verification failed');
    }
  }

  /**
   * Basic email validation (fallback when API is not configured)
   */
  async basicValidation(email) {
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const formatValid = emailRegex.test(email);

    if (!formatValid) {
      return {
        valid: false,
        score: 0,
        details: {
          format: false,
          reason: 'Invalid email format'
        }
      };
    }

    // Check for disposable email domains
    const disposableDomains = [
      'tempmail.com', 'throwaway.email', '10minutemail.com', 
      'guerrillamail.com', 'mailinator.com', 'trashmail.com'
    ];
    
    const domain = email.split('@')[1].toLowerCase();
    const isDisposable = disposableDomains.includes(domain);

    return {
      valid: !isDisposable,
      score: isDisposable ? 30 : 70,
      details: {
        format: true,
        disposable: isDisposable,
        reason: isDisposable ? 'Disposable email detected' : 'Basic validation passed'
      }
    };
  }

  /**
   * Main verification method
   */
  async verifyEmail(email) {
    // If verification is disabled, do basic validation only
    if (!this.enabled || !this.apiKey) {
      console.log('Email verification disabled, using basic validation');
      return await this.basicValidation(email);
    }

    try {
      switch (this.provider.toLowerCase()) {
        case 'apilayer':
          return await this.verifyWithAPILayer(email);
        case 'neverbounce':
          return await this.verifyWithNeverBounce(email);
        case 'kickbox':
          return await this.verifyWithKickbox(email);
        case 'mailercheck':
          return await this.verifyWithMailerCheck(email);
        case 'emailable':
          return await this.verifyWithEmailable(email);
        default:
          console.log('Unknown provider, falling back to basic validation');
          return await this.basicValidation(email);
      }
    } catch (error) {
      console.error('Email verification error, falling back to basic validation:', error.message);
      return await this.basicValidation(email);
    }
  }

  /**
   * Check if email is valid with minimum score threshold
   */
  async isValidEmail(email, minScore = 50) {
    const result = await this.verifyEmail(email);
    return result.valid && result.score >= minScore;
  }
}

module.exports = new EmailVerificationService();
