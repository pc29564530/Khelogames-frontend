import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KhelogamesLogo from '../assets/images/Khelogames.png';
import { useNavigation } from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setThreads, setLikes} from '../redux/actions/actions';
import Video from 'react-native-video';

const Thread = () => {
    const navigation = useNavigation()
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads)

    const handleThreadComment = (item, id) => {
      navigation.navigate('ThreadComment', {item: item, itemId: id})
    }

    const handleLikes = async (id) => {
      try {
        const authUser = await AsyncStorage.getItem('User');
        const authToken = await AsyncStorage.getItem('AccessToken');
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }

        // here when click on like icon call api createLike
        const userCount = await axiosInstance.get(`http://192.168.0.102:8080/checkLikeByUser/${id}`, {headers});
        console.log("Usercount: ", userCount.data)
        if(userCount.data == 0) {
          const response = await axiosInstance.post(`http://192.168.0.102:8080/createLikeThread/${id}`,null, {headers} );
          if(response.status === 200) {
            try {
              const updatedLikeCount = await axiosInstance.get(`http://192.168.0.102:8080/countLike/${id}`,null,{headers});
              const updateLikeData = {
                like_count: updatedLikeCount.data,
                id: id
              }

              const newLikeCount = await axiosInstance.put(`http://192.168.0.0107:8080/update_like`, updateLikeData, {headers});
              dispatch(setLikes(id, newLikeCount.data.like_count))
            } catch (err) {
              console.error(err);
            }

          }
        }
      } catch (error) {
        console.error(error);
      }

    }

    const fetchData = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get('http://192.168.0.102:8080/all_threads', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        const item = response.data;
        if(item === null){
          dispatch(setThreads([]))

        } else {
          dispatch(setThreads(response.data))
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    useEffect(() => {
      fetchData();
    }, []);


    //update the handleUser to directly navigate to profile and profile menu
    const handleUser = async (username) => {
      try {
        const user = await AsyncStorage.getItem('AccessToken');
        if(user !== username) {
          const response = await axiosInstance.get(`http://192.168.0.102:8080/user/${user}`);
          navigation.navigate('Profile', { username: response.data.username });
        } else {
          const response = await axiosInstance.get(`http://192.168.0.102:8080/user/${username}`);
          navigation.navigate('ProfileMenu', { username: response.data.username });
        }

      } catch (err) {
        console.error(err);
      }
    }
    const iconSize = 25
  
    return (
      <View style={styles.Container} vertical={true}>
            {threads.map((item,i) => (
                <View key={i} style={styles.ContentContainer}>
                    <View style={styles.Header}>
                      <Image source={KhelogamesLogo} style={styles.UserImage} />
                      <View>
                        <TouchableOpacity onPress={() => {handleUser(item.username)}}><Text style={styles.UserName}>{item.username}</Text></TouchableOpacity>
                        <Text style={styles.Position}>{item.timestamp}</Text>
                      </View>
                    </View>
                    <Text style={styles.Content}>{item.content}</Text>
                    {item.media_type === 'image' && (
                      <Image
                      style={styles.PostImage}
                        source={{uri:item.media_url}}
                      />
                    )}
                    {item.media_type === 'video' && (
                      <Video style={styles.PostImage}
                      source={{uri:item.media_url}} controls={true} />
                    )}
                    <View style={styles.LikeCount}>
                      <Text style={styles.likeText}>{item.like_count} Likes</Text>
                    </View>
                    <View style={styles.Footer}>
                      <Pressable  onPress={() => handleLikes(item.id)}>
                      <FontAwesome 
                           name="thumbs-o-up"
                           style={styles.FooterButton}
                           size={iconSize}
                        /> 
                      </Pressable>
                      <Pressable onPress={() => handleThreadComment(item, item.id)}>
                        <FontAwesome 
                           name="comment-o"
                           style={styles.FooterButton}
                           size={iconSize}
                        />  
                      </Pressable>
                    </View>
              </View>
              ))}
        </View>
    );
  };

  const styles = StyleSheet.create({
    Container: {
      color: 'lightgrey',
      maxWidth: 500,
      width: '100%',
      alignSelf: 'center',
      flex: 1,
    },
    ContentContainer: {
      marginTop: '1.5px',
      marginBottom: '1.5px',
      backgroundColor: 'white',
    },
    Header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    UserImage: {
      width: 50,
      aspectRatio: 1,
      borderRadius: 25,
      backgroundColor: 'red'
    },
    UserName: {
      fontWeight: '600',
      marginBottom: 5,
      padding: 10
    },
    Position: {
      fontSize: 12,
      color: 'grey',
    },
    Content: {
      margin: 10,
      marginTop: 0,
    },
    PostImage: {
      width: '100%',
      aspectRatio: 1,
    },
    LikeCount: {
      padding: 10,
    },
    Footer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderColor: 'lightgray',
    },
    FooterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      fontSize: 18
    }
  });

export default Thread;
