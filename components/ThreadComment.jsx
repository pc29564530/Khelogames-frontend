import React, { useEffect, useState } from 'react';
import {Video, View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import Comment from './Comment';
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KhelogamesLogo from '../assets/images/Khelogames.png';
import {useSelector, useDispatch} from 'react-redux';
import {setThreads, setLikes} from '../redux/actions/actions';
import axios from 'axios';

function ThreadComment ({route}) {
    const { item, itemId } = route.params;
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();

    const handleLikes = async (id) => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }

        const response = await axios.put(`http://10.0.2.2:8080/update_like/${id}`, null, {headers} );
        console.log(response.data.like_count);
        if(response.status === 200) {
          const newLikesCount = response.data.like_count;
          console.log(newLikesCount);
          dispatch(setLikes(id, newLikesCount))
        }
        const item = response.data;
        console.log(item)
      } catch (error) {
        console.error(error);
      }

    }

    const iconSize = 30
  
    return (
        <View style={styles.Container}>
                <View style={styles.ContentContainer}>
                    <View style={styles.Header}>
                      <Image source={KhelogamesLogo} style={styles.UserImage} />
                      <View>
                        <Text style={styles.UserName}>{item.username}</Text>
                        <Text style={styles.Position}>{item.timestamp}</Text>
                      </View>
                    </View>
                    <Text style={styles.Content}>{item.content}</Text>
                    {item.media_type === 'image' && (
                      <Image
                        style={styles.PostImage}
                        source={{ uri: item.media_url }}
                      />
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
                      <Pressable onPress={() => handleComment(item.id)}>
                        <FontAwesome 
                           name="comment-o"
                           style={styles.FooterButton}
                           size={iconSize}
                        />  
                      </Pressable>
                    </View>
                    <View style={{marginTop: 20}}>
                      <Comment  threadId = {item.id} />
                    </View>
              </View>
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

export default ThreadComment;