/**
 * Test Data Seeder for E2E Tests
 * 
 * This module provides utilities for seeding test data before E2E tests run.
 * It helps create consistent test scenarios and reduces test flakiness.
 */

import { faker } from '@faker-js/faker';

/**
 * Generate a random user for testing
 * @param {Object} overrides - Optional overrides for user properties
 * @returns {Object} User object
 */
export const generateTestUser = (overrides = {}) => {
  return {
    email: faker.internet.email().toLowerCase(),
    password: 'Test@1234',
    username: faker.internet.userName().toLowerCase(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number(),
    ...overrides,
  };
};

/**
 * Generate a cricket match for testing
 * @param {Object} overrides - Optional overrides for match properties
 * @returns {Object} Cricket match object
 */
export const generateCricketMatch = (overrides = {}) => {
  return {
    homeTeam: faker.company.name() + ' CC',
    awayTeam: faker.company.name() + ' CC',
    venue: faker.location.city() + ' Stadium',
    date: faker.date.future().toISOString(),
    format: faker.helpers.arrayElement(['T20', 'ODI', 'Test']),
    overs: faker.helpers.arrayElement([20, 50, 90]),
    status: 'scheduled',
    ...overrides,
  };
};

/**
 * Generate a football match for testing
 * @param {Object} overrides - Optional overrides for match properties
 * @returns {Object} Football match object
 */
export const generateFootballMatch = (overrides = {}) => {
  return {
    homeTeam: faker.company.name() + ' FC',
    awayTeam: faker.company.name() + ' FC',
    venue: faker.location.city() + ' Stadium',
    date: faker.date.future().toISOString(),
    format: faker.helpers.arrayElement(['League', 'Cup', 'Friendly']),
    duration: 90,
    status: 'scheduled',
    ...overrides,
  };
};

/**
 * Generate a tournament for testing
 * @param {string} sport - Sport type ('cricket' or 'football')
 * @param {Object} overrides - Optional overrides for tournament properties
 * @returns {Object} Tournament object
 */
export const generateTournament = (sport = 'cricket', overrides = {}) => {
  return {
    name: faker.company.name() + ' Tournament',
    sport,
    startDate: faker.date.future().toISOString(),
    endDate: faker.date.future({ years: 1 }).toISOString(),
    location: faker.location.city(),
    format: faker.helpers.arrayElement(['League', 'Knockout', 'Round Robin']),
    maxTeams: faker.number.int({ min: 4, max: 16 }),
    status: 'upcoming',
    ...overrides,
  };
};

/**
 * Generate a club for testing
 * @param {string} sport - Sport type ('cricket' or 'football')
 * @param {Object} overrides - Optional overrides for club properties
 * @returns {Object} Club object
 */
export const generateClub = (sport = 'cricket', overrides = {}) => {
  return {
    name: faker.company.name() + (sport === 'cricket' ? ' CC' : ' FC'),
    sport,
    location: faker.location.city(),
    founded: faker.date.past({ years: 50 }).getFullYear(),
    description: faker.lorem.paragraph(),
    ...overrides,
  };
};

/**
 * Generate a community for testing
 * @param {Object} overrides - Optional overrides for community properties
 * @returns {Object} Community object
 */
export const generateCommunity = (overrides = {}) => {
  return {
    name: faker.company.name() + ' Community',
    description: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(['public', 'private']),
    category: faker.helpers.arrayElement(['cricket', 'football', 'general']),
    ...overrides,
  };
};

/**
 * Generate a player profile for testing
 * @param {string} sport - Sport type ('cricket' or 'football')
 * @param {Object} overrides - Optional overrides for player properties
 * @returns {Object} Player profile object
 */
export const generatePlayerProfile = (sport = 'cricket', overrides = {}) => {
  const baseProfile = {
    name: faker.person.fullName(),
    sport,
    dateOfBirth: faker.date.past({ years: 30 }).toISOString(),
    nationality: faker.location.country(),
    height: faker.number.int({ min: 160, max: 200 }),
    weight: faker.number.int({ min: 60, max: 100 }),
  };

  if (sport === 'cricket') {
    return {
      ...baseProfile,
      battingStyle: faker.helpers.arrayElement(['Right-hand', 'Left-hand']),
      bowlingStyle: faker.helpers.arrayElement(['Right-arm fast', 'Left-arm spin', 'Right-arm off-spin']),
      role: faker.helpers.arrayElement(['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']),
      ...overrides,
    };
  } else {
    return {
      ...baseProfile,
      position: faker.helpers.arrayElement(['Forward', 'Midfielder', 'Defender', 'Goalkeeper']),
      preferredFoot: faker.helpers.arrayElement(['Right', 'Left', 'Both']),
      jerseyNumber: faker.number.int({ min: 1, max: 99 }),
      ...overrides,
    };
  }
};

/**
 * Generate a thread/post for testing
 * @param {Object} overrides - Optional overrides for thread properties
 * @returns {Object} Thread object
 */
export const generateThread = (overrides = {}) => {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    category: faker.helpers.arrayElement(['discussion', 'question', 'announcement']),
    tags: faker.helpers.arrayElements(['cricket', 'football', 'match', 'tournament'], 2),
    ...overrides,
  };
};

