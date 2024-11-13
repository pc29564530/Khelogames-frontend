import React, {useEffect} from 'react';
import {View, Image, Text} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { getThreadComment } from '../services/commentServices';

function Comment({thread}) {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const comments = useSelector((state) => state.comments.comments);

    //Implementing redux
    const fetchThreadComments = async () => {
        getThreadComment({dispatch: dispatch, axiosInstance: axiosInstance, threadId: thread.id})
    };

    useEffect(() => {
        fetchThreadComments();   
    }, []);

    return (
        <View style={tailwind`flex-1 bg-black`}>
            <Text style={tailwind`flex-1 h-10 text-white text-6x3 mt-3`}>Comments</Text>
            <View style={tailwind`flex-1 items-center p-1`}>
                {comments?.map((item, i) => (
                    <View  style={tailwind`p-2 m-0.5 w-full`} key={i}>
                        <View style={tailwind`flex-row`}>
                            {item.profile && item.profile.avatar_url ? (
                                <Image  style={tailwind`w-10 h-10 rounded-full mr-2 bg-white`} source={{uri: item.profile.avatar_url}} />
                            ): (
                                <View style={tailwind`w-10 h-10 rounded-12 bg-white items-center justify-center`}>
                                    <Text style={tailwind`text-red-500 text-6x3`}>
                                    {item.displayText}
                                    </Text>
                              </View>
                            )}
                            <View style={tailwind`px-2 w-75`}>
                                <Text style={tailwind`text-white font-bold text-4x2`}>{item.profile?.full_name}</Text>
                                <Text style={tailwind`text-white font-bold`}>@{item.owner}</Text>
                                <Text style={tailwind`text-base text-white mt-4`}>{item.comment_text}</Text>
                                <View style={tailwind`border-b border-white mt-2 w-100`}></View>
                            </View>
                        </View>                        
                    </View>
                ))}
            </View>
        </View>
    );
}

export default Comment;