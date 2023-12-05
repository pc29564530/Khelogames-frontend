import React, {useState, useEffect} from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import tailwind from 'twrnc';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import { useBottomTabNavigationConfig } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PostByCommunity from './PostByCommuntiy';
import CommunityMember from './CommunityMember';

function CommunityPage({route}) {
    const TopTab = createMaterialTopTabNavigator();
    const [joinedCommunity, setJoinedCommunity] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    const communityPageData = route.params?.item;
    console.log("Route Data: ", route.params)
    console.log("CommunityPage Data: ", communityPageData)
    
    const fetchCommunityJoinedByUser = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`http://192.168.0.101:8080/getCommunityByUser`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setJoinedCommunity(response.data);
        } catch (e) {
            console.error('Unable to get the joined communities', e);
        }
    };

    //to join any community from the community list
    const handleJoinCommunity = async (item) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            await axiosInstance.post(`http://192.168.0.101:8080/joinUserCommunity/${item}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            setJoinedCommunity(((prevCommunities)=> [...prevCommunities, item]));
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchCommunityJoinedByUser();
    },[])

    return (
        <View style={tailwind`bg-black flex-1`}>
            <View style={tailwind`bg-red-500 h-50`}>
                <FontAwesome name="close" size={25} color="white"/>
            </View>
            <Image source={logoPath} style={tailwind`bg-white h-20 w-20 rounded-md pl-2 ml-2 -mt-8 `}/>
            <View style={tailwind`p-5 gap-4 flex-row`}>
                <View>
                    <Text style={tailwind`text-white font-bold text-2xl`}>{communityPageData.communities_name}</Text>
                    <Text style={tailwind`text-white text-`}>{communityPageData.description}</Text>
                </View>
                <Pressable
                    style={tailwind`w-1/5 h-9 rounded-md ${
                        joinedCommunity.some(c => c.community_name === communityPageData.communities_name)
                            ? 'bg-gray-500'
                            : 'bg-blue-500'
                    } p-2 m-3 justify-center`}
                    onPress={() => handleJoinCommunity(communityPageData.communities_name)}
                >
                    <Text style={tailwind`text-white pl-1.5`}>
                        {joinedCommunity.some(c => c.community_name === communityPageData.communities_name) ? 'Joined' : 'Join'}
                    </Text>
                </Pressable>
            </View>
            <View style={tailwind`flex-row gap-3`}>
                <FontAwesome name="user" color="white" size={14} style={tailwind`pl-4`}/>
                <Text style={tailwind`text-white text-sm -mt-1`}>20</Text>
            </View>
            <TopTab.Navigator
                screenOptions={{
                    tabBarLabelStyle:tailwind`text-white`,
                    tabBarStyle:tailwind`bg-black`
                }}
            >   
                <TopTab.Screen 
                    name="PostByCommunity"
                    component={PostByCommunity}
                />
                <TopTab.Screen 
                    name="CommunityMember"
                    component={CommunityMember}
                    initialParams={{communityPageData: communityPageData}}
                />
            </TopTab.Navigator>
        </View>
    )
}

export default CommunityPage;
