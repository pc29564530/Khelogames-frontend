import { ScrollView, Text, View, Pressable } from 'react-native';
import useAxiosInterceptor from './axios_config';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
const mainCommunities = ["Football", "Chess", "VolleyBall", "Hockey"];

function JoinCommunity() {
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    
    const handleCommunity = async (item) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            await axiosInstance.post(`${BASE_URL}/addJoinedCommuity`, {community_name: item}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
        } catch (err) {
            console.error("unable to join the community", err);
        }
    };

    const handleNextScreen = () => {
        navigation.navigate('Home');
    };

    return (
        <View style={tailwind`flex-1 bg-black`}>
            <View style={tailwind`h-16 bg-black border-b-2 border-grey flex items-center justify-center`}>
                <Text style={tailwind`text-center text-lg text-white font-bold`} >Join Community</Text>
            </View>
            <ScrollView style={tailwind`p-5 m-2`} >
                {mainCommunities.map((item, index) => (
                    <View key={index} style={tailwind`flex justify-between  h-16 border-b-2 border-white flex-row p-5`}>
                            <Text style={tailwind`text-lg text-white font-bold`}>{item}</Text>
                            <Pressable style={tailwind`bg-gray-500 h-8 pt- p-5 w-16 items-center p-1`} onPress={() => handleCommunity(item)}>
                                <Text style={tailwind`text-white font-bold text-xl`}>Join</Text>
                            </Pressable>
                    </View>
                ))}
            </ScrollView>
            <View style={tailwind`bg-white p-10 w-full items-center bg-black items-end` } >
                <Pressable style={tailwind`bg-gray-500 rounded-md p-4 w-18 `} onPress={() => handleNextScreen()}>
                    <Text style={tailwind`text-white font-bold text-lg`} >Next</Text>
                </Pressable>
            </View>    
        </View>
    );
}

export default JoinCommunity;
