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
      <View style={[tailwind`flex-row px-3 py-2.5`, { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
        <View style={tailwind`w-8 items-center justify-center`}>
          <Text style={[tailwind`text-xs font-semibold`, { color: '#64748b' }]}>#</Text>
        </View>

        {/* Team column header */}
        <View style={tailwind`flex-1 ml-2 justify-center`}>
          <Text style={[tailwind`text-xs font-semibold`, { color: '#64748b' }]}>Team</Text>
        </View>

        {/* Stats headers */}
        {tableHead.map((header, index) => {
          const isLast = index === tableHead.length - 1;
          return (
            <View key={index} style={[tailwind`justify-center`, isLast ? tailwind`w-10` : tailwind`w-8`]}>
              <Text
                style={[
                  tailwind`text-xs font-semibold text-center`,
                  { color: isLast ? '#f1f5f9' : '#64748b' }
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
              !isLast && { borderBottomWidth: 1, borderBottomColor: '#334155' },
            ]}
          >
            {/* Position with qualification indicator */}
            <View style={tailwind`w-8 justify-center items-center flex-row`}>
              {isQualified && (
                <View style={[tailwind`w-0.5 h-5 rounded-full mr-1.5`, { backgroundColor: '#f87171' }]} />
              )}
              <Text style={[
                tailwind`text-sm`,
                { color: isQualified ? '#f87171' : '#64748b', fontWeight: isQualified ? '700' : '500' }
              ]}>
                {rowIndex + 1}
              </Text>
            </View>

            {/* Team name with initial circle */}
            <View style={tailwind`flex-1 ml-2 flex-row items-center`}>
              <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center mr-2`, { backgroundColor: '#334155' }]}>
                <Text style={[tailwind`text-xs font-bold`, { color: '#64748b' }]}>
                  {row[0]?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text
                style={[tailwind`text-sm font-medium flex-1`, { color: '#f1f5f9' }]}
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
                        ? { color: '#f1f5f9', fontWeight: '700' }
                        : isGoalDiff && goalDiff > 0
                        ? { color: '#4ade80', fontWeight: '600' }
                        : isGoalDiff && goalDiff < 0
                        ? { color: '#f87171', fontWeight: '600' }
                        : { color: '#94a3b8' }
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