import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';

const PointTable = ({ standingsData, game }) => {
  let tableHead;
  let formattedData = [];
  if (Array.isArray(standingsData) && standingsData.length > 0) {
    if (game.name === 'football') {
      tableHead = ['M', 'W', 'D', 'L', 'GD', 'Pts'];
      formattedData = standingsData.map((item) => [
        item?.teams?.name,
        item.matches,
        item.wins,
        item.draw,
        item.loss,
        item.goal_difference,
        item.points,
      ]);
    } else if (game.name === 'cricket') {
      tableHead = ['M', 'W', 'L', 'D', 'Pts'];
      formattedData = standingsData.map((item) => [
        item?.teams?.name,
        item.matches,
        item.wins,
        item.loss,
        item.draw,
        item.points,
      ]);
    }
  }

  if (!formattedData?.length) return null;

  return (
    <View style={tailwind`overflow-hidden`}>
      {/* Table Header */}
      <View style={tailwind`flex-row px-3 py-3`}>
        <View style={tailwind`w-10 items-center justify-center`}>
          <Text style={tailwind`text-gray-400 text-xs font-medium`}>#</Text>
        </View>

        {/* Team column header */}
        <View style={tailwind`flex-1 ml-2 justify-center`}>
          <Text style={tailwind`text-gray-400 text-xs font-medium`}>Team</Text>
        </View>

        {/* Stats headers */}
        {tableHead.map((header, index) => (
          <View key={index} style={tailwind`w-8 justify-center`}>
            <Text
              style={tailwind`text-gray-400 text-xs font-medium text-center`}
            >
              {header}
            </Text>
          </View>
        ))}
      </View>

      {/* Table Rows */}
      {formattedData.map((row, rowIndex) => (
        <View key={rowIndex} style={tailwind`flex-row px-2 py-3`}>
          {/* Position */}
          <View style={tailwind`w-10 justify-center items-center`}>
            <Text style={tailwind`text-black text-sm font-semibold`}>
              {rowIndex + 1}
            </Text>
          </View>

          {/* Team */}
          <View style={tailwind`flex-1 ml-2 flex-row items-center`}>
            <Text
              style={tailwind`text-black text-sm font-medium flex-1`}
              numberOfLines={1}
            >
              {row[0]}
            </Text>
          </View>

          {/* Stats */}
          {row.slice(1).map((stat, statIndex) => {
            let isPoints = false;
            let isGoalDiff = false;

            if (game.name === 'football') {
              isGoalDiff = statIndex === row.length - 2; // GD
              isPoints = statIndex === row.length - 1; // Pts
            } else if (game.name === 'cricket') {
              isPoints = statIndex === row.length - 1; // last one always Pts
            }
            const goalDiff = isGoalDiff ? parseInt(stat) : 0;

            return (
              <View key={statIndex} style={tailwind`w-8 justify-center`}>
                <Text
                  style={tailwind`${
                    isPoints
                      ? 'text-black font-bold'
                      : isGoalDiff && goalDiff > 0
                      ? 'text-green-500 font-semibold'
                      : isGoalDiff && goalDiff < 0
                      ? 'text-red-500 font-semibold'
                      : 'text-gray-600'
                  } text-sm text-center`}
                >
                  {isGoalDiff && goalDiff > 0 ? `+${stat}` : stat || 0}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default PointTable;
