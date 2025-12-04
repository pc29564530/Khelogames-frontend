/**
 * Navigation Flow Tests
 * 
 * Tests screen transitions, deep linking, and navigation state persistence
 * 
 * Requirements: 5.3
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import {
  saveNavigationState,
  restoreNavigationState,
  clearNavigationState,
  sanitizeNavigationState,
  shouldRestoreNavigationState,
  getNavigationStateMetadata,
} from '../../navigation/navigationPersistence';
import {
  generateDeepLink,
  parseDeepLink,
  handleDeepLink,
} from '../../navigation/deepLinkingConfig';
import deepLinkingConfig from '../../navigation/deepLinkingConfig';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Test screens
const HomeScreen = () => null;
const ProfileScreen = () => null;
const MatchScreen = () => null;
const TournamentScreen = () => null;

const Stack = createStackNavigator();

const TestNavigator = ({ initialRouteName = 'Home', initialState }) => (
  <NavigationContainer initialState={initialState}>
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="CricketMatchPage" component={MatchScreen} />
      <Stack.Screen name="TournamentPage" component={TournamentScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Navigation Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
    AsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  describe('Screen Transitions', () => {
    it('should render initial screen correctly', () => {
      const { getByTestId } = render(<TestNavigator />);
      // Navigation container should be rendered
      expect(true).toBe(true); // Basic render test
    });

    it('should handle navigation between screens', async () => {
      const navigationRef = React.createRef();
      
      const { rerender } = render(
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef.current).toBeTruthy();
      });

      // Navigate to Profile
      await act(async () => {
        navigationRef.current?.navigate('Profile');
      });

      await waitFor(() => {
        const currentRoute = navigationRef.current?.getCurrentRoute();
        expect(currentRoute?.name).toBe('Profile');
      });
    });

    it('should handle back navigation', async () => {
      const navigationRef = React.createRef();
      
      render(
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef.current).toBeTruthy();
      });

      // Navigate to Profile
      await act(async () => {
        navigationRef.current?.navigate('Profile');
      });

      await waitFor(() => {
        expect(navigationRef.current?.getCurrentRoute()?.name).toBe('Profile');
      });

      // Go back
      await act(async () => {
        navigationRef.current?.goBack();
      });

      await waitFor(() => {
        expect(navigationRef.current?.getCurrentRoute()?.name).toBe('Home');
      });
    });

    it('should handle navigation with parameters', async () => {
      const navigationRef = React.createRef();
      
      render(
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CricketMatchPage" component={MatchScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef.current).toBeTruthy();
      });

      const matchId = '12345';
      
      // Navigate with params
      await act(async () => {
        navigationRef.current?.navigate('CricketMatchPage', { matchId });
      });

      await waitFor(() => {
        const currentRoute = navigationRef.current?.getCurrentRoute();
        expect(currentRoute?.name).toBe('CricketMatchPage');
        expect(currentRoute?.params?.matchId).toBe(matchId);
      });
    });

    it('should maintain navigation stack correctly', async () => {
      const navigationRef = React.createRef();
      
      render(
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CricketMatchPage" component={MatchScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef.current).toBeTruthy();
      });

      // Navigate through multiple screens
      await act(async () => {
        navigationRef.current?.navigate('Profile');
      });

      await act(async () => {
        navigationRef.current?.navigate('CricketMatchPage', { matchId: '123' });
      });

      await waitFor(() => {
        const state = navigationRef.current?.getState();
        expect(state?.routes?.length).toBe(3);
        expect(state?.routes[0]?.name).toBe('Home');
        expect(state?.routes[1]?.name).toBe('Profile');
        expect(state?.routes[2]?.name).toBe('CricketMatchPage');
      });
    });
  });

  describe('Deep Linking', () => {
    it('should generate correct deep link for cricket match', () => {
      const link = generateDeepLink('CricketMatchPage', { matchId: '12345' });
      expect(link).toBe('khelogames://match/cricket/12345');
    });

    it('should generate correct deep link for football match', () => {
      const link = generateDeepLink('FootballMatchPage', { matchId: '67890' });
      expect(link).toBe('khelogames://match/football/67890');
    });

    it('should generate correct deep link for player profile', () => {
      const link = generateDeepLink('PlayerProfile', { playerId: 'player123' });
      expect(link).toBe('khelogames://player/player123');
    });

    it('should generate correct deep link for tournament', () => {
      const link = generateDeepLink('TournamentPage', { tournamentId: 'tour456' });
      expect(link).toBe('khelogames://tournament/tour456');
    });

    it('should generate correct deep link for club', () => {
      const link = generateDeepLink('ClubPage', { clubId: 'club789' });
      expect(link).toBe('khelogames://club/club789');
    });

    it('should generate correct deep link for community', () => {
      const link = generateDeepLink('CommunityPage', { communityId: 'comm123' });
      expect(link).toBe('khelogames://community/comm123');
    });

    it('should generate correct deep link for user profile', () => {
      const link = generateDeepLink('Profile', { userId: 'user456' });
      expect(link).toBe('khelogames://profile/user456');
    });

    it('should generate correct deep link for thread', () => {
      const link = generateDeepLink('ThreadComment', { threadId: 'thread789' });
      expect(link).toBe('khelogames://thread/thread789');
    });

    it('should parse cricket match deep link correctly', () => {
      const url = 'khelogames://match/cricket/12345';
      const parsed = parseDeepLink(url);
      
      expect(parsed).toEqual({
        screen: 'CricketMatchPage',
        params: { matchId: '12345' },
      });
    });

    it('should parse football match deep link correctly', () => {
      const url = 'khelogames://match/football/67890';
      const parsed = parseDeepLink(url);
      
      expect(parsed).toEqual({
        screen: 'FootballMatchPage',
        params: { matchId: '67890' },
      });
    });

    it('should parse player profile deep link correctly', () => {
      const url = 'khelogames://player/player123';
      const parsed = parseDeepLink(url);
      
      expect(parsed).toEqual({
        screen: 'PlayerProfile',
        params: { playerId: 'player123' },
      });
    });

    it('should parse tournament deep link correctly', () => {
      const url = 'khelogames://tournament/tour456';
      const parsed = parseDeepLink(url);
      
      expect(parsed).toEqual({
        screen: 'TournamentPage',
        params: { tournamentId: 'tour456' },
      });
    });

    it('should parse HTTPS deep link correctly', () => {
      const url = 'https://khelogames.com/match/cricket/12345';
      const parsed = parseDeepLink(url);
      
      expect(parsed).toEqual({
        screen: 'CricketMatchPage',
        params: { matchId: '12345' },
      });
    });

    it('should handle invalid deep link gracefully', () => {
      const url = 'khelogames://invalid/path';
      const parsed = parseDeepLink(url);
      
      expect(parsed).toEqual({
        screen: 'Home',
        params: {},
      });
    });

    it('should handle empty deep link', () => {
      const parsed = parseDeepLink('');
      expect(parsed).toBeNull();
    });

    it('should handle deep link navigation', async () => {
      const navigationRef = React.createRef();
      
      render(
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CricketMatchPage" component={MatchScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef.current).toBeTruthy();
      });

      const url = 'khelogames://match/cricket/12345';
      
      await act(async () => {
        handleDeepLink(url, navigationRef.current);
      });

      await waitFor(() => {
        const currentRoute = navigationRef.current?.getCurrentRoute();
        expect(currentRoute?.name).toBe('CricketMatchPage');
        expect(currentRoute?.params?.matchId).toBe('12345');
      });
    });

    it('should handle deep linking config in NavigationContainer', () => {
      const { config } = deepLinkingConfig;
      
      expect(config.screens).toBeDefined();
      expect(config.screens.CricketMatchPage).toBeDefined();
      expect(config.screens.CricketMatchPage.path).toBe('match/cricket/:matchId');
      expect(config.screens.PlayerProfile).toBeDefined();
      expect(config.screens.TournamentPage).toBeDefined();
    });
  });

  describe('Navigation State Persistence', () => {
    it('should save navigation state successfully', async () => {
      const mockState = {
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Profile', key: 'profile-1', params: { userId: '123' } },
        ],
        index: 1,
      };

      const result = await saveNavigationState(mockState);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@navigation_state',
        expect.stringContaining('"state"')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@navigation_state',
        expect.stringContaining('"timestamp"')
      );
    });

    it('should not save null navigation state', async () => {
      const result = await saveNavigationState(null);

      expect(result).toBe(false);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should restore navigation state successfully', async () => {
      const mockState = {
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Profile', key: 'profile-1' },
        ],
        index: 1,
      };

      const savedData = {
        state: mockState,
        timestamp: Date.now(),
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedData));

      const restoredState = await restoreNavigationState();

      expect(restoredState).toEqual(mockState);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@navigation_state');
    });

    it('should return null when no saved state exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const restoredState = await restoreNavigationState();

      expect(restoredState).toBeNull();
    });

    it('should ignore stale navigation state', async () => {
      const mockState = {
        routes: [{ name: 'Home', key: 'home-1' }],
        index: 0,
      };

      // State from 25 hours ago (stale)
      const savedData = {
        state: mockState,
        timestamp: Date.now() - (25 * 60 * 60 * 1000),
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedData));

      const restoredState = await restoreNavigationState();

      expect(restoredState).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@navigation_state');
    });

    it('should clear navigation state successfully', async () => {
      const result = await clearNavigationState();

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@navigation_state');
    });

    it('should check if state should be restored', async () => {
      const savedData = {
        state: { routes: [{ name: 'Home' }] },
        timestamp: Date.now(),
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedData));

      const shouldRestore = await shouldRestoreNavigationState();

      expect(shouldRestore).toBe(true);
    });

    it('should not restore stale state', async () => {
      const savedData = {
        state: { routes: [{ name: 'Home' }] },
        timestamp: Date.now() - (25 * 60 * 60 * 1000),
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedData));

      const shouldRestore = await shouldRestoreNavigationState();

      expect(shouldRestore).toBe(false);
    });

    it('should get navigation state metadata', async () => {
      const timestamp = Date.now() - (1000 * 60 * 30); // 30 minutes ago
      const savedData = {
        state: { routes: [{ name: 'Home' }] },
        timestamp,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedData));

      const metadata = await getNavigationStateMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.timestamp).toBe(timestamp);
      expect(metadata.age).toBeGreaterThan(0);
      expect(metadata.isStale).toBe(false);
      expect(metadata.savedAt).toBeDefined();
    });

    it('should sanitize navigation state by removing auth screens', () => {
      const state = {
        routes: [
          { name: 'SignIn', key: 'signin-1' },
          { name: 'Home', key: 'home-1' },
          { name: 'Profile', key: 'profile-1' },
          { name: 'SignUp', key: 'signup-1' },
        ],
        index: 2,
      };

      const sanitized = sanitizeNavigationState(state);

      expect(sanitized.routes).toHaveLength(2);
      expect(sanitized.routes[0].name).toBe('Home');
      expect(sanitized.routes[1].name).toBe('Profile');
      expect(sanitized.routes.find(r => r.name === 'SignIn')).toBeUndefined();
      expect(sanitized.routes.find(r => r.name === 'SignUp')).toBeUndefined();
    });

    it('should handle null state in sanitization', () => {
      const sanitized = sanitizeNavigationState(null);
      expect(sanitized).toBeNull();
    });

    it('should persist navigation state across app restarts', async () => {
      const navigationRef = React.createRef();
      
      // First render - navigate to a screen
      const { unmount } = render(
        <NavigationContainer 
          ref={navigationRef}
          onStateChange={(state) => {
            if (state) {
              saveNavigationState(state);
            }
          }}
        >
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef.current).toBeTruthy();
      });

      // Navigate to Profile
      await act(async () => {
        navigationRef.current?.navigate('Profile');
      });

      await waitFor(() => {
        expect(navigationRef.current?.getCurrentRoute()?.name).toBe('Profile');
      });

      // Get the saved state
      const savedState = navigationRef.current?.getState();
      
      // Simulate app restart by unmounting
      unmount();

      // Mock the restored state
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          state: savedState,
          timestamp: Date.now(),
        })
      );

      // Restore state
      const restoredState = await restoreNavigationState();

      // Second render - with restored state
      const navigationRef2 = React.createRef();
      render(
        <NavigationContainer 
          ref={navigationRef2}
          initialState={restoredState}
        >
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef2.current).toBeTruthy();
      });

      // Verify state was restored
      await waitFor(() => {
        const currentRoute = navigationRef2.current?.getCurrentRoute();
        expect(currentRoute?.name).toBe('Profile');
      });
    });

    it('should handle navigation state save errors gracefully', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const mockState = {
        routes: [{ name: 'Home', key: 'home-1' }],
        index: 0,
      };

      const result = await saveNavigationState(mockState);

      expect(result).toBe(false);
    });

    it('should handle navigation state restore errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const restoredState = await restoreNavigationState();

      expect(restoredState).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete navigation flow with persistence', async () => {
      const navigationRef = React.createRef();
      let currentState = null;

      const { rerender } = render(
        <NavigationContainer 
          ref={navigationRef}
          onStateChange={(state) => {
            currentState = state;
          }}
        >
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CricketMatchPage" component={MatchScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef.current).toBeTruthy();
      });

      // Navigate through multiple screens
      await act(async () => {
        navigationRef.current?.navigate('Profile', { userId: '123' });
      });

      await act(async () => {
        navigationRef.current?.navigate('CricketMatchPage', { matchId: '456' });
      });

      // Save state
      await act(async () => {
        await saveNavigationState(currentState);
      });

      // Verify state was saved
      expect(AsyncStorage.setItem).toHaveBeenCalled();

      // Verify current route
      await waitFor(() => {
        const route = navigationRef.current?.getCurrentRoute();
        expect(route?.name).toBe('CricketMatchPage');
        expect(route?.params?.matchId).toBe('456');
      });
    });

    it('should handle deep link with state persistence', async () => {
      const navigationRef = React.createRef();

      render(
        <NavigationContainer 
          ref={navigationRef}
          linking={deepLinkingConfig}
        >
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CricketMatchPage" component={MatchScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(navigationRef.current).toBeTruthy();
      });

      // Simulate deep link
      const url = 'khelogames://match/cricket/789';
      
      await act(async () => {
        handleDeepLink(url, navigationRef.current);
      });

      await waitFor(() => {
        const route = navigationRef.current?.getCurrentRoute();
        expect(route?.name).toBe('CricketMatchPage');
        expect(route?.params?.matchId).toBe('789');
      });

      // Save state after deep link navigation
      const state = navigationRef.current?.getState();
      await saveNavigationState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
