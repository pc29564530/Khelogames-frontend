import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
// import {FollowerData} from '../data/follwoer';
// import {FollowingData}  from '../data/follow.js';
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";
import Follower from './Follower';
import Following from './Following';


const TopTab = createMaterialTopTabNavigator();

function Follow() {

    // const [followerData, setFollowerData] = useState([]);
    // const [followingData, setFollowingData] = useState([]);


    return (
        <TopTab.Navigator>
            <TopTab.Screen 
                name="Follower"
                component={Follower}
             />
            <TopTab.Screen 
                name="Following"
                component={Following}
            />
        </TopTab.Navigator>
        // <View style={styles.container}>
        //     <View style={styles.followHeader}>
        //         <TouchableOpacity style={styles.followBlock} onPress={() => handleFollower()}>
        //             <Text>0 </Text>
        //             <Text>Followers</Text>
        //         </TouchableOpacity>
        //         <TouchableOpacity style={styles.followBlock} onPress={() => handleFollowing()}>
        //             <Text>0 </Text>
        //             <Text>Following</Text>
        //         </TouchableOpacity>
        //     </View>
        //     <Text style={{
        //         borderBottomColor: 'black',
        //         borderBottomWidth: 'StyleSheet.hairlineWidth',
        //         }}
        //     />
        // </View>
    );
}

const styles = StyleSheet.create({
    followHeader: {
        flexDirection: 'row',
    }, 
    followBlock: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignContent: 'center',
      alignItems: 'center',

    },
    container: {
      paddingTop: '10px',
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
  });

export default Follow;