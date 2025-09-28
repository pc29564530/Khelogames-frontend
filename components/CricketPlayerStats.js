import React, {useState} from 'react';
import {Dimensions, Pressable, Text, View} from 'react-native';
import tailwind from 'twrnc';
import CricketPlayerBattingStats from './CricketPlayerBattingStats';
import CricketPlayerBowlingStats from './CricketPlayerBowlingStats';
import Animated, {useSharedValue, useAnimatedScrollHandler} from 'react-native-reanimated';
   
export const CricketPlayerStats = ({player, parentScrollY, headerHeight, collapsedHeader}) => {
    const [activeTab, setActiveTab] = useState("batting");
    const [loading, setLoading] = useState(false);
    const {height: sHeight, width: sWidth} = Dimensions.get("window");
    const currentScrollY = useSharedValue(0);
    
    const handlerScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            if(parentScrollY === collapsedHeader){
                parentScrollY.value = currentScrollY;
            } else {
                parentScrollY.value = event.contentOffset.y;
            }
        }
    });

    return (
        <Animated.ScrollView 
            style={tailwind`bg-white`}
            onScroll={handlerScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 100,
                minHeight: sHeight
            }}
        >
            {/* Simple Tab Buttons */}
            <View style={tailwind`flex-row mx-4 mb-6`}>
                <Pressable
                    onPress={() => setActiveTab("batting")}
                    style={[
                        tailwind`flex-1 py-3 mr-2 rounded-lg`,
                        activeTab === "batting" 
                            ? tailwind`bg-red-400` 
                            : tailwind`bg-white border border-red-400`
                    ]}
                >
                    <Text style={[
                        tailwind`text-center font-medium`,
                        activeTab === "batting" 
                            ? tailwind`text-white` 
                            : tailwind`text-red-400`
                    ]}>
                        Batting
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setActiveTab("bowling")}
                    style={[
                        tailwind`flex-1 py-3 ml-2 rounded-lg`,
                        activeTab === "bowling" 
                            ? tailwind`bg-red-400` 
                            : tailwind`bg-white border border-red-400`
                    ]}
                >
                    <Text style={[
                        tailwind`text-center font-medium`,
                        activeTab === "bowling" 
                            ? tailwind`text-white` 
                            : tailwind`text-red-400`
                    ]}>
                        Bowling
                    </Text>
                </Pressable>
            </View>

            {/* Content */}
            <View style={tailwind`px-4`}>
                {activeTab === "batting" && (
                    <CricketPlayerBattingStats playerPublicID={player.public_id} />
                )}
                {activeTab === "bowling" && (
                    <CricketPlayerBowlingStats playerPublicID={player.public_id} />
                )}
            </View>
        </Animated.ScrollView>
    );
}

export default CricketPlayerStats;