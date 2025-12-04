# Match Management E2E Tests Guide

This guide provides instructions for implementing and running the match management E2E tests.

## Overview

The match management E2E tests cover three main flows:
1. **Cricket Match Creation** - Creating a new cricket match in a tournament
2. **Match Score Update** - Updating live match scores during gameplay
3. **Match Details Viewing** - Viewing match information, scores, and scorecards

## Prerequisites

Before running these tests, you need to add `testID` props to the relevant screens. The tests are currently written but will fail until these testIDs are added.

## Required TestID Additions

### 1. CreateMatch.js Screen

Add the following testIDs to `screen/CreateMatch.js`:

```javascript
// Main screen container
<SafeAreaView testID="create-match-screen" style={tailwind`flex-1 bg-gray-100`}>

// Team selection buttons
<Pressable 
  testID="select-first-team-button"
  onPress={() => setIsModalTeamVisible(true)}
>

<Pressable 
  testID="select-second-team-button"
  onPress={() => setIsModalTeamVisible(true)}
>

// Selected team names (for verification)
<Text testID="selected-first-team-name">
  {firstEntity ? entities.find(...).entity.name : "Select First Entity"}
</Text>

<Text testID="selected-second-team-name">
  {secondEntity ? entities.find(...).entity.name : "Select Second Entity"}
</Text>

// Date/Time selection buttons
<Pressable 
  testID="select-start-time-button"
  onPress={() => setIsModalStartTimeVisible(true)}
>

<Pressable 
  testID="select-end-time-button"
  onPress={() => setIsModalEndTimeVisible(true)}
>

// Match type buttons
{matchTypes.map((item, index) => (
  <Pressable 
    key={index}
    testID={`match-type-${item}`}
    onPress={() => {setMatchType(item)}}
  >
))}

// Stage buttons
{Stages.map((item, index) => (
  <Pressable 
    key={index}
    testID={`match-stage-${item}`}
    onPress={() => {setStage(item)}}
  >
))}

// Match format button (for cricket)
<Pressable 
  testID="match-format-button"
  onPress={() => setIsModalMatchFormat(true)}
>

// Knockout level button
<Pressable 
  testID="knockout-level-button"
  onPress={() => setIsModalKnockoutLevel(true)}
>

// Submit button
<Pressable 
  testID="create-match-submit-button"
  onPress={handleSetFixture}
>

// Validation error display
<Text testID="create-match-validation-error">
  {validationError}
</Text>

// Modal testIDs
<Modal testID="team-selection-modal" visible={isModalTeamVisible}>
  {entities.map((item, index) => (
    <Pressable 
      key={index}
      testID={`team-modal-${index}`}
      onPress={() => handleSelectTeam(item.entity)}
    >
  ))}
</Modal>

<Modal testID="datetime-picker-modal" visible={isModalStartTimeVisible}>
  <DateTimePicker
    testID="datetime-picker"
    onSelectedChange={(startTime) => {
      setStartTime(startTime);
      setIsModalStartTimeVisible(false);
    }}
  />
</Modal>

<Modal testID="format-selection-modal" visible={isModalMatchFormat}>
  {matchFormatPath["match_format"].map((item, index) => (
    <Pressable 
      key={index}
      testID={`match-format-${item.format_type}`}
      onPress={() => { setMatchFormat(item.format_type); setIsModalMatchFormat(false)}}
    >
  ))}
</Modal>

<Modal testID="knockout-level-modal" visible={isModalKnockoutLevel}>
  {filePath["knockout"].map((item, index) => (
    <Pressable 
      key={index}
      testID={`knockout-level-${item.id}`}
      onPress={() => {setKnockoutLevel(item.id); setIsModalKnockoutLevel(false)}}
    >
  ))}
</Modal>

// Loading indicator
<ActivityIndicator testID="create-match-loading" />
```

### 2. CricketMatchPage.js Screen

