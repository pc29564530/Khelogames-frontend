import React, {useEffect, useState, useCallback, memo} from 'react';
import {View, Image, Text, FlatList} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../screen/axios_config';
import tailwind from 'twrnc';
import { getThreadComment } from '../services/commentServices';
import { handleInlineError } from '../utils/errorHandler';
import { setComments, setThreads } from '../redux/actions/actions';

const CommentItem = memo(({item}) => {
    return (
        <View style={tailwind`p-2 m-0.5 w-full`}>
            <View style={tailwind`flex-row`}>
                {item.profile && item.profile.avatar_url ? (
                    <Image
                        style={tailwind`w-10 h-10 rounded-full mr-2 bg-red-400`}
                        source={{uri: item.profile.avatar_url}}
                    />
                ): (
                    <View style={tailwind`w-10 h-10 rounded-12 bg-red-400 items-center justify-center`}>
                        <Text style={tailwind`text-black text-6x3`}>
                            {item.displayText}
                        </Text>
                    </View>
                )}
                <View style={tailwind`px-2 flex-1`}>
                    <Text style={tailwind`text-black font-bold text-4x2`}>{item?.profile?.full_name}</Text>
                    <Text style={tailwind`text-black font-bold`}>@{item?.profile?.username}</Text>
                    <Text style={tailwind`text-base text-black mt-4`}>{item.comment_text}</Text>
                    <View style={tailwind`border-b border-gray-200 mt-2`}></View>
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
        <View style={tailwind`flex-1 items-center p-10`}>
            <Text style={tailwind`text-xl text-gray-400`}>No Comments</Text>
        </View>
    ), []);

    return (
        <View>
            {error?.global && comments.length === 0 && (
                <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        {error?.global}
                    </Text>
                </View>
            )}
            <FlatList
                data={comments}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={tailwind`p-1`}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={21}
                scrollEnabled={false}
            />
        </View>
    );
}

export default Comment;