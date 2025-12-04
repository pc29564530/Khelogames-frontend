/**
 * Tests for loading state components
 * Tests skeleton screen rendering and loading state transitions
 * Requirements: 5.2
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Skeleton from '../../components/atoms/Skeleton/Skeleton';
import Spinner from '../../components/atoms/Spinner/Spinner';
import ProgressBar from '../../components/atoms/ProgressBar/ProgressBar';
import MatchListSkeleton from '../../components/molecules/MatchListSkeleton/MatchListSkeleton';
import PlayerListSkeleton from '../../components/molecules/PlayerListSkeleton/PlayerListSkeleton';
import TournamentListSkeleton from '../../components/molecules/TournamentListSkeleton/TournamentListSkeleton';

describe('Loading State Components', () => {
  describe('Skeleton Component', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(<Skeleton testID="skeleton" />);
      const skeleton = getByTestId('skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should render rect variant correctly', () => {
      const { getByTestId } = render(
        <Skeleton testID="skeleton-rect" variant="rect" width={100} height={50} />
      );
      const skeleton = getByTestId('skeleton-rect');
      expect(skeleton).toBeTruthy();
    });

    it('should render circle variant correctly', () => {
      const { getByTestId } = render(
        <Skeleton testID="skeleton-circle" variant="circle" width={50} height={50} />
      );
      const skeleton = getByTestId('skeleton-circle');
      expect(skeleton).toBeTruthy();
    });

    it('should render text variant correctly', () => {
      const { getByTestId } = render(
        <Skeleton testID="skeleton-text" variant="text" width={200} height={16} />
      );
      const skeleton = getByTestId('skeleton-text');
      expect(skeleton).toBeTruthy();
    });

    it('should have accessibility properties', () => {
      const { getByLabelText } = render(<Skeleton />);
      const skeleton = getByLabelText('Loading content');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.accessibilityRole).toBe('progressbar');
    });

    it('should accept custom width and height', () => {
      const { getByTestId } = render(
        <Skeleton testID="custom-skeleton" width={300} height={100} />
      );
      const skeleton = getByTestId('custom-skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should accept string width values', () => {
      const { getByTestId } = render(
        <Skeleton testID="string-width" width="80%" height={20} />
      );
      const skeleton = getByTestId('string-width');
      expect(skeleton).toBeTruthy();
    });
  });

  describe('Spinner Component', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(<Spinner testID="spinner" />);
      const spinner = getByTestId('spinner');
      expect(spinner).toBeTruthy();
    });

    it('should render with xs size', () => {
      const { getByTestId } = render(<Spinner testID="spinner-xs" size="xs" />);
      const spinner = getByTestId('spinner-xs');
      expect(spinner).toBeTruthy();
    });

    it('should render with sm size', () => {
      const { getByTestId } = render(<Spinner testID="spinner-sm" size="sm" />);
      const spinner = getByTestId('spinner-sm');
      expect(spinner).toBeTruthy();
    });

    it('should render with md size', () => {
      const { getByTestId } = render(<Spinner testID="spinner-md" size="md" />);
      const spinner = getByTestId('spinner-md');
      expect(spinner).toBeTruthy();
    });

    it('should render with lg size', () => {
      const { getByTestId } = render(<Spinner testID="spinner-lg" size="lg" />);
      const spinner = getByTestId('spinner-lg');
      expect(spinner).toBeTruthy();
    });

    it('should render with xl size', () => {
      const { getByTestId } = render(<Spinner testID="spinner-xl" size="xl" />);
      const spinner = getByTestId('spinner-xl');
      expect(spinner).toBeTruthy();
    });

    it('should render with custom numeric size', () => {
      const { getByTestId } = render(<Spinner testID="spinner-custom" size={50} />);
      const spinner = getByTestId('spinner-custom');
      expect(spinner).toBeTruthy();
    });

    it('should have accessibility properties', () => {
      const { getByLabelText } = render(<Spinner />);
      const spinner = getByLabelText('Loading');
      expect(spinner).toBeTruthy();
      expect(spinner.props.accessibilityRole).toBe('progressbar');
    });

    it('should accept custom accessibility label', () => {
      const { getByLabelText } = render(
        <Spinner accessibilityLabel="Loading matches" />
      );
      const spinner = getByLabelText('Loading matches');
      expect(spinner).toBeTruthy();
    });

    it('should accept custom color', () => {
      const { getByTestId } = render(
        <Spinner testID="colored-spinner" color="#FF0000" />
      );
      const spinner = getByTestId('colored-spinner');
      expect(spinner).toBeTruthy();
    });
  });

  describe('ProgressBar Component', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(<ProgressBar testID="progress" />);
      const progressBar = getByTestId('progress');
      expect(progressBar).toBeTruthy();
    });

    it('should render with determinate progress', () => {
      const { getByTestId } = render(
        <ProgressBar testID="progress-50" progress={0.5} />
      );
      const progressBar = getByTestId('progress-50');
      expect(progressBar).toBeTruthy();
    });

    it('should render with indeterminate progress', () => {
      const { getByTestId } = render(
        <ProgressBar testID="progress-indeterminate" indeterminate={true} />
      );
      const progressBar = getByTestId('progress-indeterminate');
      expect(progressBar).toBeTruthy();
    });

    it('should have accessibility properties with progress value', () => {
      const { getByLabelText } = render(<ProgressBar progress={0.75} />);
      const progressBar = getByLabelText('Progress 75%');
      expect(progressBar).toBeTruthy();
      expect(progressBar.props.accessibilityRole).toBe('progressbar');
    });

    it('should accept custom height', () => {
      const { getByTestId } = render(
        <ProgressBar testID="thick-progress" height={8} />
      );
      const progressBar = getByTestId('thick-progress');
      expect(progressBar).toBeTruthy();
    });

    it('should accept custom colors', () => {
      const { getByTestId } = render(
        <ProgressBar
          testID="colored-progress"
          color="#00FF00"
          backgroundColor="#CCCCCC"
        />
      );
      const progressBar = getByTestId('colored-progress');
      expect(progressBar).toBeTruthy();
    });

    it('should accept custom accessibility label', () => {
      const { getByLabelText } = render(
        <ProgressBar accessibilityLabel="Upload progress" progress={0.3} />
      );
      const progressBar = getByLabelText('Upload progress');
      expect(progressBar).toBeTruthy();
    });

    it('should handle progress value of 0', () => {
      const { getByTestId } = render(
        <ProgressBar testID="progress-0" progress={0} />
      );
      const progressBar = getByTestId('progress-0');
      expect(progressBar).toBeTruthy();
    });

    it('should handle progress value of 1', () => {
      const { getByTestId } = render(
        <ProgressBar testID="progress-100" progress={1} />
      );
      const progressBar = getByTestId('progress-100');
      expect(progressBar).toBeTruthy();
    });
  });

  describe('MatchListSkeleton Component', () => {
    it('should render with default count', () => {
      const { getByTestId } = render(<MatchListSkeleton testID="match-skeleton" />);
      const skeleton = getByTestId('match-skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should render specified number of skeleton items', () => {
      const { getByTestId } = render(
        <MatchListSkeleton testID="match-skeleton-5" count={5} />
      );
      const skeleton = getByTestId('match-skeleton-5');
      expect(skeleton).toBeTruthy();
      // The skeleton should contain 5 match cards
      expect(skeleton.props.children).toHaveLength(5);
    });

    it('should render single skeleton item', () => {
      const { getByTestId } = render(
        <MatchListSkeleton testID="match-skeleton-1" count={1} />
      );
      const skeleton = getByTestId('match-skeleton-1');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.children).toHaveLength(1);
    });

    it('should render with custom count', () => {
      const { getByTestId } = render(
        <MatchListSkeleton testID="match-skeleton-custom" count={7} />
      );
      const skeleton = getByTestId('match-skeleton-custom');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.children).toHaveLength(7);
    });
  });

  describe('PlayerListSkeleton Component', () => {
    it('should render with default count', () => {
      const { getByTestId } = render(<PlayerListSkeleton testID="player-skeleton" />);
      const skeleton = getByTestId('player-skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should render specified number of skeleton items', () => {
      const { getByTestId } = render(
        <PlayerListSkeleton testID="player-skeleton-10" count={10} />
      );
      const skeleton = getByTestId('player-skeleton-10');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.children).toHaveLength(10);
    });

    it('should render single skeleton item', () => {
      const { getByTestId } = render(
        <PlayerListSkeleton testID="player-skeleton-1" count={1} />
      );
      const skeleton = getByTestId('player-skeleton-1');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.children).toHaveLength(1);
    });

    it('should render with custom count', () => {
      const { getByTestId } = render(
        <PlayerListSkeleton testID="player-skeleton-custom" count={8} />
      );
      const skeleton = getByTestId('player-skeleton-custom');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.children).toHaveLength(8);
    });
  });

  describe('TournamentListSkeleton Component', () => {
    it('should render with default count', () => {
      const { getByTestId } = render(
        <TournamentListSkeleton testID="tournament-skeleton" />
      );
      const skeleton = getByTestId('tournament-skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('should render specified number of skeleton items', () => {
      const { getByTestId } = render(
        <TournamentListSkeleton testID="tournament-skeleton-4" count={4} />
      );
      const skeleton = getByTestId('tournament-skeleton-4');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.children).toHaveLength(4);
    });

    it('should render single skeleton item', () => {
      const { getByTestId } = render(
        <TournamentListSkeleton testID="tournament-skeleton-1" count={1} />
      );
      const skeleton = getByTestId('tournament-skeleton-1');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.children).toHaveLength(1);
    });

    it('should render with custom count', () => {
      const { getByTestId } = render(
        <TournamentListSkeleton testID="tournament-skeleton-custom" count={6} />
      );
      const skeleton = getByTestId('tournament-skeleton-custom');
      expect(skeleton).toBeTruthy();
      expect(skeleton.props.children).toHaveLength(6);
    });
  });

  describe('Loading State Transitions', () => {
    it('should transition from loading to loaded state', async () => {
      const LoadingComponent = ({ isLoading }) => {
        return isLoading ? (
          <Spinner testID="loading-spinner" />
        ) : (
          <Skeleton testID="loaded-content" />
        );
      };

      const { getByTestId, rerender } = render(<LoadingComponent isLoading={true} />);
      
      // Initially should show spinner
      expect(getByTestId('loading-spinner')).toBeTruthy();

      // Transition to loaded state
      rerender(<LoadingComponent isLoading={false} />);
      
      await waitFor(() => {
        expect(getByTestId('loaded-content')).toBeTruthy();
      });
    });

    it('should show skeleton during initial load', () => {
      const { getByTestId } = render(<MatchListSkeleton testID="initial-load" />);
      expect(getByTestId('initial-load')).toBeTruthy();
    });

    it('should show spinner during action', () => {
      const { getByTestId } = render(<Spinner testID="action-spinner" />);
      expect(getByTestId('action-spinner')).toBeTruthy();
    });

    it('should show progress bar during upload', () => {
      const { getByTestId } = render(
        <ProgressBar testID="upload-progress" progress={0.5} />
      );
      expect(getByTestId('upload-progress')).toBeTruthy();
    });

    it('should handle multiple loading states simultaneously', () => {
      const MultiLoadingComponent = () => (
        <>
          <Spinner testID="spinner-1" />
          <Skeleton testID="skeleton-1" />
          <ProgressBar testID="progress-1" progress={0.3} />
        </>
      );

      const { getByTestId } = render(<MultiLoadingComponent />);
      
      expect(getByTestId('spinner-1')).toBeTruthy();
      expect(getByTestId('skeleton-1')).toBeTruthy();
      expect(getByTestId('progress-1')).toBeTruthy();
    });

    it('should transition progress bar from 0 to 100', async () => {
      const ProgressComponent = ({ progress }) => (
        <ProgressBar testID="progress-transition" progress={progress} />
      );

      const { getByTestId, rerender } = render(
        <ProgressComponent progress={0} />
      );
      
      expect(getByTestId('progress-transition')).toBeTruthy();

      // Update progress
      rerender(<ProgressComponent progress={0.5} />);
      await waitFor(() => {
        expect(getByTestId('progress-transition')).toBeTruthy();
      });

      // Complete progress
      rerender(<ProgressComponent progress={1} />);
      await waitFor(() => {
        expect(getByTestId('progress-transition')).toBeTruthy();
      });
    });

    it('should handle rapid loading state changes', async () => {
      const RapidLoadingComponent = ({ state }) => {
        switch (state) {
          case 'loading':
            return <Spinner testID="rapid-spinner" />;
          case 'skeleton':
            return <Skeleton testID="rapid-skeleton" />;
          case 'loaded':
            return <Skeleton testID="rapid-loaded" />;
          default:
            return null;
        }
      };

      const { getByTestId, rerender } = render(
        <RapidLoadingComponent state="loading" />
      );
      
      expect(getByTestId('rapid-spinner')).toBeTruthy();

      rerender(<RapidLoadingComponent state="skeleton" />);
      await waitFor(() => {
        expect(getByTestId('rapid-skeleton')).toBeTruthy();
      });

      rerender(<RapidLoadingComponent state="loaded" />);
      await waitFor(() => {
        expect(getByTestId('rapid-loaded')).toBeTruthy();
      });
    });
  });
});
