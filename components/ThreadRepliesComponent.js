import React, {useState, useEffect} from "react";
import { ScrollView } from "react-native";
import useAxiosInterceptor from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tailwind from "twrnc";
import ThreadItem from "./ThreadItems";
import { handleLikes, handleThreadComment, handleUser } from "../utils/ThreadUtils";

const ThreadRepliesComponent = ({owner}) => {
    const usernameInitial = owner ? owner.charAt(0):"";
    const displayText = usernameInitial.toUpperCase(); 
    const axiosInstance = useAxiosInterceptor();
    const [thread, setThread] = useState([]);
    const [profile, setProfile] = useState([]);
    const [repliesWithProfile, setRepliesWithProfile] = useState([]);
    const [threadId, setThreadId] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(owner)
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getCommentByUser/${owner}`,null, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const threadId = response.data.map( item => item.thread_id);
                setThreadId(threadId);
                const threadPromise = threadId.map(async (item) => {
                    try {
                        const response = await axiosInstance.get(`${BASE_URL}/getThread/${item}`, null,{
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            },
                        });
                        return response.data
                    } catch (e) {
                        console.error("Error fetching thread data:", error);
                        return null
                    }
                });
                const threadData = await Promise.all(threadPromise);
                const threadDataWithProfile = threadData.map(async (item,i) => {
                    const response = await axiosInstance.get(`${BASE_URL}/getProfile/${item.username}`, null, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    const timestamp  = item.created_at;
                    const timeDate = new Date(timestamp)
                    const options = { month:'long', day:'2-digit'}
                    const formattedTime = timeDate.toLocaleString('en-US', options)
                    item.created_at = formattedTime;
                    return {...item, profile: response.data};
                } );
                const responseResult = await Promise.all(threadDataWithProfile)
                setRepliesWithProfile(responseResult)
                
            } catch (err) {
                console.error("error unable to get the replies ", err)
            }
        }
        fetchData()
    }, [owner]);
    return(
        <ScrollView style={tailwind`flex-1 bg-black`} nestedScrollEnabled={true}>
            {repliesWithProfile?.map((item, i) => (
                <ThreadItem
                    key={i}
                    item={item}
                    handleUser={handleUser}
                    handleLikes={handleLikes}
                    handleThreadComment={handleThreadComment}
                />
            ))}
        </ScrollView>
    );
}
export default ThreadRepliesComponent;