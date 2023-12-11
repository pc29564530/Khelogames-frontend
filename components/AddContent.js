import React from 'react';
import {Text, View, Modal, Pressable} from 'react-native';
import tailwind from 'twrnc';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const AddContent = ({closeModal}) => {
    const navigation = useNavigation();
    const handleCreateThread = () => {
        navigation.navigate('CreateThread');
    }
    const handleClose = () => {
        closeModal();
    }
    return (
            <View style={tailwind`mt-1`}>
                <View style={tailwind` flex-row justify-between h-20`}>
                    <Text style={tailwind` text-2xl font-bold`}>Create</Text>
                    <Pressable onPress={handleClose}>
                        <FontAwesome name="close" color="black" size={24} />
                    </Pressable>
                </View>
                <View>
                    <Pressable style={tailwind`h-12 flex-row gap-5`} onPress={handleCreateThread}>
                        <FontAwesome name="feed" color="black" size={24} style={tailwind`mt-1`}/>
                        <Text style={tailwind` text-2xl `}>Post Thread</Text>
                    </Pressable>
                    <Pressable style={tailwind`h-12 flex-row gap-5`}>
                        <FontAwesome name="video-camera" color="black" size={24} style={tailwind`mt-1`}/>
                        <Text style={tailwind` text-2xl `}>Video</Text>
                    </Pressable>
                    <Pressable style={tailwind`h-12 flex-row gap-5 `}>
                        <FontAwesome name="paperclip" color="black" size={24} style={tailwind`mt-1`}/>
                        <Text style={tailwind` text-2xl`}>Short</Text>
                    </Pressable>
                </View>
            </View>
    );
}

export default AddContent;