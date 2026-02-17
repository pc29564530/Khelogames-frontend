import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';

// Loading State Component
// Shows loading spinner while fetching data

const LoadingState = () => {
  return (
    <View style={tailwind`flex-1 items-center justify-center py-16`}>
      <ActivityIndicator size="large" color="#f87171" />
    </View>
  );
};

export default LoadingState;
