import { faker } from '@faker-js/faker';

/**
 * Generate a mock user object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock user
 */
export const mockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  avatar: faker.image.avatar(),
  bio: faker.lorem.sentence(),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});

/**
 * Generate a mock cricket match object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock cricket match
 */
export const mockCricketMatch = (overrides = {}) => ({
  id: faker.string.uuid(),
  homeTeam: {
    id: faker.string.uuid(),
    name: faker.company.name(),
    logo: faker.image.url(),
  },
  awayTeam: {
    id: faker.string.uuid(),
    name: faker.company.name(),
    logo: faker.image.url(),
  },
  venue: faker.location.city(),
  date: faker.date.future().toISOString(),
  status: faker.helpers.arrayElement(['scheduled', 'live', 'completed', 'cancelled']),
  format: faker.helpers.arrayElement(['T20', 'ODI', 'Test']),
  score: {
    home: {
      runs: faker.number.int({ min: 0, max: 400 }),
      wickets: faker.number.int({ min: 0, max: 10 }),
      overs: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
    },
    away: {
      runs: faker.number.int({ min: 0, max: 400 }),
      wickets: faker.number.int({ min: 0, max: 10 }),
      overs: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
    },
  },
  tossWinner: faker.helpers.arrayElement(['home', 'away']),
  tossDecision: faker.helpers.arrayElement(['bat', 'bowl']),
  ...overrides,
});

/**
 * Generate a mock football match object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock football match
 */
export const mockFootballMatch = (overrides = {}) => ({
  id: faker.string.uuid(),
  homeTeam: {
    id: faker.string.uuid(),
    name: faker.company.name(),
    logo: faker.image.url(),
  },
  awayTeam: {
    id: faker.string.uuid(),
    name: faker.company.name(),
    logo: faker.image.url(),
  },
  venue: faker.location.city(),
  date: faker.date.future().toISOString(),
  status: faker.helpers.arrayElement(['scheduled', 'live', 'completed', 'cancelled']),
  score: {
    home: faker.number.int({ min: 0, max: 10 }),
    away: faker.number.int({ min: 0, max: 10 }),
  },
  period: faker.helpers.arrayElement(['first_half', 'half_time', 'second_half', 'full_time']),
  ...overrides,
});

/**
 * Generate a mock player object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock player
 */
export const mockPlayer = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  avatar: faker.image.avatar(),
  position: faker.helpers.arrayElement(['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']),
  jerseyNumber: faker.number.int({ min: 1, max: 99 }),
  team: {
    id: faker.string.uuid(),
    name: faker.company.name(),
  },
  stats: {
    matches: faker.number.int({ min: 0, max: 200 }),
    runs: faker.number.int({ min: 0, max: 10000 }),
    wickets: faker.number.int({ min: 0, max: 500 }),
    average: faker.number.float({ min: 0, max: 100, precision: 0.01 }),
  },
  ...overrides,
});

/**
 * Generate a mock tournament object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock tournament
 */
export const mockTournament = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name() + ' Tournament',
  sport: faker.helpers.arrayElement(['cricket', 'football']),
  format: faker.helpers.arrayElement(['knockout', 'league', 'round-robin']),
  startDate: faker.date.future().toISOString(),
  endDate: faker.date.future().toISOString(),
  status: faker.helpers.arrayElement(['upcoming', 'ongoing', 'completed']),
  teams: Array.from({ length: faker.number.int({ min: 4, max: 16 }) }, () => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    logo: faker.image.url(),
  })),
  ...overrides,
});

/**
 * Generate a mock club object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock club
 */
export const mockClub = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  logo: faker.image.url(),
  description: faker.lorem.paragraph(),
  sport: faker.helpers.arrayElement(['cricket', 'football']),
  members: faker.number.int({ min: 10, max: 1000 }),
  founded: faker.date.past({ years: 50 }).toISOString(),
  location: faker.location.city(),
  ...overrides,
});

/**
 * Generate a mock community object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock community
 */
export const mockCommunity = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name() + ' Community',
  description: faker.lorem.paragraph(),
  type: faker.helpers.arrayElement(['public', 'private']),
  members: faker.number.int({ min: 10, max: 10000 }),
  createdAt: faker.date.past().toISOString(),
  avatar: faker.image.url(),
  ...overrides,
});

/**
 * Generate a mock thread object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock thread
 */
export const mockThread = (overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(3),
  author: mockUser(),
  createdAt: faker.date.past().toISOString(),
  likes: faker.number.int({ min: 0, max: 1000 }),
  comments: faker.number.int({ min: 0, max: 500 }),
  media: faker.helpers.maybe(() => [faker.image.url()], { probability: 0.3 }),
  ...overrides,
});

/**
 * Generate a mock comment object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock comment
 */
export const mockComment = (overrides = {}) => ({
  id: faker.string.uuid(),
  content: faker.lorem.paragraph(),
  author: mockUser(),
  createdAt: faker.date.past().toISOString(),
  likes: faker.number.int({ min: 0, max: 100 }),
  ...overrides,
});

/**
 * Generate multiple mock items
 * @param {Function} factory - Factory function to use
 * @param {number} count - Number of items to generate
 * @param {Object} overrides - Properties to override for all items
 * @returns {Array} Array of mock items
 */
export const mockMany = (factory, count = 5, overrides = {}) => {
  return Array.from({ length: count }, () => factory(overrides));
};

/**
 * Generate a mock API response
 * @param {*} data - Response data
 * @param {Object} options - Response options
 * @returns {Object} Mock API response
 */
export const mockApiResponse = (data, options = {}) => ({
  data,
  status: options.status || 200,
  statusText: options.statusText || 'OK',
  headers: options.headers || {},
  config: options.config || {},
});

/**
 * Generate a mock API error
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} Mock API error
 */
export const mockApiError = (message = 'An error occurred', status = 500) => ({
  response: {
    data: {
      message,
      error: message,
    },
    status,
    statusText: status === 404 ? 'Not Found' : status === 401 ? 'Unauthorized' : 'Internal Server Error',
  },
  message,
});
