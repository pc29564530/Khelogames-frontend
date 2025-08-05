import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { formattedTime } from '../utils/FormattedDateTime';
import { formattedDate } from '../utils/FormattedDateTime';

const ThreadItem = ({ item, handleUser, handleLikes, handleThreadComment, axiosInstance, handleComment}) => {
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
      <View>
        <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => handleUser({profilePublicID: item.profile.public_id, navigation})}>
          {item?.profile?.avatar_url ? (
            <Image source={{ uri: item?.profile?.avatar_url }} style={tailwind`w-12 h-12 aspect-w-1 aspect-h-1 rounded-full bg-red-400`} />
          ) : (
            <View style={tailwind`w-12 h-12 rounded-12 bg-red-400 items-center justify-center`}>
              <Text style={tailwind`text-white text-6x3`}>
                NA
              </Text>
            </View>
          )}
          <View style={tailwind`ml-3`}>
            <View>
              <Text style={tailwind`font-bold text-black`}>{item && item.profile.full_name ? item.profile.full_name : ''}</Text>
            </View>
            <View style={tailwind`flex-row gap-1`}>
              <Text style={tailwind`text-black`}>@{item.profile.username}</Text>
              <Text style={tailwind`text-black`}>-</Text>
              <Text style={tailwind`text-black`}>{formattedDate(item.created_at)}</Text>
              <Text style={tailwind`text-black`}>{formattedTime(item.created_at)}</Text>
            </View>
          </View>

        </Pressable>
      </View>
      <Text style={tailwind`text-black p-3 pl-2`}>{item.content}</Text>
      {item.media_type == "image" && (
        <Image style={tailwind`w-full h-80 aspect-w-1 aspect-h-1`} source={{ uri: item.media_url }} />
      )}
      {(item.media_type == "video/mp4" || item.media_type == "video/quicktime" || item.media_type == "video/mkv") && (
        <Video style={tailwind`w-full h-80 aspect-w-16 aspect-h-9`} source={{ uri: item.media_url }} controls={true} onFullscreenPlayerWillPresent={() => {handleFullScreen()}} onVolumeChange={()=>{handleVolume()}} resizeMode='cover'/>
      )}
      <View style={tailwind`p-2`}>
        <Text style={tailwind`text-black`}>{item.like_count} Likes</Text>
      </View>
      <View style={tailwind`w-full h-0.4 bg-gray-200 mb-2`} />
      <View style={tailwind`flex-row justify-evenly gap-50 mb-2`}>
        <Pressable style={tailwind`items-center`} onPress={() => handleLikes({threadPublicID: item.public_id, dispatch, axiosInstance})}>
          <FontAwesome
            name="thumbs-o-up"
            color="black"
            size={20}
          />
          <Text style={tailwind`text-black`}>Like</Text>
        </Pressable>
        {handleComment ? (
          <Pressable style={tailwind`items-center`} onPress={handleComment}>
            <FontAwesome
              name="comment-o"
              color="white"
              size={20}
            />
            <Text style={tailwind`text-black`}>Comment</Text>
          </Pressable>
        ):(
        <Pressable style={tailwind`items-center`} onPress={() => handleThreadComment({item: item, publicID: item.public_id})}>
          <FontAwesome
            name="comment-o"
            color="black"
            size={20}
          />
          <Text style={tailwind`text-black`}>Comment</Text>
        </Pressable>
        )}
      </View>
    </Pressable>
  );
};

export default ThreadItem;