Add the following testIDs to `screen/CricketMatchPage.js`:

```javascript
// Main container
<View testID="cricket-match-page" style={tailwind`flex-1 bg-white`}>

// Match status
<Text testID="match-status-indicator">
  {match?.status_code || 'Loading...'}
</Text>

// Team information
<View testID="home-team-logo">
  {/* Home team logo */}
</View>

<Text testID="home-team-name">
  {match?.homeTeam?.name || 'Home'}
</Text>

<View testID="away-team-logo">
  {/* Away team logo */}
</View>

<Text testID="away-team-name">
  {match?.awayTeam?.name || 'Away'}
</Text>

// Scores
<View testID="home-team-score">
  {/* Home team score display */}
</View>

<View testID="away-team-score">
  {/* Away team score display */}
</View>

// Match result (for finished matches)
<Text testID="match-result-text">
  {/* Match result text */}
</Text>

// Tab navigation
<Pressable testID="match-info-tab" onPress={() => setActiveTab('info')}>
  <Text>Info</Text>
</Pressable>

<Pressable testID="scorecard-tab" onPress={() => setActiveTab('scorecard')}>
  <Text>Scorecard</Text>
</Pressable>

<Pressable testID="live-score-tab" onPress={() => setActiveTab('live')}>
  <Text>Live</Text>
</Pressable>

// Match info section
<View testID="match-info-section">
  <Text testID="match-venue">{match?.venue}</Text>
  <Text testID="match-date">{formatDate(match?.start_timestamp)}</Text>
  <Text testID="match-time">{formatTime(match?.start_timestamp)}</Text>
  <Text testID="match-format">{match?.match_format}</Text>
  
  <View testID="toss-info">
    <Text testID="toss-winner">{cricketToss?.tossWonTeam?.name}</Text>
    <Text testID="toss-decision">{cricketToss?.tossDecision}</Text>
  </View>
</View>

// Scorecard section
<View testID="batting-scorecard">
  {battingScorecard.map((batsman, index) => (
    <View key={index} testID={`batsman-row-${index}`}>
      {/* Batsman details */}
    </View>
  ))}
</View>

<View testID="bowling-scorecard">
  {bowlingScorecard.map((bowler, index) => (
    <View key={index} testID={`bowler-row-${index}`}>
      {/* Bowler details */}
    </View>
  ))}
</View>
```

### 3. CricketLiveScore.js Screen

Add the following testIDs to `screen/CricketLiveScore.js`:

