import React from 'react';
import { Text, View, Pressable, Modal } from 'react-native';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import Modal from 'react-native-modal';

const AddContent = ({closeModal, navigation }) => {
  const handleCreateThread = () => {
    navigation.navigate('CreateThread');
    closeModal();
  };

  const handleShorts = () => {
    navigation.navigate('Shorts');
    closeModal();
  };

  return (
      <View style={tailwind`bg-white p-4 h-60`}>
        <View style={tailwind`flex-row justify-end`}>
          <Text style={tailwind`text-2xl font-bold`}>Create</Text>
          <Pressable onPress={closeModal}>
            <FontAwesome name="close" color="black" size={24} />
          </Pressable>
        </View>
        <View>
          <Pressable style={tailwind`h-12 flex-row gap-5 items-center`} onPress={handleCreateThread}>
            <FontAwesome name="feed" color="black" size={24} style={tailwind`mt-1`} />
            <Text style={tailwind`text-2xl`}>Post Thread</Text>
          </Pressable>
          <Pressable style={tailwind`h-12 flex-row gap-5 items-center`} >
            <FontAwesome name="video-camera" color="black" size={24} style={tailwind`mt-1`} />
            <Text style={tailwind`text-2xl`}>Video</Text>
          </Pressable>
          <Pressable style={tailwind`h-12 flex-row gap-5 items-center`} onPress={handleShorts}>
            <FontAwesome name="paperclip" color="black" size={24} style={tailwind`mt-1`} />
            <Text style={tailwind`text-2xl`}>Short</Text>
          </Pressable>
        </View>
      </View>
  );
};

export default AddContent;