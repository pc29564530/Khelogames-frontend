import { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import tailwind from 'twrnc';
import ThreadItem from '../components/ThreadItems';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';
import {getAllThreadServices} from '../services/threadsServices';
import { handleInlineError } from '../utils/errorHandler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { setThreads } from '../redux/actions/actions';

const Thread = () => {
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const threadData = await getAllThreadServices();
            const item = threadData.data;
            if(item.success && item.data.length === 0) {
                setError({
                    global: null,
                    fields: {},
                });
            }
            dispatch(setThreads(item || []))
        } catch (err) {
            setError({
                global: "Unable to get all thread",
                fields: {},
            });
            console.error("Failed to get threads: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && threads.length === 0) {
        return (
        <View style={tailwind`flex-1 items-center justify-center bg-white`}>
            <ActivityIndicator size="large" color="#f87171" />
        </View>
        );
    }

    if (error.global && threads.length === 0) {
        return (
            <View style={tailwind`flex-1 items-center justify-center bg-white px-8`}>
                <MaterialIcons name="wifi-off" size={40} color="#D1D5DB" />
                <Text style={tailwind`text-base font-semibold text-gray-900 mt-4 mb-1`}>Something went wrong</Text>
                <Text style={tailwind`text-gray-400 text-sm text-center mb-6`}>{error.global}</Text>
                <TouchableOpacity onPress={fetchData} style={tailwind`bg-red-400 px-8 py-3 rounded-full`}>
                    <Text style={tailwind`text-white text-sm font-semibold`}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={tailwind`flex-1 bg-white`} vertical={true}>
            {threads.length === 0 && !error.global && (
                <View style={tailwind`flex-1 items-center justify-center py-20`}>
                    <MaterialIcons name="chat-bubble-outline" size={40} color="#D1D5DB" />
                    <Text style={tailwind`text-gray-400 mt-4 text-center text-sm`}>No posts yet.{'\n'}Be the first to share something!</Text>
                </View>
            )}
            {error.global && threads.length === 0 && (
                <View style={tailwind`mx-4 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl`}>
                    <Text style={tailwind`text-red-400 text-sm`}>
                        {error.global}
                    </Text>
                </View>
            )}
            {threads.length > 0 && threads?.map((item) => (
              <ThreadItem
                key={item.public_id}
                item={item}
                handleUser={handleUser}
                handleLikes={handleLikes}
                handleThreadComment={handleThreadComment}
              />
            ))}
        </View>
    );
  };

export default Thread;
