import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import useAxiosInterceptor from '../screen/axios_config';

const ThreadItem = ({ item, handleUser, handleLikes, handleThreadComment, axiosInstance}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  return (
    <View style={tailwind`bg-black mt-5`}>
      <View>
        <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => handleUser(item.username, navigation)}>
          {item.profile?.avatar_url ? (
            <Image source={{ uri: item.profile.avatar_url }} style={tailwind`w-12 h-12 aspect-w-1 aspect-h-1 rounded-full bg-red-500`} />
          ) : (
            <View style={tailwind`w-12 h-12 rounded-12 bg-red-100 items-center justify-center`}>
              <Text style={tailwind`text-red-500 text-6x3`}>
                {item.displayText}
              </Text>
            </View>
          )}
          <View style={tailwind`ml-3`}>
            <Text style={tailwind`font-bold text-white`}>{item.profile && item.profile.full_name ? item.profile.full_name : ''}</Text>
            <Text style={tailwind`text-white`}>@{item.username}</Text>
          </View>
        </Pressable>
      </View>
      <Text style={tailwind`text-white p-3 pl-2`}>{item.content}</Text>
      {item.media_type === 'image' && (
        <Image style={tailwind`w-full h-80 aspect-w-1 aspect-h-1`} source={{ uri: item.media_url }} />
      )}
      {item.media_type === 'video' && (
        <Video style={tailwind`w-full h-80 aspect-w-1 aspect-h-1`} source={{ uri: item.media_url }} controls={true} />
      )}
      <View style={tailwind`p-2`}>
        <Text style={tailwind`text-white`}>{item.like_count} Likes</Text>
      </View>
      <View style={tailwind`border-b border-white mb-2`}></View>
      <View style={tailwind`flex-row justify-evenly gap-50`}>
        <Pressable style={tailwind`items-center`} onPress={() => handleLikes({id: item.id, dispatch, axiosInstance})}>
          <FontAwesome
            name="thumbs-o-up"
            color="white"
            size={20}
          />
          <Text style={tailwind`text-white`}>Like</Text>
        </Pressable>
        <Pressable style={tailwind`items-center`} onPress={() => handleThreadComment({item, id: item.id, navigation, dispatch, axiosInstance})}>
          <FontAwesome
            name="comment-o"
            color="white"
            size={20}
          />
          <Text style={tailwind`text-white`}>Comment</Text>
        </Pressable>
      </View>
      <View style={tailwind`border-b border-white mt-2`}></View>
    </View>
  );
};

export default ThreadItem;
