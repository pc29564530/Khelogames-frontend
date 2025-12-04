# Testing Infrastructure

This directory contains the testing infrastructure for the Khelogames React Native application.

## Overview

The testing setup includes:
- **Jest** as the test runner
- **React Native Testing Library** for component testing
- **Redux Mock Store** for testing Redux-connected components
- **Faker.js** for generating mock data
- **Custom test utilities** for common testing patterns

## Directory Structure

```
__tests__/
├── utils/
│   ├── test-utils.js          # Custom render functions and utilities
│   └── mockDataFactories.js   # Mock data generators
├── unit/                       # Unit tests
├── component/                  # Component tests
├── integration/                # Integration tests
├── e2e/                        # End-to-end tests (Detox)
├── example.test.js             # Example test demonstrating setup
└── README.md                   # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test -- path/to/test.test.js
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should render"
```

## Writing Tests

### Basic Component Test

```javascript
import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

describe('MyComponent', () => {
  it('should render text', () => {
    const { getByText } = render(<Text>Hello World</Text>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should find element by testID', () => {
    const { getByTestId } = render(
      <View testID="my-view">
        <Text>Content</Text>
      </View>
    );
    expect(getByTestId('my-view')).toBeTruthy();
  });
});
```

### Component Test with Redux

```javascript
import React from 'react';
import { renderWithRedux } from '../utils/test-utils';
import MyComponent from '../../components/MyComponent';

describe('MyComponent with Redux', () => {
  it('should render with initial state', () => {
    const initialState = {
      user: { name: 'John' },
    };

    const { getByText } = renderWithRedux(
      <MyComponent />,
      { initialState }
    );

    expect(getByText('John')).toBeTruthy();
  });
});
```

### Component Test with Navigation

```javascript
import React from 'react';
import { renderWithNavigation } from '../utils/test-utils';
import MyScreen from '../../screen/MyScreen';

describe('MyScreen with Navigation', () => {
  it('should render screen', () => {
    const { getByTestID } = renderWithNavigation(<MyScreen />);
    expect(getByTestID('my-screen')).toBeTruthy();
  });
});
```

### Component Test with Both Redux and Navigation

```javascript
import React from 'react';
import { renderWithProviders } from '../utils/test-utils';
import MyScreen from '../../screen/MyScreen';

describe('MyScreen with Providers', () => {
  it('should render with all providers', () => {
    const initialState = {
      auth: { isAuthenticated: true },
    };

    const { getByTestId, store } = renderWithProviders(
      <MyScreen />,
      { initialState }
    );

    expect(getByTestId('my-screen')).toBeTruthy();
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });
});
```

### Using Mock Data Factories

```javascript
import { mockUser, mockCricketMatch, mockMany } from '../utils/mockDataFactories';

describe('Mock Data Tests', () => {
  it('should generate mock user', () => {
    const user = mockUser();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
  });

  it('should generate mock user with overrides', () => {
    const user = mockUser({ username: 'testuser' });
    expect(user.username).toBe('testuser');
  });

  it('should generate multiple mock users', () => {
    const users = mockMany(mockUser, 5);
    expect(users).toHaveLength(5);
  });

  it('should generate mock cricket match', () => {
    const match = mockCricketMatch();
    expect(match).toHaveProperty('homeTeam');
    expect(match).toHaveProperty('awayTeam');
    expect(match).toHaveProperty('score');
  });
});
```

### Testing Async Operations

```javascript
import { waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../utils/test-utils';

describe('Async Tests', () => {
  it('should handle async data loading', async () => {
    const { getByText, getByTestID } = renderWithProviders(<MyComponent />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByTestID('data-loaded')).toBeTruthy();
    });

    expect(getByText('Data Loaded')).toBeTruthy();
  });
});
```

### Testing User Interactions

```javascript
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../utils/test-utils';

describe('User Interaction Tests', () => {
  it('should handle button press', () => {
    const onPress = jest.fn();
    const { getByTestID } = renderWithProviders(
      <Button testID="my-button" onPress={onPress} />
    );

    fireEvent.press(getByTestID('my-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should handle text input', () => {
    const onChangeText = jest.fn();
    const { getByTestID } = renderWithProviders(
      <TextInput testID="my-input" onChangeText={onChangeText} />
    );

    fireEvent.changeText(getByTestID('my-input'), 'test text');
    expect(onChangeText).toHaveBeenCalledWith('test text');
  });
});
```

## Test Coverage

The project maintains a minimum coverage threshold of 80% for:
- Statements
- Branches
- Functions
- Lines

Coverage reports are generated in the `coverage/` directory after running tests with the `--coverage` flag.

### Viewing Coverage Report

After running tests with coverage:
```bash
npm test -- --coverage
```

Open the HTML report:
```bash
open coverage/lcov-report/index.html
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Test IDs**: Add `testID` props to components for reliable querying
3. **Mock External Dependencies**: Mock API calls, navigation, and third-party libraries
4. **Keep Tests Isolated**: Each test should be independent and not rely on others
5. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
6. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
7. **Test Edge Cases**: Include tests for error states, empty states, and boundary conditions
8. **Avoid Testing Implementation Details**: Don't test internal state or private methods

## Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions. The CI pipeline:
- Installs dependencies
- Runs linter
- Executes all tests with coverage
- Uploads coverage reports to Codecov
- Comments on PRs with coverage changes

## Troubleshooting

### Tests Failing Due to Missing Mocks

If tests fail with errors about missing modules, add mocks in `jest.setup.js`:

```javascript
jest.mock('module-name', () => ({
  // mock implementation
}));
```

### Timeout Errors

Increase timeout for specific tests:

```javascript
it('should handle long operation', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Snapshot Mismatches

Update snapshots after intentional changes:

```bash
npm test -- -u
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
