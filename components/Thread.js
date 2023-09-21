import React, { useEffect, useState } from 'react';
import {Video, View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KhelogamesLogo from '../assets/images/Khelogames.png';
import { useNavigation } from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setThreads, setLikes} from '../redux/actions/actions';

const Thread = () => {

    const navigation = useNavigation()
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads)
    console.log(threads)

    const handleThreadComment = (item, id) => {
      navigation.navigate('ThreadComment', {item: item, itemId: id})
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

    const fetchData = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        console.log(authToken); 
        const response = await axiosInstance.get('http://localhost:8080/all_threads', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        const item = response.data;
        if(item.length == 0){
          navigation.replace('CreateThread');
        }
        dispatch(setThreads(response.data))
      } catch (err) {
        console.error(err);
      }
    };
  
    useEffect(() => {
      fetchData();
    }, []);
    console.log(threads);

    const handleUser = async (username) => {
      try {
        const response = await axios.get(`http://localhost:8080/user/${username}` )
        console.log(response)
        navigation.navigate('ProfileMenu', { username: response.data.username });
      } catch (err) {
        console.error(err);
      }
    }
  
    return (
        <View style={styles.container}>
            {threads.map((item,i) => (
                <View key={i} style={styles.contentContainer}>
                    <View style={styles.header}>
                      <Image source={KhelogamesLogo} style={styles.userImage} />
                      <View>
                        <TouchableOpacity onPress={() => {handleUser(item.username)}}><Text style={styles.userName}>{item.username}</Text></TouchableOpacity>
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
                      <Pressable onPress={() => handleThreadComment(item, item.id)}>
                        <FontAwesome 
                           name="comment-o"
                           style={styles.footerButton}
                           size='21'
                        />  
                      </Pressable>
                    </View>
              </View>
              ))}
        </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      color: 'lightgrey',
      maxWidth: 500,
      width: '100%',
      alignSelf: 'center',
    },
    contentContainer: {
      marginTop: '1.5px',
      marginBottom: '1.5px',
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
    },
    footerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      fontSize: 18
    }
  });

export default Thread;