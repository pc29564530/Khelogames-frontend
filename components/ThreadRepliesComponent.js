import React, { useState, useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import useAxiosInterceptor from "../screen/axios_config";
import { AUTH_URL, BASE_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tailwind from "twrnc";
import ThreadItem from "./ThreadItems";
import { handleLikes, handleThreadComment, handleUser } from "../utils/ThreadUtils";

const ThreadRepliesComponent = ({ owner }) => {
    const usernameInitial = owner ? owner.charAt(0) : "";
    const displayText = usernameInitial.toUpperCase();
    const axiosInstance = useAxiosInterceptor();
    const [thread, setThread] = useState([]);
    const [profile, setProfile] = useState([]);
    const [repliesWithProfile, setRepliesWithProfile] = useState([]);
    const [threadId, setThreadId] = useState([]);
    const [hasReplies, setHasReplies] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getCommentByUser/${owner}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (response.data === null || response.data.length === 0) {
                    setHasReplies(false);
                    return;
                }
                
                const threadId = response.data.map(item => item.thread_id);
                setThreadId(threadId);
                
                const threadPromise = threadId.map(async (item) => {
                    try {
                        const response = await axiosInstance.get(`${BASE_URL}/getThread/${item}`, {
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            },
                        });
                        return response.data;
                    } catch (error) {
                        console.error("Error fetching thread data:", error);
                        return null;
                    }
                });
                const threadData = await Promise.all(threadPromise);
                
                const threadDataWithProfile = threadData.map(async (item) => {
                    const response = await axiosInstance.get(`${AUTH_URL}/getProfile/${item.username}`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    const timestamp = item.created_at;
                    const timeDate = new Date(timestamp);
                    const options = { month: 'long', day: '2-digit' };
                    const formattedTime = timeDate.toLocaleString('en-US', options);
                    item.created_at = formattedTime;
                    return { ...item, profile: response.data };
                });
                
                const responseResult = await Promise.all(threadDataWithProfile);
                setRepliesWithProfile(responseResult);
            } catch (err) {
                console.error("error unable to get the replies ", err);
            }
        };
        fetchData();
    }, [owner]);

    return (
        <ScrollView style={tailwind`flex-1 bg-white`} nestedScrollEnabled={true}>
            {!hasReplies ? (
                <View style={tailwind`flex-1 m-2 shadow-lg bg-white h-60 items-center justify-center`}>
                    <Text style={tailwind`text-black text-xl`}>Not replied yet</Text>
                </View>
            ) : (
                repliesWithProfile.map((item, i) => (
                    <ThreadItem
                        key={i}
                        item={item}
                        handleUser={handleUser}
                        handleLikes={handleLikes}
                        handleThreadComment={handleThreadComment}
                    />
                ))
            )}
        </ScrollView>
    );
};

export default ThreadRepliesComponent;
