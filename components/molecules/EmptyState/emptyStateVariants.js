/**
 * Predefined empty state variants for different contexts
 * Provides consistent messaging and actions across the application
 */

import React from 'react';
import { Text } from 'react-native';

// Simple icon components using text emojis for now
// In a real app, these would be replaced with proper icon library components
const MatchIcon = () => <Text style={{ fontSize: 40 }}>🏏</Text>;
const TournamentIcon = () => <Text style={{ fontSize: 40 }}>🏆</Text>;
const ClubIcon = () => <Text style={{ fontSize: 40 }}>👥</Text>;
const CommunityIcon = () => <Text style={{ fontSize: 40 }}>💬</Text>;
const SearchIcon = () => <Text style={{ fontSize: 40 }}>🔍</Text>;
const ProfileIcon = () => <Text style={{ fontSize: 40 }}>📝</Text>;
const FollowerIcon = () => <Text style={{ fontSize: 40 }}>👤</Text>;
const PostIcon = () => <Text style={{ fontSize: 40 }}>📄</Text>;

export const emptyStateVariants = {
  matches: {
    icon: <MatchIcon />,
    title: 'No Matches Yet',
    message: 'Start creating matches to see them here. Track scores and follow your favorite teams.',
    actionLabel: 'Create Match',
    variant: 'matches',
  },
  
  tournaments: {
    icon: <TournamentIcon />,
    title: 'No Tournaments Found',
    message: 'Create or join tournaments to compete with other teams and players.',
    actionLabel: 'Create Tournament',
    variant: 'tournaments',
  },
  
  clubs: {
    icon: <ClubIcon />,
    title: 'No Clubs Available',
    message: 'Join or create a club to connect with players and organize matches.',
    actionLabel: 'Create Club',
    secondaryActionLabel: 'Browse Clubs',
    variant: 'clubs',
  },
  
  communities: {
    icon: <CommunityIcon />,
    title: 'No Communities Yet',
    message: 'Join communities to discuss sports, share updates, and connect with fans.',
    actionLabel: 'Explore Communities',
    variant: 'communities',
  },
  
  searchNoResults: {
    icon: <SearchIcon />,
    title: 'No Results Found',
    message: 'Try adjusting your search terms or filters to find what you\'re looking for.',
    actionLabel: 'Clear Filters',
    variant: 'search',
  },
  
  searchSuggestions: {
    icon: <SearchIcon />,
    title: 'No Results Found',
    message: 'We couldn\'t find any matches. Try searching for popular teams, players, or tournaments.',
    secondaryActionLabel: 'Browse Popular',
    variant: 'search',
  },
  
  profilePosts: {
    icon: <PostIcon />,
    title: 'No Posts Yet',
    message: 'Share your thoughts, match updates, or sports highlights to get started.',
    actionLabel: 'Create Post',
    variant: 'profile',
  },
  
  profileMatches: {
    icon: <MatchIcon />,
    title: 'No Matches Played',
    message: 'Start playing matches to build your sports profile and track your performance.',
    variant: 'profile',
  },
  
  followers: {
    icon: <FollowerIcon />,
    title: 'No Followers Yet',
    message: 'Share great content and engage with the community to gain followers.',
    variant: 'followers',
  },
  
  following: {
    icon: <FollowerIcon />,
    title: 'Not Following Anyone',
    message: 'Follow players, teams, and clubs to see their updates in your feed.',
    actionLabel: 'Discover People',
    variant: 'followers',
  },
  
  clubMembers: {
    icon: <ClubIcon />,
    title: 'No Members Yet',
    message: 'Invite players to join your club and start building your team.',
    actionLabel: 'Invite Members',
    variant: 'clubs',
  },
  
  tournamentMatches: {
    icon: <MatchIcon />,
    title: 'No Matches Scheduled',
    message: 'Matches will appear here once the tournament begins.',
    variant: 'tournaments',
  },
  
  tournamentParticipants: {
    icon: <TournamentIcon />,
    title: 'No Participants Yet',
    message: 'Teams will be listed here once they register for the tournament.',
    actionLabel: 'Invite Teams',
    variant: 'tournaments',
  },
  
  communityThreads: {
    icon: <CommunityIcon />,
    title: 'No Discussions Yet',
    message: 'Start a conversation and engage with other community members.',
    actionLabel: 'Start Discussion',
    variant: 'communities',
  },
  
  comments: {
    icon: <CommunityIcon />,
    title: 'No Comments Yet',
    message: 'Be the first to share your thoughts on this post.',
    actionLabel: 'Add Comment',
    variant: 'communities',
  },
};

/**
 * Get empty state configuration by variant name
 * @param {string} variantName - Name of the variant
 * @param {object} overrides - Optional overrides for the variant
 * @returns {object} Empty state configuration
 */
export const getEmptyStateVariant = (variantName, overrides = {}) => {
  const variant = emptyStateVariants[variantName];
  if (!variant) {
    console.warn(`Empty state variant "${variantName}" not found. Using default.`);
    return {
      title: 'No Data Available',
      message: 'There is no content to display at this time.',
      variant: 'default',
      ...overrides,
    };
  }
  return { ...variant, ...overrides };
};
