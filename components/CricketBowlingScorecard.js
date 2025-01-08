import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tailwind from 'twrnc';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const CricketBowlingScorecard = ({ bowlingData, setIsModalBowlingVisible, handleUpdatePlayerBowling, convertBallToOvers }) => {
    return (
        <View style={tailwind`bg-white rounded-lg shadow-md p-4 mb-4`}>
            {/* Header */}
            <View style={tailwind`flex-row justify-between px-6 py-2 bg-gray-200 rounded-lg`}>
                <Text style={tailwind`text-md font-bold text-gray-700`}>Bowler</Text>
                <View style={tailwind`flex-row justify-between gap-4`}>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>O</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>R</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>W</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>WD</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>NB</Text>
                    <Text style={tailwind`text-md font-bold text-gray-700`}>Edit</Text>
                </View>
            </View>

            {/* Bowling Data */}
            {bowlingData?.innings?.map((item, index) => (
                <View key={index} style={tailwind`flex-row justify-between px-6 py-2 bg-white border-b border-gray-200`}>
                    <Text style={tailwind`text-md text-gray-800 flex-1`}>{item?.player?.name}</Text>
                    <View style={tailwind`flex-row justify-between gap-4 flex-1`}>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{convertBallToOvers(item.ball)}</Text>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{item.runs}</Text>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{item.wickets}</Text>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{item.wide}</Text>
                        <Text style={tailwind`text-md text-gray-800 text-center`}>{item.noBall}</Text>
                        <Pressable onPress={() => handleUpdatePlayerBowling(item)}>
                            <MaterialIcon name="update" size={24} color="blue" />
                        </Pressable>
                    </View>
                </View>
            ))}

            {/* Add Next Bowler Button */}
            <Pressable onPress={() => setIsModalBowlingVisible(true)} style={tailwind`mt-4 p-2 bg-blue-500 rounded-lg shadow-md`}>
                <Text style={tailwind`text-white text-center`}>Add Next Bowler</Text>
            </Pressable>
        </View>
    );
};

export default CricketBowlingScorecard;