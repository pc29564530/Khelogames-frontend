import React from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';

// Reusable User List Item Component
// Displays user avatar, name, username with consistent styling

const UserListItem = ({
  user,
  onPress,
  showAction = false,
  actionButton = null,
  isLoading = false
}) => {
  const avatarInitial = user?.profile?.full_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <Pressable
      onPress={onPress}
      style={tailwind`flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100 active:bg-gray-50`}
    >
      <View style={tailwind`flex-row items-center flex-1`}>
        {/* Avatar */}
        {user?.profile?.avatar_url ? (
          <Image
            style={tailwind`w-14 h-14 rounded-full bg-gray-200`}
            source={{ uri: user.profile.avatar_url }}
          />
        ) : (
          <View style={tailwind`w-14 h-14 rounded-full bg-red-400 items-center justify-center`}>
            <Text style={tailwind`text-white text-xl font-bold`}>
              {avatarInitial}
            </Text>
          </View>
        )}

        {/* User Info */}
        <View style={tailwind`ml-3 flex-1`}>
          <Text
            style={tailwind`text-gray-900 font-semibold text-base`}
            numberOfLines={1}
          >
            {user?.profile?.full_name || 'Unknown User'}
          </Text>
          <Text
            style={tailwind`text-gray-500 text-sm mt-0.5`}
            numberOfLines={1}
          >
            @{user?.profile?.username || 'unknown'}
          </Text>
        </View>

        {/* Action Button or Chevron */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#f87171" />
        ) : showAction && actionButton ? (
          actionButton
        ) : (
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        )}
      </View>
    </Pressable>
  );
};

export default UserListItem;
