import React, { useEffect, useState } from 'react';
import {Video, View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import Comment from './Comment';
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KhelogamesLogo from '../assets/images/Khelogames.png';

function ThreadComment ({route}) {
    const { item, itemId } = route.params;
    const [showComment, setShowComment] = useState({});
    const axiosInstance = useAxiosInterceptor();

    const handleComment = (id) => {
        setShowComment(prevState => ({ ...prevState, [id]: !prevState[id]}));
    }

    const handleLikes = async (id) => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await fetch(`http://localhost:8080/update_like/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        } );
        const item = response.json();
        console.log(item);
      } catch (error) {
        console.error(error);
      }

    }
  
    return (
        <View style={styles.container}>
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                      <Image source={KhelogamesLogo} style={styles.userImage} />
                      <View>
                        <Text style={styles.userName}>{item.username}</Text>
                        <Text style={styles.position}>{item.timestamp}</Text>
                      </View>
                    </View>
                    <Text style={styles.content}>{item.content}</Text>
                    {item.media_type === 'image' && (
                      <Image
                        style={styles.postImage}
                        source={{ uri: item.media_url }}
                      />
                    )}
                    <View style={styles.likeCount}>
                      <Text style={styles.likeText}>{item.like_count} Likes</Text>
                    </View>
                    <View style={styles.footer}>
                      <Pressable  onPress={() => handleLikes(item.id)}>
                      <FontAwesome 
                           name="thumbs-o-up"
                           style={styles.footerButton}
                           size='21'
                        /> 
                      </Pressable>
                      <Pressable onPress={() => handleComment(item.id)}>
                        <FontAwesome 
                           name="comment-o"
                           style={styles.footerButton}
                           size='21'
                        />  
                      </Pressable>
                    </View>
                    <View>
                      {showComment[item.id] &&  <Comment  threadId = {item.id} /> }
                    </View>
              </View>
             </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      maxWidth: 500,
      width: '100%',
      alignSelf: 'center',
    },
    contentContainer: {
      marginBottom: '3px',
      backgroundColor: 'white',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    userImage: {
      width: 50,
      aspectRatio: 1,
      borderRadius: 25,
      backgroundColor: 'red'
    },
    userName: {
      fontWeight: '600',
      marginBottom: 5,
      padding: 10
    },
    position: {
      fontSize: 12,
      color: 'grey',
    },
    content: {
      margin: 10,
      marginTop: 0,
    },
    postImage: {
      width: '100%',
      aspectRatio: 1,
    },
    likeCount: {
      padding: 10,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderColor: 'lightgray',
      marginBotom: '10px',
    },
    footerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      fontSize: 18
    }
  });

export default ThreadComment;