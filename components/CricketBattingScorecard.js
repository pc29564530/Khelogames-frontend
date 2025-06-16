import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tailwind from 'twrnc';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

const CricketBattingScorecard = ({ batting }) => {
    return (
        <View style={tailwind`bg-white mb-4 shadow-lg rounded-lg overflow-hidden`}>
            <View style={tailwind`flex-row justify-between px-6 py-2`}>
                <Text style={tailwind`text-md text-gray-700`}>Batter</Text>
                <View style={tailwind`flex-row justify-between gap-4`}>
                    <Text style={tailwind`text-md text-gray-700`}>R</Text>
                    <Text style={tailwind`text-md text-gray-700`}>B</Text>
                    <Text style={tailwind`text-md text-gray-700`}>4s</Text>
                    <Text style={tailwind`text-md text-gray-700`}>6s</Text>
                    <Text style={tailwind`text-md text-gray-700`}>S/R</Text>
                </View>
            </View>
            {/* Batting Data */}
            {batting?.map((item, index) => (
                <View key={index} style={tailwind`flex-row justify-between mb-2 px-6 py-2 ${item.is_striker ? 'bg-red-100': 'bg-white'}`}>
                    <View style={tailwind``}>
                        <View style={tailwind`flex-row`}>
                            <Text style={tailwind`text-md text-gray-800`}>{item?.player?.name}</Text>
                            {item.is_striker && <Text style={tailwind`text-md text-gray-800`}>*</Text>}
                        </View>
                        {item.batting_status && !item.is_currently_batting &&  (
                            <View style={tailwind`flex-row space-between`}>
                                {item.wicket_type==="Run Out" ? (
                                    <>
                                       <Text style={tailwind`text-sm`}>Run Out</Text>
                                    </>
                                ): (
                                    <>
                                        <Text style={tailwind`text-sm`}>b {item.bowler_name}</Text>
                                        <Text style={tailwind`text-sm`} >{item.wicket_type}</Text>
                                    </>
                                ) }
                                
                            </View>
                        )}
                    </View>
                    <View style={tailwind`flex-row justify-between gap-4`}>
                        <Text style={tailwind`text-md text-gray-800`}>{item.runs_scored}</Text>
                        <Text style={tailwind`text-md text-gray-800`}>{item.balls_faced}</Text>
                        <Text style={tailwind`text-md text-gray-800`}>{item.fours}</Text>
                        <Text style={tailwind`text-md text-gray-800`}>{item.sixes}</Text>
                        <Text style={tailwind`text-md text-gray-800`}>{ item.balls_faced > 0 ? ((item.runs_scored/item.balls_faced)*100.0).toFixed(1) : (0).toFixed(1)}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

export default CricketBattingScorecard;