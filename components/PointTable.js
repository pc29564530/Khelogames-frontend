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

  // How many teams qualify (top 2 by default)
  const qualifyCount = 2;

  return (
    <View style={tailwind`overflow-hidden`}>
      {/* Table Header */}
      <View style={tailwind`flex-row px-3 py-2.5 bg-gray-50 border-b border-gray-100`}>
        <View style={tailwind`w-8 items-center justify-center`}>
          <Text style={tailwind`text-gray-400 text-xs font-semibold`}>#</Text>
        </View>

        {/* Team column header */}
        <View style={tailwind`flex-1 ml-2 justify-center`}>
          <Text style={tailwind`text-gray-400 text-xs font-semibold`}>Team</Text>
        </View>

        {/* Stats headers */}
        {tableHead.map((header, index) => {
          const isLast = index === tableHead.length - 1;
          return (
            <View key={index} style={[tailwind`justify-center`, isLast ? tailwind`w-10` : tailwind`w-8`]}>
              <Text
                style={[
                  tailwind`text-xs font-semibold text-center`,
                  isLast ? tailwind`text-gray-900` : tailwind`text-gray-400`
                ]}
              >
                {header}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Table Rows */}
      {formattedData.map((row, rowIndex) => {
        const isQualified = rowIndex < qualifyCount;
        const isLast = rowIndex === formattedData.length - 1;

        return (
          <View
            key={rowIndex}
            style={[
              tailwind`flex-row px-3 py-3 items-center`,
              !isLast && tailwind`border-b border-gray-50`,
            ]}
          >
            {/* Position with qualification indicator */}
            <View style={tailwind`w-8 justify-center items-center flex-row`}>
              {isQualified && (
                <View style={tailwind`w-0.5 h-5 bg-red-400 rounded-full mr-1.5`} />
              )}
              <Text style={[
                tailwind`text-sm`,
                isQualified ? tailwind`text-red-400 font-bold` : tailwind`text-gray-400 font-medium`
              ]}>
                {rowIndex + 1}
              </Text>
            </View>

            {/* Team name with initial circle */}
            <View style={tailwind`flex-1 ml-2 flex-row items-center`}>
              <View style={tailwind`w-6 h-6 rounded-full bg-gray-100 items-center justify-center mr-2`}>
                <Text style={tailwind`text-xs font-bold text-gray-400`}>
                  {row[0]?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text
                style={tailwind`text-gray-900 text-sm font-medium flex-1`}
                numberOfLines={1}
              >
                {row[0]}
              </Text>
            </View>

            {/* Stats */}
            {row.slice(1).map((stat, statIndex) => {
              const totalStats = row.length - 1;
              let isPoints = statIndex === totalStats - 1;
              let isGoalDiff = false;

              if (game.name === 'football') {
                isGoalDiff = statIndex === totalStats - 2;
              }
              const goalDiff = isGoalDiff ? parseInt(stat) : 0;

              return (
                <View key={statIndex} style={[tailwind`justify-center`, isPoints ? tailwind`w-10` : tailwind`w-8`]}>
                  <Text
                    style={[
                      tailwind`text-sm text-center`,
                      isPoints
                        ? tailwind`text-gray-900 font-bold`
                        : isGoalDiff && goalDiff > 0
                        ? tailwind`text-green-600 font-semibold`
                        : isGoalDiff && goalDiff < 0
                        ? tailwind`text-red-400 font-semibold`
                        : tailwind`text-gray-500`
                    ]}
                  >
                    {isGoalDiff && goalDiff > 0 ? `+${stat}` : stat || 0}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

export default PointTable;
