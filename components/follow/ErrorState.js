import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';

// Error State Component
// Shows error message with retry button
const ErrorState = ({ message, onRetry }) => {
  return (
    <View style={tailwind`flex-1 items-center justify-center px-8 py-16`}>
      <View style={tailwind`w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4`}>
        <MaterialIcons name="error-outline" size={40} color="#EF4444" />
      </View>

      <Text style={tailwind`text-gray-900 text-lg font-semibold text-center mb-2`}>
        Something went wrong
      </Text>

      <Text style={tailwind`text-gray-500 text-sm text-center mb-6 leading-5`}>
        {message || "Unable to load data. Please try again."}
      </Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={tailwind`px-6 py-3 bg-red-400 rounded-full`}
        >
          <Text style={tailwind`text-white font-semibold text-sm`}>
            Try Again
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ErrorState;
