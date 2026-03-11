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
    <View style={[tailwind`mb-2`, {backgroundColor: '#1e293b', borderBottomWidth: 1, borderColor: '#334155'}]}>

      <Pressable
        style={tailwind`flex-row items-center px-4 pt-3 pb-2`}
        onPress={() => handleUser({ profilePublicID: item?.profile?.public_id, navigation })}
      >
        {item?.profile?.avatar_url ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            style={[tailwind`w-11 h-11 rounded-full`, {backgroundColor: '#334155'}]}
          />
        ) : (
          <View style={tailwind`w-11 h-11 rounded-full bg-red-400 items-center justify-center`}>
            <Text style={tailwind`text-white text-lg font-bold`}>
              {item?.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={tailwind`ml-3 flex-1`}>
          <Text style={{fontWeight: '700', color: '#f1f5f9', fontSize: 14}}>
            {item?.profile?.full_name || ''}
          </Text>
          <View style={tailwind`flex-row items-center`}>
            <Text style={{color: '#64748b', fontSize: 12}}>@{item.profile.username}</Text>
            <Text style={{color: '#475569', fontSize: 12, marginHorizontal: 4}}>&middot;</Text>
            <Text style={{color: '#64748b', fontSize: 12}}>{formattedDate(item.created_at)}</Text>
          </View>
        </View>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('ThreadComment', { item })}>
        {item.title ? (
          <Text style={{color: '#f1f5f9', fontSize: 16, fontWeight: '700', paddingHorizontal: 16, paddingBottom: 4}}>{item.title}</Text>
        ) : null}
        {item.content ? (
          <Text style={{color: '#cbd5e1', fontSize: 14, paddingHorizontal: 16, paddingBottom: 12, lineHeight: 20}}>{item.content}</Text>
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
        <Text style={{color: '#64748b', fontSize: 12}}>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </Text>
      </View>

      <View style={[tailwind`h-px mx-4`, {backgroundColor: '#334155'}]} />

      <View style={tailwind`flex-row justify-around py-2`}>
        <Pressable
          style={tailwind`flex-row items-center px-4 py-2`}
          onPress={() => handleLikes({ threadPublicID: item.public_id, setError, dispatch })}
        >
          <FontAwesome name="thumbs-o-up" color="#94a3b8" size={18} />
          <Text style={{color: '#94a3b8', fontSize: 12, marginLeft: 8}}>Like</Text>
        </Pressable>
        <Pressable
          style={tailwind`flex-row items-center px-4 py-2`}
          onPress={handleComment
            ? handleComment
            : () => handleThreadComment({ item, threadPublicID: item.public_id, navigation })}
        >
          <FontAwesome name="comment-o" color="#94a3b8" size={18} />
          <Text style={{color: '#94a3b8', fontSize: 12, marginLeft: 8}}>Comment</Text>
        </Pressable>
      </View>

    </View>
  );
};

export default ThreadItem;
