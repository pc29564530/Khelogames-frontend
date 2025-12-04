/**
 * Tests for validation utility functions
 */

import {
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  validateNumber,
  validateDate,
  validateUrl,
  validateScore,
  validateWickets,
  validateOvers,
  validateMatchDate,
  validateDateRange,
  validateTeamName,
  validatePlayerName,
  validateTournamentName,
  validateDescription,
  validateFile,
  validateImage,
  validateFields,
  sanitizeText,
  sanitizeHtml,
  sanitizeNumber,
  sanitizeInteger,
  sanitizeEmail,
  sanitizeUsername,
  sanitizePhone,
  sanitizeUrl,
  sanitizeFileName,
  sanitizeSearchQuery,
  sanitizeObject,
  validateAndSanitizeForm,
} from '../../utils/validation';

describe('Email Validation', () => {
  test('validates correct email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('rejects empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('rejects invalid email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('Phone Validation', () => {
  test('validates correct phone number', () => {
    const result = validatePhone('1234567890');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('validates phone with formatting', () => {
    const result = validatePhone('+1 (234) 567-8900');
    expect(result.isValid).toBe(true);
  });

  test('rejects too short phone', () => {
    const result = validatePhone('123');
    expect(result.isValid).toBe(false);
  });

  test('rejects too long phone', () => {
    const result = validatePhone('12345678901234567890');
    expect(result.isValid).toBe(false);
  });
});

describe('Username Validation', () => {
  test('validates correct username', () => {
    const result = validateUsername('user_name-123');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('rejects too short username', () => {
    const result = validateUsername('ab');
    expect(result.isValid).toBe(false);
  });

  test('rejects username with invalid characters', () => {
    const result = validateUsername('user@name');
    expect(result.isValid).toBe(false);
  });

  test('rejects too long username', () => {
    const result = validateUsername('a'.repeat(31));
    expect(result.isValid).toBe(false);
  });
});

describe('Password Validation', () => {
  test('validates strong password', () => {
    const result = validatePassword('Password123');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('rejects password without uppercase', () => {
    const result = validatePassword('password123');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('uppercase');
  });

  test('rejects password without lowercase', () => {
    const result = validatePassword('PASSWORD123');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('lowercase');
  });

  test('rejects password without number', () => {
    const result = validatePassword('Password');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('number');
  });

  test('rejects too short password', () => {
    const result = validatePassword('Pass1');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('8 characters');
  });

  test('validates password with custom options', () => {
    const result = validatePassword('pass', {
      minLength: 4,
      requireUppercase: false,
      requireNumber: false,
    });
    expect(result.isValid).toBe(true);
  });
});

describe('Score Validation', () => {
  test('validates valid cricket score', () => {
    const result = validateScore(250, { sport: 'cricket' });
    expect(result.isValid).toBe(true);
  });

  test('validates valid football score', () => {
    const result = validateScore(3, { sport: 'football' });
    expect(result.isValid).toBe(true);
  });

  test('rejects negative score', () => {
    const result = validateScore(-5);
    expect(result.isValid).toBe(false);
  });

  test('rejects unusually high cricket score', () => {
    const result = validateScore(1500, { sport: 'cricket' });
    expect(result.isValid).toBe(false);
  });

  test('rejects unusually high football score', () => {
    const result = validateScore(100, { sport: 'football' });
    expect(result.isValid).toBe(false);
  });
});

describe('Wickets Validation', () => {
  test('validates valid wickets', () => {
    const result = validateWickets(5);
    expect(result.isValid).toBe(true);
  });

  test('rejects wickets over 10', () => {
    const result = validateWickets(11);
    expect(result.isValid).toBe(false);
  });

  test('rejects negative wickets', () => {
    const result = validateWickets(-1);
    expect(result.isValid).toBe(false);
  });
});

describe('Overs Validation', () => {
  test('validates valid overs', () => {
    const result = validateOvers(19.4);
    expect(result.isValid).toBe(true);
  });

  test('rejects invalid over format', () => {
    const result = validateOvers(19.7);
    expect(result.isValid).toBe(false);
  });

  test('rejects overs exceeding max', () => {
    const result = validateOvers(60, { maxOvers: 50 });
    expect(result.isValid).toBe(false);
  });
});

describe('Match Date Validation', () => {
  test('validates future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const result = validateMatchDate(futureDate);
    expect(result.isValid).toBe(true);
  });

  test('validates past date when allowed', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const result = validateMatchDate(pastDate, { allowPast: true });
    expect(result.isValid).toBe(true);
  });

  test('rejects past date when not allowed', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const result = validateMatchDate(pastDate, { allowPast: false });
    expect(result.isValid).toBe(false);
  });
});

describe('Date Range Validation', () => {
  test('validates valid date range', () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    const result = validateDateRange(start, end);
    expect(result.isValid).toBe(true);
  });

  test('rejects end date before start date', () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() - 30);
    const result = validateDateRange(start, end);
    expect(result.isValid).toBe(false);
  });

  test('rejects range exceeding 1 year', () => {
    const start = new Date();
    const end = new Date();
    end.setFullYear(end.getFullYear() + 2);
    const result = validateDateRange(start, end);
    expect(result.isValid).toBe(false);
  });
});

describe('Text Sanitization', () => {
  test('sanitizes HTML characters', () => {
    const result = sanitizeText('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
  });

  test('sanitizes quotes', () => {
    const result = sanitizeText('Hello "world"');
    expect(result).toContain('&quot;');
  });

  test('trims whitespace', () => {
    const result = sanitizeText('  hello  ');
    expect(result).toBe('hello');
  });
});

describe('HTML Sanitization', () => {
  test('removes script tags', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Hello</p>');
  });

  test('removes event handlers', () => {
    const result = sanitizeHtml('<div onclick="alert()">Click</div>');
    expect(result).not.toContain('onclick');
  });

  test('removes javascript protocol', () => {
    const result = sanitizeHtml('<a href="javascript:alert()">Link</a>');
    expect(result).not.toContain('javascript:');
  });
});

describe('Number Sanitization', () => {
  test('sanitizes valid number', () => {
    const result = sanitizeNumber('123.45');
    expect(result).toBe(123.45);
  });

  test('removes non-numeric characters', () => {
    const result = sanitizeNumber('$123.45');
    expect(result).toBe(123.45);
  });

  test('returns default for invalid input', () => {
    const result = sanitizeNumber('abc', { defaultValue: 0 });
    expect(result).toBe(0);
  });

  test('removes negative when not allowed', () => {
    const result = sanitizeNumber('-123', { allowNegative: false });
    expect(result).toBe(123);
  });
});

describe('Integer Sanitization', () => {
  test('sanitizes to integer', () => {
    const result = sanitizeInteger('123.45');
    expect(result).toBe(123);
  });

  test('removes decimal point', () => {
    const result = sanitizeInteger('123.99');
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('Email Sanitization', () => {
  test('converts to lowercase', () => {
    const result = sanitizeEmail('Test@Example.COM');
    expect(result).toBe('test@example.com');
  });

  test('removes invalid characters', () => {
    const result = sanitizeEmail('test<>@example.com');
    expect(result).toBe('test@example.com');
  });
});

describe('Username Sanitization', () => {
  test('removes invalid characters', () => {
    const result = sanitizeUsername('user@name!');
    expect(result).toBe('username');
  });

  test('preserves valid characters', () => {
    const result = sanitizeUsername('user_name-123');
    expect(result).toBe('user_name-123');
  });
});

describe('Phone Sanitization', () => {
  test('removes formatting', () => {
    const result = sanitizePhone('+1 (234) 567-8900');
    expect(result).toBe('+12345678900');
  });

  test('preserves leading plus', () => {
    const result = sanitizePhone('+1234567890');
    expect(result).toMatch(/^\+/);
  });
});

describe('URL Sanitization', () => {
  test('adds https protocol', () => {
    const result = sanitizeUrl('example.com');
    expect(result).toBe('https://example.com');
  });

  test('removes javascript protocol', () => {
    const result = sanitizeUrl('javascript:alert()');
    expect(result).toBe('');
  });

  test('preserves valid https URL', () => {
    const result = sanitizeUrl('https://example.com');
    expect(result).toBe('https://example.com');
  });
});

describe('File Name Sanitization', () => {
  test('removes path separators', () => {
    const result = sanitizeFileName('../../../etc/passwd');
    expect(result).not.toContain('/');
    expect(result).not.toContain('\\');
  });

  test('removes dangerous characters', () => {
    const result = sanitizeFileName('file<>:"|?.txt');
    expect(result).toBe('file.txt');
  });

  test('removes leading dots', () => {
    const result = sanitizeFileName('...hidden.txt');
    expect(result).toBe('hidden.txt');
  });
});

describe('Search Query Sanitization', () => {
  test('removes special characters', () => {
    const result = sanitizeSearchQuery('search<script>term');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  test('limits length', () => {
    const longQuery = 'a'.repeat(300);
    const result = sanitizeSearchQuery(longQuery);
    expect(result.length).toBeLessThanOrEqual(200);
  });
});

describe('Object Sanitization', () => {
  test('sanitizes object with custom sanitizers', () => {
    const obj = {
      email: 'Test@Example.COM',
      username: 'user@name',
      score: '123.45',
    };

    const sanitizers = {
      email: sanitizeEmail,
      username: sanitizeUsername,
      score: sanitizeInteger,
    };

    const result = sanitizeObject(obj, sanitizers);
    expect(result.email).toBe('test@example.com');
    expect(result.username).toBe('username');
    expect(result.score).toBe(123);
  });

  test('applies default text sanitization to strings', () => {
    const obj = {
      name: '<script>alert()</script>',
      age: 25,
    };

    const result = sanitizeObject(obj, {});
    expect(result.name).not.toContain('<script>');
    expect(result.age).toBe(25);
  });
});

describe('Validate and Sanitize Form', () => {
  test('validates and sanitizes form data', () => {
    const formData = {
      email: 'Test@Example.COM',
      username: 'validuser123',
    };

    const validators = {
      email: validateEmail,
      username: validateUsername,
    };

    const sanitizers = {
      email: sanitizeEmail,
      username: sanitizeUsername,
    };

    const result = validateAndSanitizeForm(formData, validators, sanitizers);
    expect(result.sanitizedData.email).toBe('test@example.com');
    expect(result.sanitizedData.username).toBe('validuser123');
    expect(result.isValid).toBe(true);
  });
});

describe('Validate Fields', () => {
  test('validates multiple fields', () => {
    const fields = {
      email: 'test@example.com',
      username: 'validuser',
    };

    const validators = {
      email: validateEmail,
      username: validateUsername,
    };

    const result = validateFields(fields, validators);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  test('returns errors for invalid fields', () => {
    const fields = {
      email: 'invalid',
      username: 'ab',
    };

    const validators = {
      email: validateEmail,
      username: validateUsername,
    };

    const result = validateFields(fields, validators);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.username).toBeTruthy();
  });
});

describe('Confirm Password Validation', () => {
  test('validates matching passwords', () => {
    const result = validateConfirmPassword('Password123', 'Password123');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('rejects non-matching passwords', () => {
    const result = validateConfirmPassword('Password123', 'Password456');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('do not match');
  });

  test('rejects empty confirmation', () => {
    const result = validateConfirmPassword('Password123', '');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('Required Field Validation', () => {
  test('validates non-empty value', () => {
    const result = validateRequired('some value');
    expect(result.isValid).toBe(true);
  });

  test('rejects null value', () => {
    const result = validateRequired(null);
    expect(result.isValid).toBe(false);
  });

  test('rejects undefined value', () => {
    const result = validateRequired(undefined);
    expect(result.isValid).toBe(false);
  });

  test('rejects empty string', () => {
    const result = validateRequired('');
    expect(result.isValid).toBe(false);
  });

  test('rejects whitespace-only string', () => {
    const result = validateRequired('   ');
    expect(result.isValid).toBe(false);
  });

  test('uses custom field name in error', () => {
    const result = validateRequired('', 'Email');
    expect(result.error).toContain('Email');
  });
});

describe('Number Validation', () => {
  test('validates valid number', () => {
    const result = validateNumber(42);
    expect(result.isValid).toBe(true);
  });

  test('validates number string', () => {
    const result = validateNumber('42');
    expect(result.isValid).toBe(true);
  });

  test('rejects non-numeric value', () => {
    const result = validateNumber('abc');
    expect(result.isValid).toBe(false);
  });

  test('validates with min constraint', () => {
    const result = validateNumber(10, { min: 5 });
    expect(result.isValid).toBe(true);
  });

  test('rejects below min', () => {
    const result = validateNumber(3, { min: 5 });
    expect(result.isValid).toBe(false);
  });

  test('validates with max constraint', () => {
    const result = validateNumber(10, { max: 20 });
    expect(result.isValid).toBe(true);
  });

  test('rejects above max', () => {
    const result = validateNumber(25, { max: 20 });
    expect(result.isValid).toBe(false);
  });

  test('validates integer when required', () => {
    const result = validateNumber(42, { integer: true });
    expect(result.isValid).toBe(true);
  });

  test('rejects decimal when integer required', () => {
    const result = validateNumber(42.5, { integer: true });
    expect(result.isValid).toBe(false);
  });
});

describe('Date Validation', () => {
  test('validates valid date', () => {
    const result = validateDate(new Date());
    expect(result.isValid).toBe(true);
  });

  test('validates date string', () => {
    const result = validateDate('2024-01-01');
    expect(result.isValid).toBe(true);
  });

  test('rejects invalid date', () => {
    const result = validateDate('invalid-date');
    expect(result.isValid).toBe(false);
  });

  test('rejects empty date', () => {
    const result = validateDate('');
    expect(result.isValid).toBe(false);
  });

  test('validates future date when required', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const result = validateDate(futureDate, { futureOnly: true });
    expect(result.isValid).toBe(true);
  });

  test('rejects past date when future required', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const result = validateDate(pastDate, { futureOnly: true });
    expect(result.isValid).toBe(false);
  });

  test('validates past date when required', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const result = validateDate(pastDate, { pastOnly: true });
    expect(result.isValid).toBe(true);
  });

  test('rejects future date when past required', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const result = validateDate(futureDate, { pastOnly: true });
    expect(result.isValid).toBe(false);
  });
});

describe('URL Validation', () => {
  test('validates valid URL', () => {
    const result = validateUrl('https://example.com');
    expect(result.isValid).toBe(true);
  });

  test('validates URL with path', () => {
    const result = validateUrl('https://example.com/path/to/page');
    expect(result.isValid).toBe(true);
  });

  test('rejects invalid URL', () => {
    const result = validateUrl('not-a-url');
    expect(result.isValid).toBe(false);
  });

  test('rejects empty URL', () => {
    const result = validateUrl('');
    expect(result.isValid).toBe(false);
  });
});

describe('Team Name Validation', () => {
  test('validates valid team name', () => {
    const result = validateTeamName('Team Awesome');
    expect(result.isValid).toBe(true);
  });

  test('rejects too short team name', () => {
    const result = validateTeamName('A');
    expect(result.isValid).toBe(false);
  });

  test('rejects too long team name', () => {
    const result = validateTeamName('A'.repeat(51));
    expect(result.isValid).toBe(false);
  });

  test('rejects empty team name', () => {
    const result = validateTeamName('');
    expect(result.isValid).toBe(false);
  });
});

describe('Player Name Validation', () => {
  test('validates valid player name', () => {
    const result = validatePlayerName('John Doe');
    expect(result.isValid).toBe(true);
  });

  test('validates name with hyphen', () => {
    const result = validatePlayerName('Mary-Jane Smith');
    expect(result.isValid).toBe(true);
  });

  test('validates name with apostrophe', () => {
    const result = validatePlayerName("O'Connor");
    expect(result.isValid).toBe(true);
  });

  test('rejects too short name', () => {
    const result = validatePlayerName('A');
    expect(result.isValid).toBe(false);
  });

  test('rejects too long name', () => {
    const result = validatePlayerName('A'.repeat(101));
    expect(result.isValid).toBe(false);
  });

  test('rejects name with numbers', () => {
    const result = validatePlayerName('John123');
    expect(result.isValid).toBe(false);
  });

  test('rejects name with special characters', () => {
    const result = validatePlayerName('John@Doe');
    expect(result.isValid).toBe(false);
  });
});

describe('Tournament Name Validation', () => {
  test('validates valid tournament name', () => {
    const result = validateTournamentName('Summer Championship 2024');
    expect(result.isValid).toBe(true);
  });

  test('rejects too short tournament name', () => {
    const result = validateTournamentName('AB');
    expect(result.isValid).toBe(false);
  });

  test('rejects too long tournament name', () => {
    const result = validateTournamentName('A'.repeat(101));
    expect(result.isValid).toBe(false);
  });

  test('rejects empty tournament name', () => {
    const result = validateTournamentName('');
    expect(result.isValid).toBe(false);
  });
});

describe('Description Validation', () => {
  test('validates valid description', () => {
    const result = validateDescription('This is a valid description with enough characters');
    expect(result.isValid).toBe(true);
  });

  test('allows empty description when not required', () => {
    const result = validateDescription('', { required: false });
    expect(result.isValid).toBe(true);
  });

  test('rejects empty description when required', () => {
    const result = validateDescription('', { required: true });
    expect(result.isValid).toBe(false);
  });

  test('rejects too short description', () => {
    const result = validateDescription('Short', { minLength: 10 });
    expect(result.isValid).toBe(false);
  });

  test('rejects too long description', () => {
    const result = validateDescription('A'.repeat(1001), { maxLength: 1000 });
    expect(result.isValid).toBe(false);
  });
});

describe('File Validation', () => {
  test('validates valid file', () => {
    const file = {
      name: 'image.jpg',
      type: 'image/jpeg',
      size: 1024 * 1024, // 1MB
    };
    const result = validateFile(file);
    expect(result.isValid).toBe(true);
  });

  test('rejects file exceeding size limit', () => {
    const file = {
      name: 'large.jpg',
      type: 'image/jpeg',
      size: 10 * 1024 * 1024, // 10MB
    };
    const result = validateFile(file, { maxSize: 5 * 1024 * 1024 });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('size');
  });

  test('rejects invalid file type', () => {
    const file = {
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024,
    };
    const result = validateFile(file, { allowedTypes: ['image/jpeg', 'image/png'] });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('type');
  });

  test('rejects invalid file extension', () => {
    const file = {
      name: 'image.gif',
      type: 'image/jpeg', // Valid type but invalid extension
      size: 1024,
    };
    const result = validateFile(file, { 
      allowedTypes: ['image/jpeg', 'image/png'],
      allowedExtensions: ['.jpg', '.png'] 
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('extension');
  });

  test('rejects missing file', () => {
    const result = validateFile(null);
    expect(result.isValid).toBe(false);
  });
});

describe('Image Validation', () => {
  test('validates valid image', () => {
    const file = {
      name: 'photo.jpg',
      type: 'image/jpeg',
      size: 2 * 1024 * 1024, // 2MB
    };
    const result = validateImage(file);
    expect(result.isValid).toBe(true);
  });

  test('validates PNG image', () => {
    const file = {
      name: 'photo.png',
      type: 'image/png',
      size: 2 * 1024 * 1024,
    };
    const result = validateImage(file);
    expect(result.isValid).toBe(true);
  });

  test('rejects oversized image', () => {
    const file = {
      name: 'huge.jpg',
      type: 'image/jpeg',
      size: 15 * 1024 * 1024, // 15MB
    };
    const result = validateImage(file);
    expect(result.isValid).toBe(false);
  });
});

describe('XSS Prevention in Sanitization', () => {
  test('prevents script injection in text', () => {
    const malicious = '<script>alert("XSS")</script>';
    const result = sanitizeText(malicious);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    // Note: sanitizeText escapes HTML but doesn't remove content
  });

  test('prevents event handler injection', () => {
    const malicious = '<img src="x" onerror="alert(1)">';
    const result = sanitizeText(malicious);
    expect(result).not.toContain('<img');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    // Note: sanitizeText escapes HTML tags
  });

  test('prevents javascript protocol in HTML', () => {
    const malicious = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('javascript:');
  });

  test('prevents iframe injection', () => {
    const malicious = '<iframe src="evil.com"></iframe>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('<iframe');
  });

  test('prevents data URI injection', () => {
    const malicious = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('data:text/html');
  });

  test('prevents style tag injection', () => {
    const malicious = '<style>body { display: none; }</style>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('<style>');
  });
});

describe('Path Traversal Prevention', () => {
  test('prevents directory traversal in filename', () => {
    const malicious = '../../../etc/passwd';
    const result = sanitizeFileName(malicious);
    expect(result).not.toContain('..');
    expect(result).not.toContain('/');
  });

  test('prevents hidden file creation', () => {
    const malicious = '...hidden.txt';
    const result = sanitizeFileName(malicious);
    expect(result).not.toMatch(/^\./);
  });

  test('removes path separators', () => {
    const malicious = 'path/to/file.txt';
    const result = sanitizeFileName(malicious);
    expect(result).not.toContain('/');
  });
});

describe('SQL Injection Prevention in Search', () => {
  test('removes SQL-like characters from search', () => {
    const malicious = "'; DROP TABLE users; --";
    const result = sanitizeSearchQuery(malicious);
    expect(result).not.toContain("'");
    expect(result).not.toContain('"');
  });

  test('limits search query length', () => {
    const longQuery = 'a'.repeat(500);
    const result = sanitizeSearchQuery(longQuery);
    expect(result.length).toBeLessThanOrEqual(200);
  });
});

describe('Edge Cases in Sanitization', () => {
  test('handles null input in sanitizeText', () => {
    const result = sanitizeText(null);
    expect(result).toBe('');
  });

  test('handles undefined input in sanitizeText', () => {
    const result = sanitizeText(undefined);
    expect(result).toBe('');
  });

  test('handles non-string input in sanitizeText', () => {
    const result = sanitizeText(123);
    expect(typeof result).toBe('string');
  });

  test('handles empty object in sanitizeObject', () => {
    const result = sanitizeObject({}, {});
    expect(result).toEqual({});
  });

  test('handles null object in sanitizeObject', () => {
    const result = sanitizeObject(null, {});
    expect(result).toEqual({});
  });
});
