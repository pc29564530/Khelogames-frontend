import React from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';

const UserListItem = ({
  user,
  onPress,
  showAction = false,
  actionButton = null,
  isLoading = false
}) => {

  const avatarInitial = user?.full_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <Pressable
      onPress={onPress}
      style={tailwind`flex-row items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 active:bg-slate-700`}
    >
      <View style={tailwind`flex-row items-center flex-1`}>

        {/* Avatar */}
        {user?.avatar_url ? (
          <Image
            style={tailwind`w-14 h-14 rounded-full bg-slate-700`}
            source={{ uri: user?.avatar_url }}
          />
        ) : (
          <View style={tailwind`w-14 h-14 rounded-full bg-slate-400 items-center justify-center`}>
            <Text style={tailwind`text-white text-xl font-bold`}>
              {avatarInitial}
            </Text>
          </View>
        )}

        {/* User Info */}
        <View style={tailwind`ml-3 flex-1`}>
          <Text
            style={tailwind`text-slate-100 font-semibold text-base`}
            numberOfLines={1}
          >
            {user?.full_name || 'Unknown User'}
          </Text>

          <Text
            style={tailwind`text-slate-400 text-sm mt-0.5`}
            numberOfLines={1}
          >
            @{user?.username || 'unknown'}
          </Text>
        </View>

        {/* Action Button or Chevron */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : showAction && actionButton ? (
          actionButton
        ) : (
          <MaterialIcons name="chevron-right" size={24} color="#64748b" />
        )}

      </View>
    </Pressable>
  );
};

export default UserListItem;