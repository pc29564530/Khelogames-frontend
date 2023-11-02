import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KhelogamesLogo from '../assets/images/Khelogames.png';
import { useNavigation } from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setThreads, setLikes} from '../redux/actions/actions';
import Video from 'react-native-video';


const Thread = () => {

    const [profileData, setProfileData] = useState(null);
    const navigation = useNavigation()
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads)
    const [username,setUsername] = useState('');
    const [threadWithUserProfile, setThreadWithUserProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');

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

              const newLikeCount = await axiosInstance.put(`http://192.168.0.102:8080/update_like`, updateLikeData, {headers});
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
          setThreadWithUserProfile([]);
          dispatch(setThreads([]));
        } else {
          const threadUser = item.map(async (item,index) => {
            const profileResponse = await axiosInstance.get(`http://192.168.0.102:8080/getProfile/${item.username}`);
            if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
              const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
              setDisplayText(usernameInitial.toUpperCase());
            } else {
              setDisplayText(''); // Reset displayText if the avatar is present
            }
            return {...item, profile: profileResponse.data}
          });
          const threadsWithUserData = await Promise.all(threadUser);
          setThreadWithUserProfile(threadsWithUserData);
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
        const user = await AsyncStorage.getItem('User');
        if(username === undefined || username === null) {
          const response = await axiosInstance.get(`http://192.168.0.102:8080/user/${user}`);
          navigation.navigate('Profile', { username: response.data.username });
        } else {
          const response = await axiosInstance.get(`http://192.168.0.102:8080/user/${username}`);
          navigation.navigate('Profile', { username: response.data.username });
        }

      } catch (err) {
        console.error(err);
      }
    }
    const iconSize = 25
  
    return (
      <View style={styles.Container} vertical={true}>
            {threadWithUserProfile.map((item,i) => (
                <View key={i} style={styles.ContentContainer}>
                    <View >
                        <TouchableOpacity style={styles.Header} onPress={() => {handleUser(item.username)}}>
                          {item.profile.avatar_url ? (
                              <Image source={item.profile.avatar_url} style={styles.UserImage} />
                            ):(
                              <View style={styles.UserAvatarContainer}>
                                <Text style={styles.UserAvatarText}>
                                  {displayText}
                                </Text>
                              </View>
                            )
                          }
                          
                          <View style={styles.UserDetails}>
                            <Text style={styles.FullName}>{item.profile.full_name}</Text>
                            <Text style={styles.UserName}>@{item.username}</Text>
                          </View>
                        </TouchableOpacity>
                        <Text style={styles.Position}>{item.timestamp}</Text>
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
      gap:10
    },
    UserImage: {
      width: 50,
      aspectRatio: 1,
      borderRadius: 25,
      backgroundColor: 'red'
    },
    UserName: {
      fontWeight: '400',
      marginBottom: 5,
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
    },
    UserAvatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 50,
      marginBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'center',
      backgroundColor: 'lightblue',
    },
    UserAvatarText: {
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'center',
      position: 'absolute',
      fontSize: 26,
      top: '30%',
      left: '48%',
      transform: [{ translateX: -7 }, { translateY: -11 }],
      color: 'red',
    },
  });

export default Thread;
