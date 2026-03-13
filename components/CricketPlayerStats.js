import React, { useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import tailwind from "twrnc";
import CricketPlayerBattingStats from "./CricketPlayerBattingStats";
import CricketPlayerBowlingStats from "./CricketPlayerBowlingStats";
import Animated, { useSharedValue, useAnimatedScrollHandler } from "react-native-reanimated";

export const CricketPlayerStats = ({ player, parentScrollY, headerHeight, collapsedHeader }) => {

  const [activeTab, setActiveTab] = useState("batting");

  const { height: sHeight } = Dimensions.get("window");

  const currentScrollY = useSharedValue(0);

  const handlerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (parentScrollY === collapsedHeader) {
        parentScrollY.value = currentScrollY.value;
      } else {
        parentScrollY.value = event.contentOffset.y;
      }
    },
  });

  return (
    <Animated.ScrollView
      style={[tailwind`flex-1`, { backgroundColor: "#0f172a" }]}
      onScroll={handlerScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 20,
        paddingBottom: 100,
        minHeight: sHeight,
      }}
    >

      {/* Tabs */}
      <View style={tailwind`flex-row mx-4 mb-6`}>

        {/* Batting */}
        <Pressable
          onPress={() => setActiveTab("batting")}
          style={[
            tailwind`flex-1 py-3 mr-2 rounded-lg`,
            activeTab === "batting"
              ? { backgroundColor: "#ef4444" }
              : {
                  backgroundColor: "#1e293b",
                  borderWidth: 1,
                  borderColor: "#334155",
                },
          ]}
        >
          <Text
            style={[
              tailwind`text-center font-semibold`,
              activeTab === "batting"
                ? { color: "#f1f5f9" }
                : { color: "#94a3b8" },
            ]}
          >
            Batting
          </Text>
        </Pressable>

        {/* Bowling */}
        <Pressable
          onPress={() => setActiveTab("bowling")}
          style={[
            tailwind`flex-1 py-3 ml-2 rounded-lg`,
            activeTab === "bowling"
              ? { backgroundColor: "#ef4444" }
              : {
                  backgroundColor: "#1e293b",
                  borderWidth: 1,
                  borderColor: "#334155",
                },
          ]}
        >
          <Text
            style={[
              tailwind`text-center font-semibold`,
              activeTab === "bowling"
                ? { color: "#f1f5f9" }
                : { color: "#94a3b8" },
            ]}
          >
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
};

export default CricketPlayerStats;