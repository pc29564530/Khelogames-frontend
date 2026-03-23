import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { setGame } from '../redux/actions/actions';
import tailwind from 'twrnc';

const getIconForSport = (name) => {
  switch (name) {
    case 'football': return 'sports-soccer';
    case 'cricket': return 'sports-cricket';
    case 'badminton': return 'sports-tennis'
    default: return 'sports';
  }
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const SportSelector = ({ containerStyle }) => {
  const dispatch = useDispatch();
  const games = useSelector((state) => state.sportReducers.games);
  const game = useSelector((state) => state.sportReducers.game);

  const handlePress = (item) => {
    dispatch(setGame(item));
  };

  return (
    <View
      style={[
        {
          backgroundColor: '#1e293b',
          borderBottomColor: '#1e2d3f',
        },
        containerStyle,
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {games?.length > 0 && games?.map((s) => {
          const active = game?.id === s.id;

          return (
            <Pressable
              key={s.id}
              onPress={() => handlePress(s)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
                paddingVertical: 2,
                minWidth: 56,
              }}
            >
              {/* Icon container */}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? '#f8717118' : 'transparent',
                }}
              >
                <MaterialIcons
                  name={getIconForSport(s.name)}
                  size={16}
                  color={active ? '#f87171' : '#4a6282'}
                />
              </View>

              {/* Label */}
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  fontWeight: active ? '700' : '500',
                  color: active ? '#f1f5f9' : '#4a6282',
                  letterSpacing: 0.2,
                }}
              >
                {capitalize(s.name)}
              </Text>

              {/* Active indicator */}
              {active ? (
                <View
                  style={{
                    marginTop: 2,
                    height: 2,
                    width: 22,
                    minWidth: 64,
                    borderRadius: 2,
                    backgroundColor: '#f87171',
                  }}
                />
              ) : (
                <View style={{ marginTop: 2, height: 2 }} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default React.memo(SportSelector);