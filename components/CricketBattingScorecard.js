import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tailwind from 'twrnc';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const CricketBattingScorecard = ({ battingData, setIsModalBattingVisible, handleUpdatePlayerBatting }) => {
    return (
        <View style={tailwind`bg-white rounded-lg shadow-md mb-4`}>
            {/* Header */}
            <View style={tailwind`flex-row justify-between px-6 py-2 bg-gray-200`}>
                <Text style={tailwind`text-md font-bold text-gray-700`}>Batter</Text>
                <View style={tailwind`flex-row justify-between gap-4`}>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>R</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>B</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>4s</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>6s</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>Edit</Text>
                </View>
            </View>

            {/* Batting Data */}
            {battingData?.innings?.map((item, index) => (
                <View key={index} style={tailwind`flex-row justify-between mb-2 px-6 py-2 bg-white`}>
                    <Text style={tailwind`text-md text-gray-800 flex-1`}>{item?.player?.name}</Text>
                    <View style={tailwind`flex-row justify-between gap-4 flex-1`}>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{item.runsScored}</Text>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{item.ballFaced}</Text>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{item.fours}</Text>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{item.sixes}</Text>
                        <Pressable onPress={() => handleUpdatePlayerBatting(item)}>
                            <MaterialIcon name="update" size={24} color="blue" />
                        </Pressable>
                    </View>
                </View>
            ))}

            {/* Add Next Batsman Button */}
            <Pressable onPress={() => { setIsModalBattingVisible(true) }} style={tailwind`mt-4 p-2 bg-blue-500 rounded-lg shadow-md`}>
                <Text style={tailwind`text-white text-center`}>Add Next Batsman</Text>
            </Pressable>
        </View>
    );
};

export default CricketBattingScorecard;