```javascript
// Main container
<View testID="cricket-live-score-screen">

// Current batsmen
{currentBatsman?.map((batsman, index) => (
  <View key={index} testID={`current-batsman-${index}`}>
    <Text>{batsman.player.name}</Text>
    {batsman.is_striker && <Text testID="striker-indicator">*</Text>}
    {!batsman.is_striker && <Text testID="non-striker-indicator"></Text>}
  </View>
))}

// Current bowler
<View testID="current-bowler">
  <Text>{currentBowler?.player?.name}</Text>
</View>

// Score buttons
{runsCount.map((runs) => (
  <Pressable 
    key={runs}
    testID={`score-button-${runs}`}
    onPress={() => handleScoreUpdate(runs)}
  >
    <Text>{runs}</Text>
  </Pressable>
))}

// Score event buttons
<Pressable testID="score-event-wide" onPress={() => handleWide()}>
  <Text>Wide</Text>
</Pressable>

<Pressable testID="score-event-no-ball" onPress={() => handleNoBall()}>
  <Text>No Ball</Text>
</Pressable>

<Pressable testID="score-event-wicket" onPress={() => handleWicket()}>
  <Text>Wicket</Text>
</Pressable>

<Pressable testID="score-event-leg-bye" onPress={() => handleLegBye()}>
  <Text>Leg Bye</Text>
</Pressable>

// Add batsman/bowler buttons
<Pressable 
  testID="add-batsman-button"
  onPress={() => setIsModalBattingVisible(true)}
>
  <Text>Add Next Batsman</Text>
</Pressable>

<Pressable 
  testID="add-bowler-button"
  onPress={() => setAddBowlerModalVisible(true)}
>
  <Text>Change Bowler</Text>
</Pressable>

// Inning control buttons
<Pressable 
  testID="end-inning-button"
  onPress={handleEndInning}
>
  <Text>End Inning</Text>
</Pressable>

<Pressable 
  testID="next-inning-button"
  onPress={() => setIsStartNewInningModalVisible(true)}
>
  <Text>Start Next Inning</Text>
</Pressable>

// Modals
<Modal testID="add-batsman-modal" visible={isModalBattingVisible}>
  {availableBatsmen.map((player, index) => (
    <Pressable 
      key={index}
      testID={`batsman-modal-${index}`}
      onPress={() => handleSelectBatsman(player)}
    >
      <Text>{player.name}</Text>
    </Pressable>
  ))}
</Modal>

<Modal testID="add-bowler-modal" visible={addBowlerModalVisible}>
  {availableBowlers.map((player, index) => (
    <Pressable 
      key={index}
      testID={`bowler-modal-${index}`}
      onPress={() => handleSelectBowler(player)}
    >
      <Text>{player.name}</Text>
    </Pressable>
  ))}
</Modal>

<Modal testID="wicket-type-modal" visible={isWicketModalVisible}>
  {wicketTypes.map((type, index) => (
    <Pressable 
      key={index}
      testID={`wicket-type-${type.replace(' ', '-')}`}
      onPress={() => setWicketType(type)}
    >
      <Text>{type}</Text>
    </Pressable>
  ))}
</Modal>

<Modal testID="fielder-selection-modal" visible={isFielder}>
  {currentFielder.map((player, index) => (
    <Pressable 
      key={index}
      testID={`fielder-selection-${index}`}
      onPress={() => setSelectedFielder(player)}
    >
      <Text>{player.name}</Text>
    </Pressable>
  ))}
</Modal>

<Pressable 
  testID="confirm-wicket-button"
  onPress={handleConfirmWicket}
>
  <Text>Confirm Wicket</Text>
</Pressable>

<Modal testID="end-inning-confirmation-modal" visible={showEndInningConfirmation}>
  <Pressable 
    testID="confirm-end-inning-button"
    onPress={confirmEndInning}
  >
    <Text>Confirm</Text>
  </Pressable>
</Modal>

<Modal testID="next-inning-modal" visible={isStartNewInningModalVisible}>
  <Text testID="inning-2-indicator">Inning 2</Text>
</Modal>

// Loading indicators
<ActivityIndicator testID="score-update-loading" />
<ActivityIndicator testID="end-inning-loading" />
<ActivityIndicator testID="next-inning-loading" />

// Score update indicator
<View testID="updated-score-indicator">
  <Text>Score Updated</Text>
</View>
```

### 4. Navigation TestIDs

Add these testIDs to your navigation components:

```javascript
// Home screen
<View testID="home-screen">

// Tournaments tab/section
<Pressable testID="tournaments-tab">
  <Text>Tournaments</Text>
</Pressable>

// Matches tab/section
<Pressable testID="matches-tab">
  <Text>Matches</Text>
</Pressable>

// Tournament list
<FlatList 
  testID="tournaments-list"
  data={tournaments}
  renderItem={({ item, index }) => (
    <Pressable testID={`tournament-item-${index}`}>
      {/* Tournament item */}
    </Pressable>
  )}
/>

// Tournament details screen
<View testID="tournament-details-screen">
  <Pressable testID="create-match-button">
    <Text>Create Match</Text>
  </Pressable>
</View>

// Match list
<FlatList 
  testID="matches-list"
  data={matches}
  renderItem={({ item, index }) => (
    <Pressable 
      testID={`match-item-${item.status_code}-${index}`}
      // e.g., match-item-live-0, match-item-scheduled-0, match-item-finished-0
    >
      {/* Match item */}
    </Pressable>
  )}
/>

// Match list item (for specific states)
<Pressable testID="match-list-item-0">
  {/* First match in list */}
</Pressable>
```

