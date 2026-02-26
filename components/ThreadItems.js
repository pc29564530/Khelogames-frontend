import React, { useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { formattedDate } from '../utils/FormattedDateTime';
import InlineVideoPlayer from './InlineVideoPlayer';

const ThreadItem = ({ item, handleUser, handleLikes, handleThreadComment, handleComment }) => {
  const navigation = useNavigation();
  const dispatch   = useDispatch();
  const [error, setError] = useState({ global: null, fields: {} });

  const likeCount = useSelector(state =>
    state.threads.threads.find(t => t.public_id === item.public_id)?.like_count
    ?? item.like_count
  );

  return (
    <View style={tailwind`bg-white mb-2 border-b border-gray-100`}>

      <Pressable
        style={tailwind`flex-row items-center px-4 pt-3 pb-2`}
        onPress={() => handleUser({ profilePublicID: item?.profile?.public_id, navigation })}
      >
        {item?.profile?.avatar_url ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            style={tailwind`w-11 h-11 rounded-full bg-gray-200`}
          />
        ) : (
          <View style={tailwind`w-11 h-11 rounded-full bg-red-400 items-center justify-center`}>
            <Text style={tailwind`text-white text-lg font-bold`}>
              {item?.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={tailwind`ml-3 flex-1`}>
          <Text style={tailwind`font-bold text-black text-sm`}>
            {item?.profile?.full_name || ''}
          </Text>
          <View style={tailwind`flex-row items-center`}>
            <Text style={tailwind`text-gray-500 text-xs`}>@{item.profile.username}</Text>
            <Text style={tailwind`text-gray-300 text-xs mx-1`}>&middot;</Text>
            <Text style={tailwind`text-gray-500 text-xs`}>{formattedDate(item.created_at)}</Text>
          </View>
        </View>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('ThreadComment', { item })}>
        {item.title ? (
          <Text style={tailwind`text-black text-base font-bold px-4 pb-1`}>{item.title}</Text>
        ) : null}
        {item.content ? (
          <Text style={tailwind`text-gray-800 text-sm px-4 pb-3 leading-5`}>{item.content}</Text>
        ) : null}
      </Pressable>

      {item.media_type === 'image' && item.media_url ? (
        <Pressable onPress={() => navigation.navigate('ThreadComment', { item })}>
          <Image
            style={tailwind`w-full h-72`}
            source={{ uri: item.media_url }}
            resizeMode="cover"
          />
        </Pressable>
      ) : null}

      {item.media_type === 'video' && item.media_url ? (
        <InlineVideoPlayer item={item} />
      ) : null}

      <View style={tailwind`px-4 pt-2 pb-1 flex-row items-center`}>
        <Text style={tailwind`text-gray-400 text-xs`}>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </Text>
      </View>

      <View style={tailwind`h-px bg-gray-100 mx-4`} />

      <View style={tailwind`flex-row justify-around py-2`}>
        <Pressable
          style={tailwind`flex-row items-center px-4 py-2`}
          onPress={() => handleLikes({ threadPublicID: item.public_id, setError, dispatch })}
        >
          <FontAwesome name="thumbs-o-up" color="#6B7280" size={18} />
          <Text style={tailwind`text-gray-500 text-xs ml-2`}>Like</Text>
        </Pressable>
        <Pressable
          style={tailwind`flex-row items-center px-4 py-2`}
          onPress={handleComment
            ? handleComment
            : () => handleThreadComment({ item, threadPublicID: item.public_id, navigation })}
        >
          <FontAwesome name="comment-o" color="#6B7280" size={18} />
          <Text style={tailwind`text-gray-500 text-xs ml-2`}>Comment</Text>
        </Pressable>
      </View>

    </View>
  );
};

export default ThreadItem;
