/**
 * Tests for EmptyState component
 * Tests empty state displays when no data and empty state actions
 * Requirements: 5.2
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmptyState from '../../components/molecules/EmptyState/EmptyState';
import { emptyStateVariants, getEmptyStateVariant } from '../../components/molecules/EmptyState/emptyStateVariants';

describe('EmptyState Component', () => {
  describe('Rendering', () => {
    it('should render with required props', () => {
      const { getByText } = render(
        <EmptyState title="No Data" testID="empty-state" />
      );
      
      expect(getByText('No Data')).toBeTruthy();
    });

    it('should render title and message', () => {
      const { getByText } = render(
        <EmptyState
          title="No Matches"
          message="Start creating matches to see them here"
          testID="empty-with-message"
        />
      );
      
      expect(getByText('No Matches')).toBeTruthy();
      expect(getByText('Start creating matches to see them here')).toBeTruthy();
    });

    it('should render with icon', () => {
      const TestIcon = () => <></>;
      const { getByTestId } = render(
        <EmptyState
          title="No Data"
          icon={<TestIcon />}
          testID="empty-with-icon"
        />
      );
      
      expect(getByTestId('empty-with-icon')).toBeTruthy();
    });

    it('should render with image', () => {
      const { getByTestId } = render(
        <EmptyState
          title="No Data"
          image={{ uri: 'https://example.com/image.png' }}
          testID="empty-with-image"
        />
      );
      
      expect(getByTestId('empty-with-image')).toBeTruthy();
    });

    it('should render with primary action button', () => {
      const { getByText } = render(
        <EmptyState
          title="No Matches"
          actionLabel="Create Match"
          onAction={() => {}}
          testID="empty-with-action"
        />
      );
      
      expect(getByText('Create Match')).toBeTruthy();
    });

    it('should render with both primary and secondary actions', () => {
      const { getByText } = render(
        <EmptyState
          title="No Clubs"
          actionLabel="Create Club"
          onAction={() => {}}
          secondaryActionLabel="Browse Clubs"
          onSecondaryAction={() => {}}
          testID="empty-with-both-actions"
        />
      );
      
      expect(getByText('Create Club')).toBeTruthy();
      expect(getByText('Browse Clubs')).toBeTruthy();
    });

    it('should not render action button without onAction handler', () => {
      const { queryByText } = render(
        <EmptyState
          title="No Data"
          actionLabel="Create"
          testID="empty-no-handler"
        />
      );
      
      expect(queryByText('Create')).toBeNull();
    });

    it('should render with testID on title', () => {
      const { getByTestId } = render(
        <EmptyState
          title="No Data"
          testID="empty-state"
        />
      );
      
      expect(getByTestId('empty-state-title')).toBeTruthy();
    });

    it('should render with testID on message', () => {
      const { getByTestId } = render(
        <EmptyState
          title="No Data"
          message="No content available"
          testID="empty-state"
        />
      );
      
      expect(getByTestId('empty-state-message')).toBeTruthy();
    });

    it('should render with testID on action button', () => {
      const { getByTestId } = render(
        <EmptyState
          title="No Data"
          actionLabel="Create"
          onAction={() => {}}
          testID="empty-state"
        />
      );
      
      expect(getByTestId('empty-state-action')).toBeTruthy();
    });

    it('should render with testID on secondary action button', () => {
      const { getByTestId } = render(
        <EmptyState
          title="No Data"
          secondaryActionLabel="Browse"
          onSecondaryAction={() => {}}
          testID="empty-state"
        />
      );
      
      expect(getByTestId('empty-state-secondary-action')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility role', () => {
      const { getByLabelText } = render(
        <EmptyState
          title="No Matches"
          message="Create matches to see them here"
        />
      );
      
      const emptyState = getByLabelText('No Matches. Create matches to see them here');
      expect(emptyState).toBeTruthy();
      expect(emptyState.props.accessibilityRole).toBe('text');
    });

    it('should have accessible property set to true', () => {
      const { getByTestId } = render(
        <EmptyState
          title="No Data"
          testID="accessible-empty"
        />
      );
      
      const emptyState = getByTestId('accessible-empty');
      expect(emptyState.props.accessible).toBe(true);
    });

    it('should have accessibility label combining title and message', () => {
      const { getByLabelText } = render(
        <EmptyState
          title="No Tournaments"
          message="Join or create tournaments"
        />
      );
      
      expect(getByLabelText('No Tournaments. Join or create tournaments')).toBeTruthy();
    });
  });

  describe('Actions', () => {
    it('should call onAction when primary button is pressed', () => {
      const mockAction = jest.fn();
      const { getByText } = render(
        <EmptyState
          title="No Matches"
          actionLabel="Create Match"
          onAction={mockAction}
        />
      );
      
      const button = getByText('Create Match');
      fireEvent.press(button);
      
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should call onSecondaryAction when secondary button is pressed', () => {
      const mockSecondaryAction = jest.fn();
      const { getByText } = render(
        <EmptyState
          title="No Clubs"
          secondaryActionLabel="Browse Clubs"
          onSecondaryAction={mockSecondaryAction}
        />
      );
      
      const button = getByText('Browse Clubs');
      fireEvent.press(button);
      
      expect(mockSecondaryAction).toHaveBeenCalledTimes(1);
    });

    it('should call both actions independently', () => {
      const mockPrimaryAction = jest.fn();
      const mockSecondaryAction = jest.fn();
      
      const { getByText } = render(
        <EmptyState
          title="No Clubs"
          actionLabel="Create Club"
          onAction={mockPrimaryAction}
          secondaryActionLabel="Browse Clubs"
          onSecondaryAction={mockSecondaryAction}
        />
      );
      
      fireEvent.press(getByText('Create Club'));
      expect(mockPrimaryAction).toHaveBeenCalledTimes(1);
      expect(mockSecondaryAction).not.toHaveBeenCalled();
      
      fireEvent.press(getByText('Browse Clubs'));
      expect(mockSecondaryAction).toHaveBeenCalledTimes(1);
      expect(mockPrimaryAction).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple presses on action button', () => {
      const mockAction = jest.fn();
      const { getByText } = render(
        <EmptyState
          title="No Data"
          actionLabel="Create"
          onAction={mockAction}
        />
      );
      
      const button = getByText('Create');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      
      expect(mockAction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Variants', () => {
    it('should render matches variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Matches"
          variant="matches"
          testID="matches-empty"
        />
      );
      
      expect(getByText('No Matches')).toBeTruthy();
    });

    it('should render tournaments variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Tournaments"
          variant="tournaments"
          testID="tournaments-empty"
        />
      );
      
      expect(getByText('No Tournaments')).toBeTruthy();
    });

    it('should render clubs variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Clubs"
          variant="clubs"
          testID="clubs-empty"
        />
      );
      
      expect(getByText('No Clubs')).toBeTruthy();
    });

    it('should render communities variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Communities"
          variant="communities"
          testID="communities-empty"
        />
      );
      
      expect(getByText('No Communities')).toBeTruthy();
    });

    it('should render search variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Results"
          variant="search"
          testID="search-empty"
        />
      );
      
      expect(getByText('No Results')).toBeTruthy();
    });

    it('should render profile variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Posts"
          variant="profile"
          testID="profile-empty"
        />
      );
      
      expect(getByText('No Posts')).toBeTruthy();
    });

    it('should render followers variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Followers"
          variant="followers"
          testID="followers-empty"
        />
      );
      
      expect(getByText('No Followers')).toBeTruthy();
    });

    it('should render posts variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Posts"
          variant="posts"
          testID="posts-empty"
        />
      );
      
      expect(getByText('No Posts')).toBeTruthy();
    });

    it('should render default variant', () => {
      const { getByText } = render(
        <EmptyState
          title="No Data"
          variant="default"
          testID="default-empty"
        />
      );
      
      expect(getByText('No Data')).toBeTruthy();
    });
  });

  describe('Empty State Variants Helper', () => {
    it('should return matches variant configuration', () => {
      const variant = getEmptyStateVariant('matches');
      
      expect(variant.title).toBe('No Matches Yet');
      expect(variant.message).toContain('Start creating matches');
      expect(variant.actionLabel).toBe('Create Match');
      expect(variant.variant).toBe('matches');
    });

    it('should return tournaments variant configuration', () => {
      const variant = getEmptyStateVariant('tournaments');
      
      expect(variant.title).toBe('No Tournaments Found');
      expect(variant.message).toContain('Create or join tournaments');
      expect(variant.actionLabel).toBe('Create Tournament');
      expect(variant.variant).toBe('tournaments');
    });

    it('should return clubs variant configuration', () => {
      const variant = getEmptyStateVariant('clubs');
      
      expect(variant.title).toBe('No Clubs Available');
      expect(variant.actionLabel).toBe('Create Club');
      expect(variant.secondaryActionLabel).toBe('Browse Clubs');
      expect(variant.variant).toBe('clubs');
    });

    it('should return communities variant configuration', () => {
      const variant = getEmptyStateVariant('communities');
      
      expect(variant.title).toBe('No Communities Yet');
      expect(variant.actionLabel).toBe('Explore Communities');
      expect(variant.variant).toBe('communities');
    });

    it('should return searchNoResults variant configuration', () => {
      const variant = getEmptyStateVariant('searchNoResults');
      
      expect(variant.title).toBe('No Results Found');
      expect(variant.message).toContain('Try adjusting your search');
      expect(variant.actionLabel).toBe('Clear Filters');
      expect(variant.variant).toBe('search');
    });

    it('should return searchSuggestions variant configuration', () => {
      const variant = getEmptyStateVariant('searchSuggestions');
      
      expect(variant.title).toBe('No Results Found');
      expect(variant.secondaryActionLabel).toBe('Browse Popular');
      expect(variant.variant).toBe('search');
    });

    it('should return profilePosts variant configuration', () => {
      const variant = getEmptyStateVariant('profilePosts');
      
      expect(variant.title).toBe('No Posts Yet');
      expect(variant.actionLabel).toBe('Create Post');
      expect(variant.variant).toBe('profile');
    });

    it('should return profileMatches variant configuration', () => {
      const variant = getEmptyStateVariant('profileMatches');
      
      expect(variant.title).toBe('No Matches Played');
      expect(variant.variant).toBe('profile');
    });

    it('should return followers variant configuration', () => {
      const variant = getEmptyStateVariant('followers');
      
      expect(variant.title).toBe('No Followers Yet');
      expect(variant.variant).toBe('followers');
    });

    it('should return following variant configuration', () => {
      const variant = getEmptyStateVariant('following');
      
      expect(variant.title).toBe('Not Following Anyone');
      expect(variant.actionLabel).toBe('Discover People');
      expect(variant.variant).toBe('followers');
    });

    it('should return clubMembers variant configuration', () => {
      const variant = getEmptyStateVariant('clubMembers');
      
      expect(variant.title).toBe('No Members Yet');
      expect(variant.actionLabel).toBe('Invite Members');
      expect(variant.variant).toBe('clubs');
    });

    it('should return tournamentMatches variant configuration', () => {
      const variant = getEmptyStateVariant('tournamentMatches');
      
      expect(variant.title).toBe('No Matches Scheduled');
      expect(variant.variant).toBe('tournaments');
    });

    it('should return tournamentParticipants variant configuration', () => {
      const variant = getEmptyStateVariant('tournamentParticipants');
      
      expect(variant.title).toBe('No Participants Yet');
      expect(variant.actionLabel).toBe('Invite Teams');
      expect(variant.variant).toBe('tournaments');
    });

    it('should return communityThreads variant configuration', () => {
      const variant = getEmptyStateVariant('communityThreads');
      
      expect(variant.title).toBe('No Discussions Yet');
      expect(variant.actionLabel).toBe('Start Discussion');
      expect(variant.variant).toBe('communities');
    });

    it('should return comments variant configuration', () => {
      const variant = getEmptyStateVariant('comments');
      
      expect(variant.title).toBe('No Comments Yet');
      expect(variant.actionLabel).toBe('Add Comment');
      expect(variant.variant).toBe('communities');
    });

    it('should return default configuration for unknown variant', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const variant = getEmptyStateVariant('unknownVariant');
      
      expect(variant.title).toBe('No Data Available');
      expect(variant.message).toBe('There is no content to display at this time.');
      expect(variant.variant).toBe('default');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Empty state variant "unknownVariant" not found. Using default.'
      );
      
      consoleWarnSpy.mockRestore();
    });

    it('should apply overrides to variant configuration', () => {
      const variant = getEmptyStateVariant('matches', {
        title: 'Custom Title',
        message: 'Custom Message',
      });
      
      expect(variant.title).toBe('Custom Title');
      expect(variant.message).toBe('Custom Message');
      expect(variant.actionLabel).toBe('Create Match');
      expect(variant.variant).toBe('matches');
    });

    it('should apply overrides to default variant', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const variant = getEmptyStateVariant('unknownVariant', {
        title: 'Override Title',
      });
      
      expect(variant.title).toBe('Override Title');
      expect(variant.message).toBe('There is no content to display at this time.');
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Integration with Variants', () => {
    it('should render matches empty state with variant config', () => {
      const config = getEmptyStateVariant('matches');
      const mockAction = jest.fn();
      
      const { getByText } = render(
        <EmptyState
          {...config}
          onAction={mockAction}
          testID="matches-integrated"
        />
      );
      
      expect(getByText('No Matches Yet')).toBeTruthy();
      expect(getByText('Start creating matches to see them here. Track scores and follow your favorite teams.')).toBeTruthy();
      
      fireEvent.press(getByText('Create Match'));
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should render clubs empty state with both actions', () => {
      const config = getEmptyStateVariant('clubs');
      const mockPrimaryAction = jest.fn();
      const mockSecondaryAction = jest.fn();
      
      const { getByText } = render(
        <EmptyState
          {...config}
          onAction={mockPrimaryAction}
          onSecondaryAction={mockSecondaryAction}
          testID="clubs-integrated"
        />
      );
      
      expect(getByText('No Clubs Available')).toBeTruthy();
      
      fireEvent.press(getByText('Create Club'));
      expect(mockPrimaryAction).toHaveBeenCalledTimes(1);
      
      fireEvent.press(getByText('Browse Clubs'));
      expect(mockSecondaryAction).toHaveBeenCalledTimes(1);
    });

    it('should render search empty state with custom overrides', () => {
      const config = getEmptyStateVariant('searchNoResults', {
        message: 'Try different keywords',
      });
      
      const { getByText } = render(
        <EmptyState
          {...config}
          testID="search-custom"
        />
      );
      
      expect(getByText('No Results Found')).toBeTruthy();
      expect(getByText('Try different keywords')).toBeTruthy();
    });
  });

  describe('Display When No Data', () => {
    it('should display empty state when data array is empty', () => {
      const data = [];
      const { getByText } = render(
        data.length === 0 ? (
          <EmptyState
            title="No Items"
            message="Add items to see them here"
            testID="no-data-empty"
          />
        ) : null
      );
      
      expect(getByText('No Items')).toBeTruthy();
    });

    it('should not display empty state when data exists', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const TestComponent = () => {
        return data.length === 0 ? (
          <EmptyState
            title="No Items"
            testID="has-data-empty"
          />
        ) : <></>;
      };
      
      const { queryByText } = render(<TestComponent />);
      
      expect(queryByText('No Items')).toBeNull();
    });

    it('should display empty state for null data', () => {
      const data = null;
      const { getByText } = render(
        !data || data.length === 0 ? (
          <EmptyState
            title="No Data Available"
            testID="null-data-empty"
          />
        ) : null
      );
      
      expect(getByText('No Data Available')).toBeTruthy();
    });

    it('should display empty state for undefined data', () => {
      const data = undefined;
      const { getByText } = render(
        !data || data.length === 0 ? (
          <EmptyState
            title="No Data Available"
            testID="undefined-data-empty"
          />
        ) : null
      );
      
      expect(getByText('No Data Available')).toBeTruthy();
    });
  });
});
