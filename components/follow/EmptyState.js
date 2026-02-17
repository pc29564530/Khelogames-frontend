import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';

// Empty State Component
// Shows when there are no followers/following
const EmptyState = ({ type = 'followers', message }) => {
  const iconName = type === 'followers' ? 'people-outline' : 'person-add-alt';
  const defaultMessage = type === 'followers'
    ? "No followers yet"
    : "Not following anyone yet";

  const subtitle = type === 'followers'
    ? "When people follow you, they'll appear here"
    : "Find and follow people to see them here";

  return (
    <View style={tailwind`flex-1 items-center justify-center px-8 py-16`}>
      <View style={tailwind`w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4`}>
        <MaterialIcons name={iconName} size={40} color="#9CA3AF" />
      </View>

      <Text style={tailwind`text-gray-900 text-lg font-semibold text-center mb-2`}>
        {message || defaultMessage}
      </Text>

      <Text style={tailwind`text-gray-500 text-sm text-center leading-5`}>
        {subtitle}
      </Text>
    </View>
  );
};

export default EmptyState;
