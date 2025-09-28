import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import tailwind from 'twrnc';
import CricketPlayerBattingStats from './CricketPlayerBattingStats';
import CricketPlayerBowlingStats from './CricketPlayerBowlingStats';
   
export const CricketPlayerStats = ({player}) => {
    const [activeTab, setActiveTab] = useState("batting");
    return (
        <View style={tailwind`p-2`}>
            <View style={tailwind`flex-row items-center justify-evenly mb-2`}>
                <Pressable
                    onPress={() => setActiveTab("batting")}
                    style={tailwind.style(
                    'rounded-lg items-center border p-2',
                    activeTab === "batting"
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-100 border-gray-300'
                    )}
                >
                        <Text style={tailwind`text-lg text-white font-semibold`}>Batting</Text>
                    </Pressable>
                <Pressable
                    onPress={() => setActiveTab("bowling")}
                    style={tailwind.style(
                    'rounded-lg items-center border p-2',
                    activeTab === "bowling"
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-100 border-gray-300'
                    )}
                >
                        <Text style={tailwind`text-lg text-white font-semibold`}>Bowling</Text>
                    </Pressable>
            </View>
            <View>
                {activeTab === "batting" && <CricketPlayerBattingStats  playerPublicID={player.public_id} />}
                {activeTab === "bowling" && <CricketPlayerBowlingStats playerPublicID = {player.public_id}/>}
            </View>
        </View>
    );
}