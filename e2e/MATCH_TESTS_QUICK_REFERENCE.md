# Match Management E2E Tests - Quick Reference

## Quick Start

### 1. Add TestIDs (Required First!)

Before running tests, add testIDs to these screens:

**CreateMatch.js** - 30+ testIDs needed
```javascript
testID="create-match-screen"
testID="select-first-team-button"
testID="select-second-team-button"
testID="create-match-submit-button"
// See full list in MATCH_MANAGEMENT_TESTS_GUIDE.md
```

**CricketMatchPage.js** - 25+ testIDs needed
```javascript
testID="cricket-match-page"
testID="match-status-indicator"
testID="home-team-score"
testID="scorecard-tab"
// See full list in MATCH_MANAGEMENT_TESTS_GUIDE.md
```

**CricketLiveScore.js** - 40+ testIDs needed
```javascript
testID="cricket-live-score-screen"
testID="score-button-4"
testID="score-event-wicket"
testID="add-batsman-button"
// See full list in MATCH_MANAGEMENT_TESTS_GUIDE.md
```

### 2. Build & Run

```bash
# Build app for testing
npm run e2e:build:android

# Run all match tests
detox test --configuration android.debug e2e/matchManagement.e2e.js

# Run specific test suite
detox test --configuration android.debug e2e/matchManagement.e2e.js --testNamePattern="Cricket Match Creation"
```

## Test Coverage Summary

### ✅ Match Creation (5 tests)
- Create match with valid data
- Validation errors (teams, time, type)
- Knockout match creation

### ✅ Score Updates (8 tests)
- Run scoring (0-6 runs)
- Wide, No Ball, Wicket events
- Add batsmen/bowlers
- End/Start innings

### ✅ Match Viewing (5 tests)
- View scheduled/live/finished matches
- Navigate tabs
- View scorecards

### ✅ Error Handling (3 tests)
- Network errors
- WebSocket disconnection

**Total: 24 test cases**

## Common Commands

```bash
# Run with cleanup
detox test --configuration android.debug e2e/matchManagement.e2e.js --cleanup

# Run with retries
detox test --configuration android.debug e2e/matchManagement.e2e.js --retries 2

# Run specific test
detox test --configuration android.debug e2e/matchManagement.e2e.js --testNamePattern="should successfully create"
```

## Troubleshooting

### Element Not Found
→ Check testIDs are added to screens
→ Verify testID spelling matches exactly

### Test Timeout
→ Increase timeout in `e2e/utils/config.js`
→ Check app isn't stuck loading

### Score Not Updating
→ Verify WebSocket connection
→ Check Redux actions dispatching

### Navigation Fails
→ Verify navigation testIDs
→ Check no blocking modals

## Test Data Needed

- ✅ Valid user account (TEST_CREDENTIALS)
- ✅ Tournament with 2+ teams
- ✅ Live match (in_progress status)
- ✅ Completed match (finished status)

## Files Reference

- **Test Suite**: `e2e/matchManagement.e2e.js`
- **Full Guide**: `e2e/MATCH_MANAGEMENT_TESTS_GUIDE.md`
- **Summary**: `docs/TASK_18.3_MATCH_MANAGEMENT_E2E_TESTS_SUMMARY.md`
- **Helpers**: `e2e/utils/testHelpers.js`
- **Test Data**: `e2e/utils/testDataSeeder.js`

## Next Steps

1. ✅ Add testIDs to screens (see guide)
2. ✅ Seed test data
3. ✅ Run tests locally
4. ✅ Fix any failures
5. ✅ Add to CI/CD pipeline

## Need Help?

- Check `MATCH_MANAGEMENT_TESTS_GUIDE.md` for detailed instructions
- Review `authentication.e2e.js` for examples
- See `README.md` for general E2E testing info
