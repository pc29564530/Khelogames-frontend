import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

/**
 * Custom render function that wraps components with Redux Provider and Navigation Container
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.initialState - Initial Redux state
 * @param {Object} options.store - Custom store instance
 * @param {Object} options.navigationProps - Navigation props to pass
 * @param {Object} options.renderOptions - Additional render options
 * @returns {Object} Render result with store
 */
export function renderWithProviders(
  ui,
  {
    initialState = {},
    store = mockStore(initialState),
    navigationProps = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <NavigationContainer {...navigationProps}>
          {children}
        </NavigationContainer>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Custom render function with only Redux Provider (no navigation)
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.initialState - Initial Redux state
 * @param {Object} options.store - Custom store instance
 * @param {Object} options.renderOptions - Additional render options
 * @returns {Object} Render result with store
 */
export function renderWithRedux(
  ui,
  {
    initialState = {},
    store = mockStore(initialState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Custom render function with only Navigation Container (no Redux)
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.navigationProps - Navigation props to pass
 * @param {Object} options.renderOptions - Additional render options
 * @returns {Object} Render result
 */
export function renderWithNavigation(
  ui,
  {
    navigationProps = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <NavigationContainer {...navigationProps}>
        {children}
      </NavigationContainer>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for a condition to be true
 * @param {Function} callback - Function that returns true when condition is met
 * @param {Object} options - Wait options
 * @param {number} options.timeout - Maximum time to wait in ms
 * @param {number} options.interval - Check interval in ms
 * @returns {Promise<void>}
 */
export async function waitForCondition(
  callback,
  { timeout = 3000, interval = 50 } = {}
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (callback()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for condition');
}

// Re-export everything from React Testing Library
export * from '@testing-library/react-native';
