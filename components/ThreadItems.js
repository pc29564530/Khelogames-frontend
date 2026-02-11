import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { formattedTime } from '../utils/FormattedDateTime';
import { formattedDate } from '../utils/FormattedDateTime';
import axiosInstance from '../screen/axios_config';

const ThreadItem = ({ item, handleUser, handleLikes, handleThreadComment, handleComment}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const handleFullScreen = () => {
    console.log('entering full screen mode')
  }
  const handleVolume = () => {
    console.log('changing the volume of video')
  }
  return (
    <Pressable onPress={() => navigation.navigate("ThreadComment", item={item} )} style={tailwind`bg-white mb-2 shadow-lg`}>
      <Pressable style={tailwind`flex-row items-center px-4 pt-3 pb-2`} onPress={() => handleUser({profilePublicID: item?.profile?.public_id, navigation})}>
        {item?.profile?.avatar_url ? (
          <Image source={{ uri: item.profile.avatar_url }} style={tailwind`w-11 h-11 rounded-full bg-gray-200`} />
        ) : (
          <View style={tailwind`w-11 h-11 rounded-full bg-red-400 items-center justify-center`}>
            <Text style={tailwind`text-white text-lg font-bold`}>
              {item?.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={tailwind`ml-3 flex-1`}>
          <Text style={tailwind`font-bold text-black text-sm`}>{item?.profile?.full_name || ''}</Text>
          <View style={tailwind`flex-row items-center`}>
            <Text style={tailwind`text-gray-500 text-xs`}>@{item.profile.username}</Text>
            <Text style={tailwind`text-gray-300 text-xs mx-1`}>&middot;</Text>
            <Text style={tailwind`text-gray-500 text-xs`}>{formattedDate(item.created_at)}</Text>
          </View>
        </View>
      </Pressable>

      {/* Content */}
      <Text style={tailwind`text-black text-sm px-4 pb-3 leading-5`}>{item.content}</Text>

      {/* Media */}
      {item.media_type === 'image/jpg' && (
        <Image style={tailwind`w-full h-80`} source={{ uri: item.media_url }} resizeMode="cover" />
      )}
      {item.media_type === 'video/mp4' && (
        <Video style={tailwind`w-full h-80`} source={{ uri: item.media_url }} controls={true} resizeMode='cover'/>
      )}

      {/* Engagement stats */}
      <View style={tailwind`px-4 py-2`}>
        <Text style={tailwind`text-gray-500 text-xs`}>{item.like_count} likes</Text>
      </View>

      {/* Divider */}
      <View style={tailwind`h-px bg-gray-100 mx-4`} />

      {/* Action buttons */}
      <View style={tailwind`flex-row justify-around py-2`}>
        <Pressable style={tailwind`flex-row items-center px-4 py-1`} onPress={() => handleLikes({threadPublicID: item.public_id, dispatch, axiosInstance})}>
          <FontAwesome name="thumbs-o-up" color="#6B7280" size={18} />
          <Text style={tailwind`text-gray-500 text-xs ml-2`}>Like</Text>
        </Pressable>
        <Pressable style={tailwind`flex-row items-center px-4 py-1`} onPress={handleComment ? handleComment : () => handleThreadComment({item, threadPublicID: item.public_id, navigation})}>
          <FontAwesome name="comment-o" color="#6B7280" size={18} />
          <Text style={tailwind`text-gray-500 text-xs ml-2`}>Comment</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default ThreadItem;
