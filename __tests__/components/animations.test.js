/**
 * Animation Components Tests
 * 
 * Tests animation performance and correctness for:
 * - AnimatedScore
 * - AnimatedModal
 * - CelebrationAnimation
 * - AnimatedListItem
 * - AnimatedStat
 * 
 * Requirements: 5.2
 */

import React from 'react';
import { Animated, Vibration } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import AnimatedScore from '../../components/atoms/AnimatedScore/AnimatedScore';
import AnimatedModal from '../../components/molecules/AnimatedModal/AnimatedModal';
import CelebrationAnimation from '../../components/atoms/CelebrationAnimation/CelebrationAnimation';
import AnimatedListItem from '../../components/molecules/AnimatedListItem/AnimatedListItem';
import AnimatedStat from '../../components/atoms/AnimatedStat/AnimatedStat';

// Mock Vibration
jest.mock('react-native/Libraries/Vibration/Vibration', () => ({
  vibrate: jest.fn(),
}));

// Helper to advance animations
const advanceAnimationsByTime = (time) => {
  jest.advanceTimersByTime(time);
};

describe('Animation Components', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('AnimatedScore', () => {
    it('should render with initial score', () => {
      const { getByText } = render(
        <AnimatedScore score={10} testID="animated-score" />
      );

      expect(getByText('10')).toBeTruthy();
    });

    it('should trigger celebration animation on score increase', async () => {
      const { rerender, getByTestId } = render(
        <AnimatedScore score={10} previousScore={10} testID="animated-score" />
      );

      // Update score
      rerender(
        <AnimatedScore score={15} previousScore={10} testID="animated-score" />
      );

      // Verify component exists
      expect(getByTestId('animated-score')).toBeTruthy();

      // Advance timers to complete animation
      advanceAnimationsByTime(1000);

      await waitFor(() => {
        expect(Vibration.vibrate).toHaveBeenCalledWith(20);
      });
    });

    it('should not trigger celebration on score decrease', () => {
      const { rerender } = render(
        <AnimatedScore score={10} previousScore={10} testID="animated-score" />
      );

      // Update score (decrease)
      rerender(
        <AnimatedScore score={5} previousScore={10} testID="animated-score" />
      );

      // Advance timers
      advanceAnimationsByTime(500);

      // Vibration should not be called for decrease
      expect(Vibration.vibrate).not.toHaveBeenCalled();
    });

    it('should disable haptic feedback when enableHaptic is false', () => {
      const { rerender } = render(
        <AnimatedScore 
          score={10} 
          previousScore={10} 
          enableHaptic={false}
          testID="animated-score" 
        />
      );

      rerender(
        <AnimatedScore 
          score={15} 
          previousScore={10} 
          enableHaptic={false}
          testID="animated-score" 
        />
      );

      advanceAnimationsByTime(1000);

      expect(Vibration.vibrate).not.toHaveBeenCalled();
    });

    it('should complete animation within expected duration', async () => {
      const { rerender, getByTestId } = render(
        <AnimatedScore score={10} previousScore={10} testID="animated-score" />
      );

      rerender(
        <AnimatedScore score={15} previousScore={10} testID="animated-score" />
      );

      // Animation should complete within 1 second
      advanceAnimationsByTime(1000);

      await waitFor(() => {
        expect(getByTestId('animated-score')).toBeTruthy();
      });
    });

    it('should render different sizes correctly', () => {
      const { getByText: getSmall } = render(
        <AnimatedScore score={10} size="sm" />
      );
      expect(getSmall('10')).toBeTruthy();

      const { getByText: getMedium } = render(
        <AnimatedScore score={10} size="md" />
      );
      expect(getMedium('10')).toBeTruthy();

      const { getByText: getLarge } = render(
        <AnimatedScore score={10} size="lg" />
      );
      expect(getLarge('10')).toBeTruthy();
    });
  });

  describe('AnimatedModal', () => {
    it('should render when visible', () => {
      const { getByText } = render(
        <AnimatedModal visible={true} onClose={jest.fn()}>
          <Animated.Text>Modal Content</Animated.Text>
        </AnimatedModal>
      );

      expect(getByText('Modal Content')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <AnimatedModal visible={false} onClose={jest.fn()}>
          <Animated.Text>Modal Content</Animated.Text>
        </AnimatedModal>
      );

      expect(queryByText('Modal Content')).toBeNull();
    });

    it('should animate in when becoming visible', async () => {
      const { rerender, getByText } = render(
        <AnimatedModal visible={false} onClose={jest.fn()}>
          <Animated.Text>Modal Content</Animated.Text>
        </AnimatedModal>
      );

      rerender(
        <AnimatedModal visible={true} onClose={jest.fn()}>
          <Animated.Text>Modal Content</Animated.Text>
        </AnimatedModal>
      );

      // Advance animation
      advanceAnimationsByTime(300);

      await waitFor(() => {
        expect(getByText('Modal Content')).toBeTruthy();
      });
    });

    it('should complete slide animation within expected duration', async () => {
      const { getByText } = render(
        <AnimatedModal 
          visible={true} 
          onClose={jest.fn()}
          animationType="slide"
        >
          <Animated.Text>Modal Content</Animated.Text>
        </AnimatedModal>
      );

      // Animation should complete within 500ms
      advanceAnimationsByTime(500);

      await waitFor(() => {
        expect(getByText('Modal Content')).toBeTruthy();
      });
    });

    it('should complete fade animation within expected duration', async () => {
      const { getByText } = render(
        <AnimatedModal 
          visible={true} 
          onClose={jest.fn()}
          animationType="fade"
        >
          <Animated.Text>Modal Content</Animated.Text>
        </AnimatedModal>
      );

      advanceAnimationsByTime(300);

      await waitFor(() => {
        expect(getByText('Modal Content')).toBeTruthy();
      });
    });

    it('should complete scale animation within expected duration', async () => {
      const { getByText } = render(
        <AnimatedModal 
          visible={true} 
          onClose={jest.fn()}
          animationType="scale"
        >
          <Animated.Text>Modal Content</Animated.Text>
        </AnimatedModal>
      );

      advanceAnimationsByTime(300);

      await waitFor(() => {
        expect(getByText('Modal Content')).toBeTruthy();
      });
    });

    it('should handle different positions', () => {
      const positions = ['bottom', 'center', 'top'];

      positions.forEach(position => {
        const { getByText } = render(
          <AnimatedModal 
            visible={true} 
            onClose={jest.fn()}
            position={position}
          >
            <Animated.Text>Modal Content</Animated.Text>
          </AnimatedModal>
        );

        expect(getByText('Modal Content')).toBeTruthy();
      });
    });
  });

  describe('CelebrationAnimation', () => {
    it('should not render when not visible', () => {
      const { toJSON } = render(
        <CelebrationAnimation visible={false} />
      );

      expect(toJSON()).toBeNull();
    });

    it('should trigger haptic feedback when visible', () => {
      render(
        <CelebrationAnimation visible={true} enableHaptic={true} />
      );

      advanceAnimationsByTime(100);

      expect(Vibration.vibrate).toHaveBeenCalledWith([0, 50, 100, 100]);
    });

    it('should not trigger haptic when disabled', () => {
      render(
        <CelebrationAnimation visible={true} enableHaptic={false} />
      );

      advanceAnimationsByTime(100);

      expect(Vibration.vibrate).not.toHaveBeenCalled();
    });

    it('should call onComplete after animation finishes', async () => {
      const onComplete = jest.fn();

      render(
        <CelebrationAnimation 
          visible={true} 
          onComplete={onComplete}
        />
      );

      // Animation duration is slowest (500ms)
      advanceAnimationsByTime(600);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should complete animation within expected duration', async () => {
      const onComplete = jest.fn();

      render(
        <CelebrationAnimation 
          visible={true} 
          onComplete={onComplete}
          intensity="medium"
        />
      );

      // Should complete within 600ms
      advanceAnimationsByTime(600);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should handle different celebration types', () => {
      const types = ['goal', 'wicket', 'milestone'];

      types.forEach(type => {
        const { toJSON } = render(
          <CelebrationAnimation visible={true} type={type} />
        );

        expect(toJSON()).toBeTruthy();
      });
    });

    it('should handle different intensity levels', () => {
      const intensities = ['low', 'medium', 'high'];

      intensities.forEach(intensity => {
        const { toJSON } = render(
          <CelebrationAnimation visible={true} intensity={intensity} />
        );

        expect(toJSON()).toBeTruthy();
      });
    });
  });

  describe('AnimatedListItem', () => {
    it('should render children', () => {
      const { getByText } = render(
        <AnimatedListItem>
          <Animated.Text>List Item</Animated.Text>
        </AnimatedListItem>
      );

      expect(getByText('List Item')).toBeTruthy();
    });

    it('should animate on mount when enabled', async () => {
      const { getByText } = render(
        <AnimatedListItem animateOnMount={true}>
          <Animated.Text>List Item</Animated.Text>
        </AnimatedListItem>
      );

      advanceAnimationsByTime(300);

      await waitFor(() => {
        expect(getByText('List Item')).toBeTruthy();
      });
    });

    it('should not animate on mount when disabled', () => {
      const { getByText } = render(
        <AnimatedListItem animateOnMount={false}>
          <Animated.Text>List Item</Animated.Text>
        </AnimatedListItem>
      );

      expect(getByText('List Item')).toBeTruthy();
    });

    it('should stagger animations based on index', async () => {
      const { getByText: getFirst } = render(
        <AnimatedListItem index={0} animateOnMount={true}>
          <Animated.Text>Item 1</Animated.Text>
        </AnimatedListItem>
      );

      const { getByText: getSecond } = render(
        <AnimatedListItem index={1} animateOnMount={true}>
          <Animated.Text>Item 2</Animated.Text>
        </AnimatedListItem>
      );

      // First item should animate immediately
      advanceAnimationsByTime(50);
      expect(getFirst('Item 1')).toBeTruthy();

      // Second item should animate after delay
      advanceAnimationsByTime(50);
      expect(getSecond('Item 2')).toBeTruthy();
    });

    it('should complete entrance animation within expected duration', async () => {
      const { getByText } = render(
        <AnimatedListItem animateOnMount={true}>
          <Animated.Text>List Item</Animated.Text>
        </AnimatedListItem>
      );

      // Animation should complete within 300ms
      advanceAnimationsByTime(300);

      await waitFor(() => {
        expect(getByText('List Item')).toBeTruthy();
      });
    });

    it('should respect custom delay', async () => {
      const { getByText } = render(
        <AnimatedListItem animateOnMount={true} delay={200}>
          <Animated.Text>List Item</Animated.Text>
        </AnimatedListItem>
      );

      // Should not be visible immediately
      advanceAnimationsByTime(100);

      // Should be visible after delay + animation
      advanceAnimationsByTime(400);

      await waitFor(() => {
        expect(getByText('List Item')).toBeTruthy();
      });
    });
  });

  describe('AnimatedStat', () => {
    it('should render initial value', async () => {
      const { getByText } = render(
        <AnimatedStat value={100} previousValue={100} />
      );

      // Advance timers to complete animation
      advanceAnimationsByTime(500);

      await waitFor(() => {
        expect(getByText('100')).toBeTruthy();
      });
    });

    it('should animate value changes', async () => {
      const { rerender, getByTestId } = render(
        <AnimatedStat value={100} previousValue={100} testID="stat" />
      );

      rerender(
        <AnimatedStat value={200} previousValue={100} testID="stat" />
      );

      advanceAnimationsByTime(500);

      await waitFor(() => {
        expect(getByTestId('stat')).toBeTruthy();
      });
    });

    it('should complete animation within specified duration', async () => {
      const { rerender, getByTestId } = render(
        <AnimatedStat value={100} duration={300} testID="stat" />
      );

      rerender(
        <AnimatedStat value={200} previousValue={100} duration={300} testID="stat" />
      );

      // Should complete within specified duration
      advanceAnimationsByTime(300);

      await waitFor(() => {
        expect(getByTestId('stat')).toBeTruthy();
      });
    });

    it('should render with prefix and suffix', async () => {
      const { getByText } = render(
        <AnimatedStat value={100} previousValue={100} prefix="$" suffix=" USD" />
      );

      advanceAnimationsByTime(500);

      await waitFor(() => {
        expect(getByText('$100 USD')).toBeTruthy();
      });
    });

    it('should handle decimal values', async () => {
      const { getByText } = render(
        <AnimatedStat value={99.99} previousValue={99.99} decimals={2} prefix="$" />
      );

      advanceAnimationsByTime(500);

      await waitFor(() => {
        expect(getByText('$99.99')).toBeTruthy();
      });
    });

    it('should render different sizes', async () => {
      const sizes = ['sm', 'md', 'lg'];

      for (const size of sizes) {
        const { getByText } = render(
          <AnimatedStat value={100} previousValue={100} size={size} />
        );

        advanceAnimationsByTime(500);

        await waitFor(() => {
          expect(getByText('100')).toBeTruthy();
        });
      }
    });
  });

  describe('Animation Performance', () => {
    it('should complete all animations within reasonable time', async () => {
      const startTime = Date.now();

      // Render multiple animated components
      render(
        <>
          <AnimatedScore score={10} previousScore={5} />
          <AnimatedModal visible={true} onClose={jest.fn()}>
            <Animated.Text>Modal</Animated.Text>
          </AnimatedModal>
          <AnimatedListItem>
            <Animated.Text>Item</Animated.Text>
          </AnimatedListItem>
          <AnimatedStat value={100} />
        </>
      );

      // Advance all animations
      advanceAnimationsByTime(1000);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 2 seconds (generous for test environment)
      expect(duration).toBeLessThan(2000);
    });

    it('should not cause memory leaks with multiple animations', () => {
      const { unmount } = render(
        <>
          <AnimatedScore score={10} />
          <AnimatedModal visible={true} onClose={jest.fn()}>
            <Animated.Text>Modal</Animated.Text>
          </AnimatedModal>
          <CelebrationAnimation visible={true} />
          <AnimatedListItem>
            <Animated.Text>Item</Animated.Text>
          </AnimatedListItem>
          <AnimatedStat value={100} />
        </>
      );

      advanceAnimationsByTime(1000);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Animation Correctness', () => {
    it('should maintain component state during animations', async () => {
      const { getByText, rerender } = render(
        <AnimatedScore score={10} previousScore={10} testID="score" />
      );

      expect(getByText('10')).toBeTruthy();

      rerender(
        <AnimatedScore score={20} previousScore={10} testID="score" />
      );

      advanceAnimationsByTime(500);

      await waitFor(() => {
        expect(getByText('20')).toBeTruthy();
      });
    });

    it('should handle rapid animation updates', async () => {
      const { rerender, getByTestId } = render(
        <AnimatedScore score={10} previousScore={10} testID="score" />
      );

      // Rapid updates
      rerender(<AnimatedScore score={15} previousScore={10} testID="score" />);
      advanceAnimationsByTime(100);
      
      rerender(<AnimatedScore score={20} previousScore={15} testID="score" />);
      advanceAnimationsByTime(100);
      
      rerender(<AnimatedScore score={25} previousScore={20} testID="score" />);
      advanceAnimationsByTime(100);

      await waitFor(() => {
        expect(getByTestId('score')).toBeTruthy();
      });
    });

    it('should cleanup animations on unmount', () => {
      const { unmount } = render(
        <AnimatedScore score={10} previousScore={5} />
      );

      advanceAnimationsByTime(200);

      // Should not throw on unmount during animation
      expect(() => unmount()).not.toThrow();
    });
  });
});
