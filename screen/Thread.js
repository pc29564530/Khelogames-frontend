import { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, Pressable, ScrollView} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import tailwind from 'twrnc';
import ThreadItem from '../components/ThreadItems';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';
import {getAllThreadServices} from '../services/threadsServices';
import { handleInlineError } from '../utils/errorHandler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { setThreads } from '../redux/actions/actions';
import { useNavigation } from '@react-navigation/native';

const Thread = () => {
    const navigation = useNavigation();
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
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a'}}>
            <ActivityIndicator size="large" color="#f87171" />
        </View>
        );
    }

    if (error.global && threads.length === 0) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', paddingHorizontal: 32}}>
                <MaterialIcons name="wifi-off" size={40} color="#475569" />
                <Text style={{color: '#f1f5f9', fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 4}}>Something went wrong</Text>
                <Text style={{color: '#94a3b8', fontSize: 14, textAlign: 'center', marginBottom: 24}}>{error.global}</Text>
                <TouchableOpacity onPress={fetchData} style={tailwind`bg-red-400 px-8 py-3 rounded-full`}>
                    <Text style={tailwind`text-white text-sm font-semibold`}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={{flex: 1, backgroundColor: '#0f172a'}} vertical={true}>
                {threads.length === 0 && !error.global && (
                    <View style={tailwind`flex-1 items-center justify-center py-20`}>
                        <MaterialIcons name="chat-bubble-outline" size={40} color="#475569" />
                        <Text style={{color: '#94a3b8', marginTop: 16, textAlign: 'center', fontSize: 14}}>No posts yet.{'\n'}Be the first to share something!</Text>
                    </View>
                )}
                {error.global && threads.length === 0 && (
                    <View style={[tailwind`mx-4 mb-3 p-3 rounded-xl`, {backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1}]}>
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
            </ScrollView>
            <View style={tailwind`absolute bottom-14 right-5`}>
                <Pressable
                    style={[tailwind`p-3.5 bg-red-400 rounded-2xl`, {shadowColor: '#f87171', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6}]}
                    onPress={() => navigation.navigate("CreateThread")}
                >
                    <MaterialIcons name="add" size={24} color="white" />
                </Pressable>
            </View>
        </>
        
    );
  };

export default Thread;