## Running the Tests

Once all testIDs are added:

### 1. Build the App for Testing

```bash
npm run e2e:build:android
```

### 2. Run All Match Management Tests

```bash
detox test --configuration android.debug e2e/matchManagement.e2e.js
```

### 3. Run Specific Test Suites

```bash
# Run only match creation tests
detox test --configuration android.debug e2e/matchManagement.e2e.js --testNamePattern="Cricket Match Creation"

# Run only score update tests
detox test --configuration android.debug e2e/matchManagement.e2e.js --testNamePattern="Match Score Update"

# Run only match viewing tests
detox test --configuration android.debug e2e/matchManagement.e2e.js --testNamePattern="Match Details Viewing"
```

### 4. Run with Additional Options

```bash
# Run with cleanup
detox test --configuration android.debug e2e/matchManagement.e2e.js --cleanup

# Run with retries on failure
detox test --configuration android.debug e2e/matchManagement.e2e.js --retries 2

# Run in headless mode
detox test --configuration android.debug e2e/matchManagement.e2e.js --headless
```

## Test Data Requirements

The tests assume the following data exists:

1. **Valid User Account**: A test user with valid credentials (defined in `TEST_CREDENTIALS`)
2. **Tournament with Teams**: At least one tournament with 2+ teams enrolled
3. **Live Match**: At least one match in "in_progress" status for score update tests
4. **Completed Match**: At least one match in "finished" status for viewing tests

You may need to seed this data before running tests. See `e2e/utils/testDataSeeder.js` for data generation utilities.

## Troubleshooting

### Tests Failing Due to Missing TestIDs

If tests fail with "Element not found" errors:

1. Verify all testIDs are added to the screens as documented above
2. Check that testID values match exactly (case-sensitive)
3. Use React DevTools to inspect the component tree and verify testIDs are present

### Tests Timing Out

If tests timeout:

1. Increase timeout values in `e2e/utils/config.js`
2. Check if the app is stuck in a loading state
3. Verify network requests are completing
4. Check WebSocket connection is established

### Score Updates Not Reflecting

If score updates don't reflect in tests:

1. Verify WebSocket connection is working
2. Check that Redux actions are dispatching correctly
3. Ensure the test waits for loading indicators to disappear
4. Verify the score update API endpoint is responding

### Navigation Issues

If navigation between screens fails:

1. Verify navigation testIDs are correct
2. Check that navigation stack is properly configured
3. Ensure deep linking is set up correctly
4. Verify the app doesn't have any blocking modals

## Best Practices

1. **Always wait for elements** before interacting with them
2. **Use appropriate timeouts** based on operation complexity
3. **Verify state changes** after actions (e.g., score updates, navigation)
4. **Handle loading states** by waiting for loading indicators to disappear
5. **Test error scenarios** to ensure graceful error handling
6. **Keep tests independent** - each test should be able to run in isolation
7. **Use descriptive test names** that clearly indicate what is being tested

## Next Steps

1. Add all required testIDs to the screens
2. Seed test data (tournaments, teams, matches)
3. Run the tests and verify they pass
4. Add additional test cases as needed
5. Integrate tests into CI/CD pipeline

## Related Documentation

- [E2E Testing README](./README.md)
- [Test Helpers Guide](./utils/testHelpers.js)
- [Test Data Seeding Guide](./utils/testDataSeeder.js)
- [Authentication Tests Guide](./AUTHENTICATION_TESTS_GUIDE.md)

## Support

If you encounter issues:

1. Check this guide for troubleshooting steps
2. Review the Detox documentation
3. Check existing test files for examples
4. Ask the team for help
