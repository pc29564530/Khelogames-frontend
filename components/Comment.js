import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Image, Text, FlatList, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from '../screen/axios_config';
import tailwind from 'twrnc';
import { getThreadComment } from '../services/commentServices';
import { handleInlineError } from '../utils/errorHandler';
import { setComments, setThreads } from '../redux/actions/actions';

const CommentItem = memo(({item}) => {
    const avatarInitial = item?.profile?.full_name?.charAt(0)?.toUpperCase() || '?';

    return (
        <View style={tailwind`px-4 py-3 border-b border-gray-50`}>
            <View style={tailwind`flex-row`}>
                {item.profile?.avatar_url ? (
                    <Image
                        style={tailwind`w-10 h-10 rounded-full bg-gray-200`}
                        source={{uri: item.profile.avatar_url}}
                    />
                ) : (
                    <View style={tailwind`w-10 h-10 rounded-full bg-red-400 items-center justify-center`}>
                        <Text style={tailwind`text-white text-sm font-bold`}>
                            {avatarInitial}
                        </Text>
                    </View>
                )}
                <View style={tailwind`ml-3 flex-1`}>
                    <View style={tailwind`flex-row items-center`}>
                        <Text style={tailwind`text-gray-900 font-semibold text-sm`}>
                            {item?.profile?.full_name}
                        </Text>
                        <Text style={tailwind`text-gray-500 text-xs ml-2`}>
                            @{item?.profile?.username}
                        </Text>
                    </View>
                    <Text style={tailwind`text-gray-700 text-sm mt-1.5 leading-5`}>
                        {item.comment_text}
                    </Text>
                </View>
            </View>
        </View>
    );
});

function Comment({thread}) {
    const dispatch = useDispatch();
    const [error, setError] = useState({
        global: null,
        fields: {},
    });

    const [isLoading, setIsLoading] = useState(true);
    const comments = useSelector((state) => state.comments.comments);

    const fetchThreadComments = async () => {
        try {
            setIsLoading(true);
            const response = await getThreadComment({threadPublicID: thread.public_id});
            const item = response.data;
            dispatch(setComments(item || []));
        } catch(err) {
            const errorMessage = handleInlineError(err);
            setError({
                global: "Unable to get comment",
                fields: errorMessage,
            });
            console.error("Unable to get comment: ", err)
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchThreadComments();
    }, [thread.public_id]);

    const renderItem = useCallback(({item}) => (
        <CommentItem item={item} />
    ), []);

    const keyExtractor = useCallback((item, index) =>
        item?.id?.toString() || index?.toString(),
    []);

    const ListEmptyComponent = useCallback(() => (
        <View style={tailwind`items-center justify-center py-12`}>
            <View style={tailwind`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3`}>
                <MaterialIcons name="chat-bubble-outline" size={32} color="#9ca3af" />
            </View>
            <Text style={tailwind`text-gray-500 text-sm`}>No comments yet</Text>
            <Text style={tailwind`text-gray-400 text-xs mt-1`}>Be the first to comment!</Text>
        </View>
    ), []);

    const LoadingComponent = useCallback(() => (
        <View style={tailwind`items-center justify-center py-12`}>
            <ActivityIndicator size="small" color="#f87171" />
            <Text style={tailwind`text-gray-500 text-sm mt-3`}>Loading comments...</Text>
        </View>
    ), []);

    return (
        <View>
            {error?.global && !isLoading && comments.length === 0 && (
                <View style={tailwind`mx-4 my-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg`}>
                    <View style={tailwind`flex-row items-center`}>
                        <MaterialIcons name="error-outline" size={18} color="#dc2626" />
                        <Text style={tailwind`text-red-700 text-sm ml-2 flex-1`}>
                            {error?.global}
                        </Text>
                    </View>
                </View>
            )}
            {isLoading ? (
                <LoadingComponent />
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ListEmptyComponent={ListEmptyComponent}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={10}
                    windowSize={21}
                    scrollEnabled={false}
                />
            )}
        </View>
    );
}

export default Comment;