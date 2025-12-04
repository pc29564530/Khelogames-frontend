/**
 * Match Management E2E Tests
 * 
 * This test suite covers the complete match management flows including:
 * - Creating a cricket match
 * - Updating match scores
 * - Viewing match details
 * 
 * Requirements: 5.3
 * 
 * NOTE: This test file requires testIDs to be added to the following screens:
 * - screen/CreateMatch.js
 * - screen/CricketMatchPage.js
 * - screen/CricketLiveScore.js
 * 
 * See the inline comments for required testID additions.
 */

import {
  waitForElement,
  tapElement,
  typeText,
  replaceText,
  expectElementToBeVisible,
  expectElementToHaveText,
  reloadApp,
  waitForLoadingToComplete,
  expectElementNotToBeVisible,
  scrollToElement,
  swipeElement,
} from './utils/testHelpers';

import {
  generateCricketMatch,
  generateTestUser,
  TEST_CREDENTIALS,
} from './utils/testDataSeeder';

import { TIMEOUTS } from './utils/config';

describe('Match Management E2E Tests', () => {
  beforeEach(async () => {
    // Reload app and ensure user is logged in before each test
    await reloadApp();
    
    // Login with valid credentials
    await waitForElement('signin-screen', TIMEOUTS.long);
    await tapElement('signin-email-input');
    await replaceText('signin-email-input', TEST_CREDENTIALS.validUser.email);
    
    await tapElement('signin-password-input');
    await replaceText('signin-password-input', TEST_CREDENTIALS.validUser.password);
    await tapElement('signin-submit-button');
    
    // Wait for home screen
    await waitForElement('home-screen', TIMEOUTS.long);
  });

  describe('Cricket Match Creation Flow', () => {
    /**
     * Required testIDs for CreateMatch.js:
     * - create-match-screen
     * - select-first-team-button
     * - select-second-team-button
     * - team-modal-{teamId} (for each team in the list)
     * - select-start-time-button
     * - select-end-time-button
     * - match-type-{type} (Team, Individual, Double)
     * - match-stage-{stage} (Group, Knockout, League)
     * - match-format-button (for cricket)
     * - match-format-{format} (T20, ODI, Test)
     * - knockout-level-button
     * - knockout-level-{id}
     * - create-match-submit-button
     * - create-match-validation-error
     */

    it('should successfully create a cricket match with valid data', async () => {
      // Navigate to tournament screen
      // NOTE: This assumes navigation from home to tournaments to specific tournament
      // Adjust based on actual app navigation structure
      await waitForElement('home-screen', TIMEOUTS.medium);
      
      // Navigate to tournaments tab/section
      await tapElement('tournaments-tab');
      await waitForElement('tournaments-list', TIMEOUTS.medium);
      
      // Select a tournament
      await tapElement('tournament-item-0');
      await waitForElement('tournament-details-screen', TIMEOUTS.medium);
      
      // Navigate to create match
      await tapElement('create-match-button');
      await waitForElement('create-match-screen', TIMEOUTS.medium);
      
      // Select first team
      await tapElement('select-first-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-0');
      
      // Verify first team is selected
      await expectElementToBeVisible('selected-first-team-name');
      
      // Select second team
      await tapElement('select-second-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-1');
      
      // Verify second team is selected
      await expectElementToBeVisible('selected-second-team-name');
      
      // Select start time
      await tapElement('select-start-time-button');
      await waitForElement('datetime-picker-modal', TIMEOUTS.short);
      // Select a future date/time
      // NOTE: Actual date selection depends on DateTimePicker implementation
      await tapElement('datetime-confirm-button');
      
      // Select match type
      await tapElement('match-type-Team');
      
      // Select match format (for cricket)
      await tapElement('match-format-button');
      await waitForElement('format-selection-modal', TIMEOUTS.short);
      await tapElement('match-format-T20');
      
      // Select stage
      await tapElement('match-stage-League');
      
      // Submit match creation
      await tapElement('create-match-submit-button');
      
      // Wait for loading to complete
      await waitForLoadingToComplete('create-match-loading', TIMEOUTS.long);
      
      // Verify navigation back to tournament details
      await waitForElement('tournament-details-screen', TIMEOUTS.medium);
      
      // Verify match appears in the list
      await expectElementToBeVisible('match-list-item-0');
    });

    it('should show validation error when first team is not selected', async () => {
      // Navigate to create match screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('tournaments-tab');
      await waitForElement('tournaments-list', TIMEOUTS.medium);
      await tapElement('tournament-item-0');
      await waitForElement('tournament-details-screen', TIMEOUTS.medium);
      await tapElement('create-match-button');
      await waitForElement('create-match-screen', TIMEOUTS.medium);
      
      // Select only second team
      await tapElement('select-second-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-0');
      
      // Select start time
      await tapElement('select-start-time-button');
      await waitForElement('datetime-picker-modal', TIMEOUTS.short);
      await tapElement('datetime-confirm-button');
      
      // Select match type and stage
      await tapElement('match-type-Team');
      await tapElement('match-stage-League');
      
      // Try to submit
      await tapElement('create-match-submit-button');
      
      // Verify validation error is shown
      await waitForElement('create-match-validation-error', TIMEOUTS.short);
      await expectElementToHaveText('create-match-validation-error', 'Please select both teams');
    });

    it('should show validation error when start time is not selected', async () => {
      // Navigate to create match screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('tournaments-tab');
      await waitForElement('tournaments-list', TIMEOUTS.medium);
      await tapElement('tournament-item-0');
      await waitForElement('tournament-details-screen', TIMEOUTS.medium);
      await tapElement('create-match-button');
      await waitForElement('create-match-screen', TIMEOUTS.medium);
      
      // Select both teams
      await tapElement('select-first-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-0');
      
      await tapElement('select-second-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-1');
      
      // Select match type and stage
      await tapElement('match-type-Team');
      await tapElement('match-stage-League');
      
      // Try to submit without start time
      await tapElement('create-match-submit-button');
      
      // Verify validation error
      await waitForElement('create-match-validation-error', TIMEOUTS.short);
      await expectElementToHaveText('create-match-validation-error', 'Please select start time');
    });

    it('should show validation error when match type is not selected', async () => {
      // Navigate to create match screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('tournaments-tab');
      await waitForElement('tournaments-list', TIMEOUTS.medium);
      await tapElement('tournament-item-0');
      await waitForElement('tournament-details-screen', TIMEOUTS.medium);
      await tapElement('create-match-button');
      await waitForElement('create-match-screen', TIMEOUTS.medium);
      
      // Select teams and start time
      await tapElement('select-first-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-0');
      
      await tapElement('select-second-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-1');
      
      await tapElement('select-start-time-button');
      await waitForElement('datetime-picker-modal', TIMEOUTS.short);
      await tapElement('datetime-confirm-button');
      
      // Try to submit without match type
      await tapElement('create-match-submit-button');
      
      // Verify validation error
      await waitForElement('create-match-validation-error', TIMEOUTS.short);
      await expectElementToHaveText('create-match-validation-error', 'Please select match type and stage');
    });

    it('should create knockout match with knockout level selection', async () => {
      // Navigate to create match screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('tournaments-tab');
      await waitForElement('tournaments-list', TIMEOUTS.medium);
      await tapElement('tournament-item-0');
      await waitForElement('tournament-details-screen', TIMEOUTS.medium);
      await tapElement('create-match-button');
      await waitForElement('create-match-screen', TIMEOUTS.medium);
      
      // Select teams
      await tapElement('select-first-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-0');
      
      await tapElement('select-second-team-button');
      await waitForElement('team-selection-modal', TIMEOUTS.short);
      await tapElement('team-modal-1');
      
      // Select start time
      await tapElement('select-start-time-button');
      await waitForElement('datetime-picker-modal', TIMEOUTS.short);
      await tapElement('datetime-confirm-button');
      
      // Select match type and format
      await tapElement('match-type-Team');
      await tapElement('match-format-button');
      await waitForElement('format-selection-modal', TIMEOUTS.short);
      await tapElement('match-format-ODI');
      
      // Select Knockout stage
      await tapElement('match-stage-Knockout');
      
      // Verify knockout level selector appears
      await expectElementToBeVisible('knockout-level-button');
      
      // Select knockout level
      await tapElement('knockout-level-button');
      await waitForElement('knockout-level-modal', TIMEOUTS.short);
      await tapElement('knockout-level-1'); // Final
      
      // Submit
      await tapElement('create-match-submit-button');
      await waitForLoadingToComplete('create-match-loading', TIMEOUTS.long);
      
      // Verify success
      await waitForElement('tournament-details-screen', TIMEOUTS.medium);
    });
  });

  describe('Match Score Update Flow', () => {
    /**
     * Required testIDs for CricketLiveScore.js:
     * - cricket-live-score-screen
     * - score-button-{runs} (0-6)
     * - score-event-wide
     * - score-event-no-ball
     * - score-event-wicket
     * - score-event-leg-bye
     * - current-batsman-{index}
     * - current-bowler
     * - add-batsman-button
     * - add-bowler-button
     * - batsman-modal-{playerId}
     * - bowler-modal-{playerId}
     * - end-inning-button
     * - next-inning-button
     * - wicket-type-{type}
     * - fielder-selection-{playerId}
     * - confirm-wicket-button
     * - striker-indicator
     * - non-striker-indicator
     */

    it('should update cricket match score with runs', async () => {
      // Navigate to a live match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      
      // Select a live match
      await tapElement('match-item-live-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      
      // Navigate to live scoring
      await tapElement('live-score-tab');
      await waitForElement('cricket-live-score-screen', TIMEOUTS.medium);
      
      // Verify current batsmen are displayed
      await expectElementToBeVisible('current-batsman-0');
      await expectElementToBeVisible('current-batsman-1');
      await expectElementToBeVisible('current-bowler');
      
      // Add runs (e.g., 4 runs)
      await tapElement('score-button-4');
      
      // Wait for score update
      await waitForLoadingToComplete('score-update-loading', TIMEOUTS.short);
      
      // Verify score is updated
      // NOTE: Actual verification depends on how score is displayed
      await expectElementToBeVisible('updated-score-indicator');
    });

    it('should handle wicket event with fielder selection', async () => {
      // Navigate to live match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-live-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      await tapElement('live-score-tab');
      await waitForElement('cricket-live-score-screen', TIMEOUTS.medium);
      
      // Trigger wicket event
      await tapElement('score-event-wicket');
      
      // Wait for wicket modal
      await waitForElement('wicket-type-modal', TIMEOUTS.short);
      
      // Select wicket type (e.g., Catch)
      await tapElement('wicket-type-Catch');
      
      // Verify fielder selection appears
      await waitForElement('fielder-selection-modal', TIMEOUTS.short);
      
      // Select fielder
      await tapElement('fielder-selection-0');
      
      // Confirm wicket
      await tapElement('confirm-wicket-button');
      
      // Wait for score update
      await waitForLoadingToComplete('score-update-loading', TIMEOUTS.medium);
      
      // Verify new batsman selection modal appears
      await waitForElement('add-batsman-modal', TIMEOUTS.short);
      
      // Select new batsman
      await tapElement('batsman-modal-0');
      
      // Verify new batsman is added
      await expectElementToBeVisible('current-batsman-0');
    });

    it('should handle wide ball event', async () => {
      // Navigate to live match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-live-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      await tapElement('live-score-tab');
      await waitForElement('cricket-live-score-screen', TIMEOUTS.medium);
      
      // Trigger wide event
      await tapElement('score-event-wide');
      
      // Wait for score update
      await waitForLoadingToComplete('score-update-loading', TIMEOUTS.short);
      
      // Verify score is updated (extras should increase)
      await expectElementToBeVisible('updated-score-indicator');
    });

    it('should handle no ball event', async () => {
      // Navigate to live match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-live-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      await tapElement('live-score-tab');
      await waitForElement('cricket-live-score-screen', TIMEOUTS.medium);
      
      // Trigger no ball event
      await tapElement('score-event-no-ball');
      
      // Wait for score update
      await waitForLoadingToComplete('score-update-loading', TIMEOUTS.short);
      
      // Verify score is updated
      await expectElementToBeVisible('updated-score-indicator');
    });

    it('should add new batsman when needed', async () => {
      // Navigate to live match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-live-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      await tapElement('live-score-tab');
      await waitForElement('cricket-live-score-screen', TIMEOUTS.medium);
      
      // Tap add batsman button
      await tapElement('add-batsman-button');
      
      // Wait for batsman selection modal
      await waitForElement('add-batsman-modal', TIMEOUTS.short);
      
      // Select a batsman
      await tapElement('batsman-modal-0');
      
      // Verify batsman is added
      await expectElementToBeVisible('current-batsman-0');
    });

    it('should change bowler', async () => {
      // Navigate to live match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-live-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      await tapElement('live-score-tab');
      await waitForElement('cricket-live-score-screen', TIMEOUTS.medium);
      
      // Tap add/change bowler button
      await tapElement('add-bowler-button');
      
      // Wait for bowler selection modal
      await waitForElement('add-bowler-modal', TIMEOUTS.short);
      
      // Select new bowler
      await tapElement('bowler-modal-0');
      
      // Verify bowler is changed
      await expectElementToBeVisible('current-bowler');
    });

    it('should end inning when all wickets fall', async () => {
      // Navigate to live match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-live-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      await tapElement('live-score-tab');
      await waitForElement('cricket-live-score-screen', TIMEOUTS.medium);
      
      // Tap end inning button
      await tapElement('end-inning-button');
      
      // Wait for confirmation modal
      await waitForElement('end-inning-confirmation-modal', TIMEOUTS.short);
      
      // Confirm end inning
      await tapElement('confirm-end-inning-button');
      
      // Wait for loading
      await waitForLoadingToComplete('end-inning-loading', TIMEOUTS.medium);
      
      // Verify next inning modal appears
      await waitForElement('next-inning-modal', TIMEOUTS.short);
    });

    it('should start next inning', async () => {
      // Navigate to match with completed first inning
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-inning-complete-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      await tapElement('live-score-tab');
      await waitForElement('cricket-live-score-screen', TIMEOUTS.medium);
      
      // Verify next inning button is visible
      await expectElementToBeVisible('next-inning-button');
      
      // Tap next inning button
      await tapElement('next-inning-button');
      
      // Wait for loading
      await waitForLoadingToComplete('next-inning-loading', TIMEOUTS.medium);
      
      // Verify new inning is started
      await expectElementToBeVisible('inning-2-indicator');
    });
  });

  describe('Match Details Viewing Flow', () => {
    /**
     * Required testIDs for CricketMatchPage.js:
     * - cricket-match-page
     * - match-status-indicator
     * - home-team-logo
     * - away-team-logo
     * - home-team-name
     * - away-team-name
     * - home-team-score
     * - away-team-score
     * - match-info-tab
     * - scorecard-tab
     * - live-score-tab
     * - match-venue
     * - match-date
     * - match-time
     * - match-format
     * - toss-info
     * - batting-scorecard
     * - bowling-scorecard
     * - batsman-row-{index}
     * - bowler-row-{index}
     */

    it('should view match details for scheduled match', async () => {
      // Navigate to matches
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      
      // Select a scheduled match
      await tapElement('match-item-scheduled-0');
      
      // Wait for match page
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      
      // Verify match status
      await expectElementToBeVisible('match-status-indicator');
      await expectElementToHaveText('match-status-indicator', 'not_started');
      
      // Verify team information
      await expectElementToBeVisible('home-team-logo');
      await expectElementToBeVisible('away-team-logo');
      await expectElementToBeVisible('home-team-name');
      await expectElementToBeVisible('away-team-name');
      
      // Navigate to match info tab
      await tapElement('match-info-tab');
      
      // Verify match details
      await expectElementToBeVisible('match-venue');
      await expectElementToBeVisible('match-date');
      await expectElementToBeVisible('match-time');
      await expectElementToBeVisible('match-format');
    });

    it('should view live match with real-time score updates', async () => {
      // Navigate to matches
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      
      // Select a live match
      await tapElement('match-item-live-0');
      
      // Wait for match page
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      
      // Verify match status
      await expectElementToBeVisible('match-status-indicator');
      await expectElementToHaveText('match-status-indicator', 'in_progress');
      
      // Verify scores are displayed
      await expectElementToBeVisible('home-team-score');
      await expectElementToBeVisible('away-team-score');
      
      // Navigate to scorecard tab
      await tapElement('scorecard-tab');
      
      // Verify batting scorecard
      await expectElementToBeVisible('batting-scorecard');
      await expectElementToBeVisible('batsman-row-0');
      
      // Scroll to bowling scorecard
      await scrollToElement('cricket-match-page', 'bowling-scorecard');
      
      // Verify bowling scorecard
      await expectElementToBeVisible('bowling-scorecard');
      await expectElementToBeVisible('bowler-row-0');
    });

    it('should view completed match with final scores', async () => {
      // Navigate to matches
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      
      // Select a completed match
      await tapElement('match-item-finished-0');
      
      // Wait for match page
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      
      // Verify match status
      await expectElementToBeVisible('match-status-indicator');
      await expectElementToHaveText('match-status-indicator', 'finished');
      
      // Verify final scores
      await expectElementToBeVisible('home-team-score');
      await expectElementToBeVisible('away-team-score');
      
      // Verify match result
      await expectElementToBeVisible('match-result-text');
      
      // Navigate to scorecard
      await tapElement('scorecard-tab');
      
      // Verify complete scorecard is available
      await expectElementToBeVisible('batting-scorecard');
      await expectElementToBeVisible('bowling-scorecard');
    });

    it('should navigate between match tabs', async () => {
      // Navigate to match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      
      // Navigate to match info tab
      await tapElement('match-info-tab');
      await expectElementToBeVisible('match-venue');
      
      // Navigate to scorecard tab
      await tapElement('scorecard-tab');
      await expectElementToBeVisible('batting-scorecard');
      
      // Navigate to live score tab (if match is live)
      await tapElement('live-score-tab');
      await expectElementToBeVisible('cricket-live-score-screen');
    });

    it('should display toss information', async () => {
      // Navigate to match
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('matches-tab');
      await waitForElement('matches-list', TIMEOUTS.medium);
      await tapElement('match-item-0');
      await waitForElement('cricket-match-page', TIMEOUTS.medium);
      
      // Navigate to match info
      await tapElement('match-info-tab');
      
      // Verify toss information is displayed
      await expectElementToBeVisible('toss-info');
      await expectElementToBeVisible('toss-winner');
      await expectElementToBeVisible('toss-decision');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during match creation', async () => {
      // This test would require mocking network failures
      // For now, it's a placeholder for future implementation
      //
      // Expected behavior:
      // 1. Trigger network error during match creation
      // 2. Verify error message is displayed
      // 3. Verify retry option is available
      // 4. Verify form data is preserved
    });

    it('should handle network errors during score update', async () => {
      // This test would require mocking network failures
      // For now, it's a placeholder for future implementation
      //
      // Expected behavior:
      // 1. Trigger network error during score update
      // 2. Verify error message is displayed
      // 3. Verify retry option is available
      // 4. Verify score update can be retried
    });

    it('should handle WebSocket disconnection gracefully', async () => {
      // This test would require simulating WebSocket disconnection
      // For now, it's a placeholder for future implementation
      //
      // Expected behavior:
      // 1. Simulate WebSocket disconnection
      // 2. Verify reconnection indicator is shown
      // 3. Verify automatic reconnection occurs
      // 4. Verify score updates resume after reconnection
    });
  });
});
