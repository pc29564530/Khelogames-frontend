import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { setGame } from '../redux/actions/actions';

const getIconForSport = (name) => {
  switch (name) {
    case 'football': return 'sports-soccer';
    case 'cricket':  return 'sports-cricket';
    default:         return 'sports';
  }
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const SportSelector = ({ variant = 'underline', containerStyle }) => {
  const dispatch = useDispatch();
  const games = useSelector((state) => state.sportReducers.games);
  const game  = useSelector((state) => state.sportReducers.game);

  const handlePress = (item) => {
    dispatch(setGame(item));
  };

  // Dark variant (Home page)
  if (variant === 'dark') {
    return (
      <View style={[{ marginTop: 24 }, containerStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 10 }}
        >
          {games.map((s) => {
            const active = game?.id === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => handlePress(s)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  borderRadius: 20,
                  gap: 6,
                  backgroundColor: active ? '#f87171' : '#1e293b',
                  borderWidth: active ? 0 : 1,
                  borderColor: '#334155',
                }}
              >
                <MaterialIcons
                  name={getIconForSport(s.name)}
                  color={active ? '#fff' : '#94a3b8'}
                  size={18}
                />
                <Text style={{
                  color: active ? '#fff' : '#94a3b8',
                  fontWeight: active ? '700' : '500',
                  fontSize: 13,
                }}>
                  {capitalize(s.name)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Filled variant (Matches page)
  if (variant === 'filled') {
    return (
      <View style={containerStyle}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tailwind`pb-3`}
        >
          {games.map((s) => {
            const active = game?.id === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => handlePress(s)}
                style={[
                  tailwind`border rounded-lg px-4 py-2 mr-2`,
                  active ? tailwind`bg-orange-400` : tailwind`bg-orange-200`,
                ]}
              >
                <Text style={tailwind`text-white font-semibold capitalize`}>
                  {s.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Underline variant (Tournament/Club) — default
  return (
    <View style={[tailwind`flex-row items-center border-b border-gray-100`, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tailwind`flex-row px-4`}
      >
        {games?.length > 0 ? (
          games.map((s) => {
            const active = game?.id === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => handlePress(s)}
                style={[
                  tailwind`px-4 py-3 mr-1`,
                  active && { borderBottomWidth: 2, borderBottomColor: '#f87171' },
                ]}
              >
                <Text style={[
                  tailwind`text-sm`,
                  active
                    ? tailwind`text-gray-900 font-bold`
                    : tailwind`text-gray-400 font-medium`,
                ]}>
                  {capitalize(s.name)}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <View style={tailwind`px-4 py-3`}>
            <Text style={tailwind`text-gray-400 text-sm`}>Loading...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SportSelector;
