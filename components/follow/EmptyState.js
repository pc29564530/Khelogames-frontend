import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';

const EmptyState = ({ type = 'followers', message }) => {

  const iconName = type === 'followers' ? 'people-outline' : 'person-add-alt';

  const defaultMessage =
    type === 'followers'
      ? "No followers yet"
      : "Not following anyone yet";

  const subtitle =
    type === 'followers'
      ? "When people follow you, they'll appear here"
      : "Find and follow people to see them here";

  return (
    <View style={[tailwind`flex-1 items-center justify-center px-8 py-16`,{backgroundColor: '#0f172a' }]}>

      <View style={tailwind`w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4`}>
        <MaterialIcons name={iconName} size={40} color="#94a3b8" />
      </View>

      <Text style={tailwind`text-slate-100 text-lg font-semibold text-center mb-2`}>
        {message || defaultMessage}
      </Text>

      <Text style={tailwind`text-slate-400 text-sm text-center leading-5`}>
        {subtitle}
      </Text>

    </View>
  );
};

export default EmptyState;