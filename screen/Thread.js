import { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import tailwind from 'twrnc';
import ThreadItem from '../components/ThreadItems';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';
import {getAllThreadServices} from '../services/threadsServices';
import { handleInlineError } from '../utils/errorHandler';
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
                //Added ui when no thread is added
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
            <ActivityIndicator size="large" color="#f97316" />
        </View>
        );
    }

    // if (error && threads.length === 0) {
    //     return (
    //         <View style={tailwind`flex-1 items-center justify-center bg-white px-6`}>
    //             <Text style={tailwind`text-6xl mb-4`}>⚠️</Text>
    //             <Text style={tailwind`text-lg font-semibold mb-2`}>
    //             Something went wrong
    //             </Text>
    //             <Text style={tailwind`text-gray-500 text-sm text-center mb-6`}>
    //             {error}
    //             </Text>
    //             <TouchableOpacity
    //             onPress={fetchData}
    //             style={tailwind`bg-orange-500 px-6 py-3 rounded-lg`}
    //             >
    //             <Text style={tailwind`text-white font-semibold`}>Try Again</Text>
    //             </TouchableOpacity>
    //         </View>
    //         );
    // }

    return (
        <View style={tailwind`flex-1 bg-white`} vertical={true}>
            {error.global && threads.length === 0 && (
                <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
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
