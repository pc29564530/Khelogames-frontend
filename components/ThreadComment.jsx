import React, { useEffect, useState, useRef } from 'react';
import {Video, View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView, KeyboardAvoidingView, TextInput, Button} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import { addComments, setComments, setCommentText } from '../redux/actions/actions';
import Comment from './Comment';
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KhelogamesLogo from '../assets/images/Khelogames.png';
import {useSelector, useDispatch} from 'react-redux';
import {setThreads, setLikes} from '../redux/actions/actions';
import axios from 'axios';

function ThreadComment ({route}) {
    const commentInputRef = useRef();
    const { item, itemId } = route.params;
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const commentText = useSelector((state) => state.comments.commentText)

      const handleReduxSubmit = async () => {
        try {
            const authToken =  await AsyncStorage.getItem('AccessToken');
            console.log("threadId: ", itemId)
            const response = await axiosInstance.post(`http://192.168.0.107:8080/createComment/${itemId}`, {commentText}, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            })
            dispatch(addComments(response.data));
            dispatch(addComments([]));

        } catch (e) {
            console.error(e);
        }
    }


    const handleLikes = async (id) => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }

        const response = await axiosInstance.put(`http://192.168.0.107:8080/update_like/${id}`, null, {headers} );
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

    const handleComment = () => {
      commentInputRef.current.focus();
    }

    const iconSize = 30
  
    return (
        <View style={styles.Container}>
              <ScrollView style={styles.ContentContainer}>
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
                    <Pressable onPress={() => handleComment()}>
                      <FontAwesome 
                          name="comment-o"
                          style={styles.FooterButton}
                          size={iconSize}
                      />  
                    </Pressable>
                  </View>
                  <View style={styles.Comment}>
                    <Comment  threadId = {item.id} />
                  </View>
              </ScrollView>
              <KeyboardAvoidingView style={styles.SubcontainerEdit}>
                <TextInput
                    ref={commentInputRef}
                    style={styles.CommentText}
                    value={commentText}
                    onChangeText={(text) => dispatch(setCommentText(text))}
                    placeholder="Write a comment..."
                />
                <Button style={styles.ButtonText} title="Submit" onPress={() => handleReduxSubmit()}/>
            </KeyboardAvoidingView>
             </View>
    );
  };

  const styles = StyleSheet.create({
    Container: {
      flex:1,
      color: 'lightgrey',
      width: '100%',
      alignSelf: 'center',
      display: 'flex'
    },
    ContentContainer: {
      flex:1,
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: 'white',
    },
    Header: {
      flex:1,
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
      flex:1,
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
    },
    Comment: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#fff',
    },
    ButtonText: {
      alignSelf: 'center',
      color: '#FFF',
      fontSize: 26,
      fontWeight: 'bold',
      margin:50,
      padding:20,
    },
    SubcontainerEdit: {
      padding:20,
  },
  CommentText: {
    padding: 10,
    margin:10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'red',
  }
  });

export default ThreadComment;
