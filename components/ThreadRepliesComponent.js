import React, {useState, useEffect} from "react";
import { View, Text, Image } from "react-native";
import useAxiosInterceptor from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tailwind from "twrnc";

const ThreadRepliesComponent = ({owner}) => {
    console.log("Owner: ", owner)
    const usernameInitial = owner ? owner.charAt(0):"";
    const displayText = usernameInitial.toUpperCase(); 
    const axiosInstance = useAxiosInterceptor();
    const [comment, setComment] = useState([]);
    const [repliesWithProfile, setRepliesWithProfile] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken')
                console.log(authToken)
                const response = await axiosInstance.get(`${BASE_URL}/getCommentByUser/${owner}`,null, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const profileData = response.data.map( async (item, index) => {
                    const response = await axiosInstance.get(`${BASE_URL}/getProfile/${item.owner}`, null, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    // if(!profileData.data && profileData.data === null) {
                    //     setRepliesWithProfile([]);
                    // } else {

                    // }
                    return {...item, profile: response.data};
                
                });
                const data = await Promise.all(profileData)
                setRepliesWithProfile(data)


                if(response.data === null || !response.data) {
                    setComment([]);
                } else {
                    setComment(response.data)
                }
                
            } catch (err) {
                console.error("error unable to get the replies ", err)
            }
        }
        fetchData();
        return
    }, [owner]);
    console.log("Comment: ", comment)
    return(
        <View style={tailwind`flex-1 bg-black`}>
            {repliesWithProfile?.map((item, i) => (
                    <View  style={tailwind`p-2 m-0.5 w-full`} key={i}>
                        <View style={tailwind`flex-row gap-2`}>
                            {item.profile && item.profile.avatar_url ? (
                                <Image  style={tailwind`w-10 h-10 rounded-full mr-2 bg-white`} source={{uri: item.profile.avatar_url}} />
                            ): (
                                <View style={tailwind`w-10 h-10 rounded-12 bg-white items-center justify-center`}>
                                    <Text style={tailwind`text-red-500 text-6x3`}>
                                    {displayText}
                                    </Text>
                              </View>
                            )}
                            <View style={tailwind`px-2 w-75 bg-gray-400 rounded`}>
                                <Text style={tailwind`text-white font-bold`}>{item.profile?.full_name}</Text>
                                <Text style={tailwind`text-white font-bold`}>@{item.owner}</Text>
                                <View style={tailwind`m-4`}>
                                    <Text style={tailwind`text-base text-white`}>{item.comment_text}</Text>
                                </View>
                            </View>
                        </View>
                        
                    </View>
                ))}
        </View>
    );
}
export default ThreadRepliesComponent;