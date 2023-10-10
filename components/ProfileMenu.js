import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, StyleSheet, TouchableOpacity, Image, Button} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import {logout,setAuthenticated, setFollowUser, setUnFollowUser, getFollowingUser} from '../redux/actions/actions';

const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function ProfileMenu(){
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const route = useRoute();
    const following_owner  = route.params?.username

    const following = useSelector((state) => state.user.following);
    const [isFollowing, setIsFollowing] = useState(following.some((item) => item === following_owner));
    const [showLogoutButton, setShowLogoutButton] = useState(false)
    const [currentUser, setCurrentUser] = useState('');
     
    const handleLogout =  async () => {
        try {
            dispatch(logout());
            await AsyncStorage.removeItem('AccessToken');
            await AsyncStorage.removeItem('RefreshToken');
            
            navigation.navigate('SignIn'); 
        } catch (err) {
            console.log('Failed to logout', err);
        }
    }

    const handleReduxFollow = async () => {
      try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axios.post(
            `http://192.168.0.105:8080/create_follow/${following_owner}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if(response.statusCode === 200 ) {
            dispatch(setFollowUser(response.data));
          }
      } catch (err) {
          console.error(err);
      }
     
    }
    const handleReduxUnFollow = async () => {
      try {
        console.log("line no 790")
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axios.delete(
          `http://192.168.0.105:8080/unFollow/${following_owner}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if(response.statusCode === 200 ) {
          dispatch(setUnFollowUser(response.data));
        } 
    } catch(e){
      console.error('Unable to unfollow agian', e);
    }
  }

    const handleFollowButton = async () => {
     if(isFollowing) {
        handleReduxUnFollow();
     } else {
        handleReduxFollow();
     }
     
    }
    const fetchFollowing = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axios.get('http://192.168.0.105:8080/getFollowing', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            }
        })
        const item = response.data;
        if(item === null) {
           dispatch(getFollowingUser([]));
        } else {
            dispatch(getFollowingUser(item));
        }
    } catch (e) {
        console.error(e);
    }
    }
    useEffect(() =>{
        fetchFollowing(); 
        setIsFollowing(following.some((item) => item === following_owner))
        const verifyUser = async () => {
        const authUser = await AsyncStorage.getItem("User");
        if(following_owner===undefined || following_owner === null) {
          setShowLogoutButton(true);
          setCurrentUser(authUser);
        } else {
          setCurrentUser(following_owner);
        }
      }
      verifyUser();
    }, [following, following_owner])

    
    return (
        <View style={styles.Container}>
              <View style={styles.ProfileHeader}>
                <Image style={styles.UserAvatar} source={logoPath} />
                <Text style={styles.FullName}>{currentUser}</Text>
                <Text style={styles.Username}>@{currentUser}</Text>
                <View style={styles.FollowRow}>
                  <Text style={styles.FollowRowText}>0 Followers</Text>
                  <Text style={styles.FollowRowText}> | </Text>
                  <Text style={styles.FollowRowText}>0  Following</Text>
                  <Text style={{
                      borderBottomColor: 'black',
                      borderBottomWidth: 10,  
                    }}
                  />
                </View>
              </View>
              { showLogoutButton?(
                  <TouchableOpacity onPress={() => handleLogout()} style={styles.LogoutButton}>
                    <Text style={styles.Logout}>Logout</Text>
                  </TouchableOpacity>
                 ):(
                  <TouchableOpacity style={styles.FollowButton} onPress={handleFollowButton} >
                    <Text>{isFollowing ? 'Following' : 'Follow'}</Text>
                  </TouchableOpacity>
                )
              } 
        </View>
    );
}

const styles = StyleSheet.create({
    FullName: {
      paddingTop: 20,
      fontSize: 24, 
      fontWeight: 'bold',
    },
    Username: {
      fontSize: 20,
      paddingBottom: 20
    },
    ProfileHeader: {
      paddingBotton: 20,
      marginBottom: 20
    },
    FollowRowText: {
      fontSize: 16
    },
    ProfileHeaderText: {
      fontSize: 20
    },
    FollowRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignContent: 'center',
      alignItems: 'center',

    },
    Container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    Title: {
      fontSize: 22,
      color: 'grey',
      fontWeight: '500',
      marginTop: 30,
    },
    Logout: {
      fontSize: 15,
      color: 'white',
      fontWeight: '500',
    },
    LogoutButton: {
      backgroundColor: 'grey',
      padding: 12,
      borderRadius: 20,
      width: '90%',
      alignItems: 'center',
      marginBottom: 30,
    },
    FollowButton: {
      backgroundColor: 'grey',
      color: 'white',
      padding: 12,
      borderRadius: 20,
      width: '34%',
      alignItems: 'center',
      // marginBottom: 30,
    },
    UserAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: 'grey',
    },
  });
  

export default ProfileMenu;