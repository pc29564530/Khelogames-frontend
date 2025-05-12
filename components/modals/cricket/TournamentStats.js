import React from 'react';
import { Modal, View, Text, FlatList, Image, Pressable } from 'react-native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TournamentPlayerStatsRow from '../../TournamentPlayerStatsRow';

const TournamentPlayerStatsModal = ({ visible, onClose, title, data, type }) => {

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={tailwind`flex-1 bg-white p-4 mt-12 rounded-t-3xl`}>
                <View style={tailwind`flex-row justify-between items-center mb-4`}>
                    <Text style={tailwind`text-xl font-bold text-black`}>{title}</Text>
                    <Pressable onPress={onClose}>
                        <AntDesign name="close" size={24} color="black" />
                    </Pressable>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={type}/>
                    )}
                    contentContainerStyle={tailwind`px-4 pb-10`}
                    style={tailwind`flex-1`}
                />
            </View>
        </Modal>
    );
};

export default TournamentPlayerStatsModal;
