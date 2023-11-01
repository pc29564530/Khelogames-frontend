import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, StyleSheet, TouchableOpacity, Image, Button} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import useAxiosInterceptor from './axios_config';
import {useSelector,useDispatch} from 'react-redux';
import {logout,setAuthenticated, setFollowUser, setUnFollowUser, getFollowingUser} from '../redux/actions/actions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

function ProfileMenu(){
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const route = useRoute();
    const following_owner  = route.params?.username

    const following = useSelector((state) => state.user.following);
    const [isFollowing, setIsFollowing] = useState(following.some((item) => item === following_owner));
    const [showLogoutButton, setShowLogoutButton] = useState(false)
    const [currentUser, setCurrentUser] = useState('');
    const [showMyCommunity, setShowMyCommunity] = useState(false);
    const [myCommunityData, setMyCommunityData] = useState([]);
    const [profileData, setProfileData] = useState([]);
    const [displayText, setDisplayText] = useState('');
     

    const handleProfilePage = () => {
      navigation.navigate('Profile');
    }

    const toggleMyCommunity = async () => {
        try {
          const user = await AsyncStorage.getItem('User')
          const authToken = await AsyncStorage.getItem('AccessToken')
          const response = await axiosInstance.get(`http://192.168.0.102:8080/getCommunityByUser`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })

          console.log(response.data);
          if(response.data){
            setMyCommunityData(response.data);
            
          } else {
            setMyCommunityData([]);
          }
          setShowMyCommunity(!showMyCommunity)
        } catch(err) {

        }
    }

    const handleLogout =  async () => {
        try {
            const username = await AsyncStorage.getItem('User')

            await axios.delete(`http://192.168.0.102:8080/removeSession/${username}`)
            dispatch(logout());
            await AsyncStorage.removeItem('AccessToken');
            await AsyncStorage.removeItem('RefreshToken');
            await AsyncStorage.removeItem('User');
        } catch (err) {
            console.log('Failed to logout', err);
        }
    }

    const handleReduxFollow = async () => {
      try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.post(
            `http://192.168.0.102:8080/create_follow/${following_owner}`,
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
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.delete(
          `http://192.168.0.102:8080/unFollow/${following_owner}`,
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
        const response = await axiosInstance.get('http://192.168.0.102:8080/getFollowing', {
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
    const fetchProfileData = async () => {
      try {
        const authUser = await AsyncStorage.getItem("User");
        console.log(authUser)
        const response = await axios.get(`http://192.168.0.102:8080/getProfile/${authUser}`);
        console.log("response data: ", response.data)
        console.log("Avatar Url: ", response.data.avatar_url)
        if (!response.data.avatar_url || response.data.avatar_url === '') {
          const usernameInitial = response.data.owner ? response.data.owner.charAt(0) : '';
          setDisplayText(usernameInitial.toUpperCase());
        } else {
          setDisplayText(''); // Reset displayText if the avatar is present
        }
       
        setProfileData(response.data)
      } catch (err) {
        console.error("unable to fetch the profile data: ", err);
      }
    }
    useEffect(() =>{
        fetchFollowing(); 
        setIsFollowing(following.some((item) => item === following_owner))
        const verifyUser = async () => {
        const authUser = await AsyncStorage.getItem("User");
        console.log("Current User:", authUser)
        if(following_owner===undefined || following_owner === null) {
          setShowLogoutButton(true);
          setCurrentUser(authUser);
        } else {
          setCurrentUser(following_owner);
        }
      }
      fetchProfileData()
      verifyUser();
    }, [])

    return (
        <View style={styles.Container}>
              <View style={styles.ProfileHeader}>
                {profileData.avatar_url ? (
                  <Image style={styles.UserAvatar} source={profileData.avatar_url} />
                ) : (
                  <View style={styles.UserAvatarContainer}>
                    <Text style={styles.UserAvatarText}>
                      {displayText}
                    </Text>
                  </View>
                )}
                <Text style={styles.FullName}>{profileData.full_name}</Text>
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
                <View style={styles.BottomLine}></View>
              </View>
              <View style={styles.MiddleContainer}>
                <Pressable onPress={handleProfilePage}>
                  <Text style={styles.ProfileText}>Profile</Text>
                </Pressable>
                <View style={styles.BottomLine}></View>
              </View>
              {/* creating new my community for having my own community  */}
              <View style={styles.BottomContainer}>
                {showLogoutButton && 
                <View style={styles.MyCommunity}>
                      <TouchableOpacity style={styles.ToggleContainer} onPress={toggleMyCommunity}>
                          <Text style={styles.CommunityToggle}>My Community</Text>
                          <FontAwesome name={showMyCommunity?'angle-up':'angle-down'} size={20} color="black"/>
                      </TouchableOpacity>
                      {showMyCommunity && (
                        <View style={styles.CommunityList} > 
                          {myCommunityData.map((item,index)=> (
                            <Text style={styles.CommunityListItem}>{item.community_name}</Text>
                          ))}
                        </View>
                      )}
                </View>
                  }
                </View>
                <View >
                    <TouchableOpacity onPress={() => handleLogout()} style={styles.LogoutButton}>
                      <Text style={styles.Logout}>Logout</Text>
                    </TouchableOpacity>
              </View>
        </View>
    );
}

const styles = StyleSheet.create({
  
  FooterButton: {
    position: 'absolute',
    alignItems:'center',
    paddingLeft:10
  },
  LogoutButton: {

  },
  MiddleContainer: {
    height: 200
   },
    FullName: {
      paddingTop: 10,
      paddingLeft:10,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    Username: {
      paddingLeft:10,
      fontSize: 18,
      paddingBottom: 10,
      textAlign: 'left',
      color: 'gray',
    },
    ProfileHeader: {
      paddingBottom: 20,
      marginBottom: 20,
      paddingLeft:10,
      alignItems: 'left',
      marginTop: 10

    },
    FollowRowText: {
      fontSize: 20,
      color: 'gray',
    },
    ProfileHeaderText: {
      fontSize: 20
    },
    FollowRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignContent: 'center',
      alignItems: 'center',
      paddingLeft: 10

    },
    Container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      backgroundColor: '#f8f8f8',
    },
    Title: {
      fontSize: 22,
      color: 'gray',
      fontWeight: '500',
      marginTop: 30,
    },
    Logout: {
      fontSize: 15,
      color: 'white',
      fontWeight: '500',
    },
    LogoutButton: {
      paddingLeft:20,
      position: 'absolute',
      backgroundColor: 'grey',
      padding: 12,
      borderRadius: 20,
      width: '80%',
      alignItems: 'center',
      alignContent: 'center',
      marginBottom: 30,
    },
    FollowButton: {
      backgroundColor: '#007AFF',
      color: 'white',
      padding: 12,
      borderRadius: 20,
      width: '34%',
      alignItems: 'center',
    },
    UserAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    ProfileTextButton:{
      padding:20
      
    },
    ProfileText: {
      fontSize: 20,
      fontWeight: 'bold',
      paddingLeft:10
    },
    MyCommunity: {
      marginVertical: 20,
      alignItems: 'left',
    },
    ToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    CommunityToggle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 10,
    },
    CommunityList: {
        marginTop: 20,
    },
    CommunityListItem: {
        fontSize: 20,
        marginVertical: 0,
    },
    UserAvatarText: {
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'center',
      position: 'absolute',
      fontSize: 46,
      top: '30%',
      left: '48%',
      transform: [{ translateX: -13 }, { translateY: -13 }],
      color: 'red',
    },
    UserAvatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'center',
      backgroundColor: 'lightblue',
    },
    BottomLine: {
      position: 'absolute',
      bottom: 0,
      width: '80%',
      borderBottomWidth: 0.2,
      borderBottomColor: 'lightblack',
      marginTop:10
    },
  });
  

export default ProfileMenu;