/**
 * Generate a comment for testing
 * @param {Object} overrides - Optional overrides for comment properties
 * @returns {Object} Comment object
 */
export const generateComment = (overrides = {}) => {
  return {
    content: faker.lorem.paragraph(),
    ...overrides,
  };
};

/**
 * Generate cricket score data for testing
 * @param {Object} overrides - Optional overrides for score properties
 * @returns {Object} Cricket score object
 */
export const generateCricketScore = (overrides = {}) => {
  return {
    runs: faker.number.int({ min: 0, max: 300 }),
    wickets: faker.number.int({ min: 0, max: 10 }),
    overs: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
    runRate: faker.number.float({ min: 3, max: 12, precision: 0.01 }),
    ...overrides,
  };
};

/**
 * Generate football score data for testing
 * @param {Object} overrides - Optional overrides for score properties
 * @returns {Object} Football score object
 */
export const generateFootballScore = (overrides = {}) => {
  return {
    homeGoals: faker.number.int({ min: 0, max: 5 }),
    awayGoals: faker.number.int({ min: 0, max: 5 }),
    possession: {
      home: faker.number.int({ min: 30, max: 70 }),
      away: faker.number.int({ min: 30, max: 70 }),
    },
    shots: {
      home: faker.number.int({ min: 0, max: 20 }),
      away: faker.number.int({ min: 0, max: 20 }),
    },
    ...overrides,
  };
};

/**
 * Seed database with test data (mock implementation)
 * In a real scenario, this would make API calls to seed the backend
 * @param {Object} data - Data to seed
 */
export const seedTestData = async (data) => {
  // This is a placeholder for actual API calls to seed data
  // In practice, you would call your backend API endpoints here
  console.log('Seeding test data:', data);
  
  // Example:
  // await fetch('http://localhost:8080/api/test/seed', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  
  return data;
};

/**
 * Clear test data from database (mock implementation)
 */
export const clearTestData = async () => {
  // This is a placeholder for actual API calls to clear data
  console.log('Clearing test data');
  
  // Example:
  // await fetch('http://localhost:8080/api/test/clear', {
  //   method: 'DELETE',
  // });
};

/**
 * Create a complete test scenario with user, matches, and tournaments
 * @returns {Object} Complete test scenario data
 */
export const createCompleteTestScenario = () => {
  const user = generateTestUser();
  const cricketMatch = generateCricketMatch();
  const footballMatch = generateFootballMatch();
  const tournament = generateTournament('cricket');
  const club = generateClub('cricket');
  const community = generateCommunity();
  const playerProfile = generatePlayerProfile('cricket');
  
  return {
    user,
    cricketMatch,
    footballMatch,
    tournament,
    club,
    community,
    playerProfile,
  };
};

/**
 * Generate multiple test users
 * @param {number} count - Number of users to generate
 * @returns {Array} Array of user objects
 */
export const generateMultipleUsers = (count = 5) => {
  return Array.from({ length: count }, () => generateTestUser());
};

/**
 * Generate multiple matches
 * @param {string} sport - Sport type ('cricket' or 'football')
 * @param {number} count - Number of matches to generate
 * @returns {Array} Array of match objects
 */
export const generateMultipleMatches = (sport = 'cricket', count = 5) => {
  const generator = sport === 'cricket' ? generateCricketMatch : generateFootballMatch;
  return Array.from({ length: count }, () => generator());
};

/**
 * Predefined test credentials for consistent testing
 */
export const TEST_CREDENTIALS = {
  validUser: {
    email: 'test@khelogames.com',
    password: 'Test@1234',
    username: 'testuser',
  },
  adminUser: {
    email: 'admin@khelogames.com',
    password: 'Admin@1234',
    username: 'adminuser',
  },
  invalidUser: {
    email: 'invalid@khelogames.com',
    password: 'WrongPassword',
  },
};

/**
 * Predefined test data for common scenarios
 */
export const TEST_DATA = {
  validEmail: 'test@example.com',
  invalidEmail: 'invalid-email',
  validPassword: 'Test@1234',
  weakPassword: '123',
  validPhoneNumber: '+1234567890',
  invalidPhoneNumber: '123',
};
