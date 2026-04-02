import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';

const IncidentCheck = ({ incident, matchData }) => {
  if (!incident || !matchData) {
    return null;
  }

  const isHomeTeam = incident.team_id === matchData.homeTeam.id;

  // Handle substitution
  if (incident.incident_type === 'substitution') {
    return (
      <View style={[tailwind`py-3 px-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
        <View style={tailwind`flex-row items-center ${isHomeTeam ? 'justify-start' : 'justify-end'}`}>
          {isHomeTeam ? (
            <>
              {/* Time */}
              <View style={tailwind`w-12`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
              </View>

              {/* Icon */}
              <View style={tailwind`w-8 mx-2 items-center justify-center`}>
                <Text style={tailwind`text-lg`}>🔄</Text>
              </View>

              {/* Content */}
              <View style={tailwind`flex-1`}>
                <View style={tailwind`flex-row items-center mb-1`}>
                  <Text style={tailwind`text-green-500 text-xs font-bold mr-1`}>IN</Text>
                  <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>{incident?.player_in?.name}</Text>
                </View>
                <View style={tailwind`flex-row items-center`}>
                  <Text style={tailwind`text-red-400 text-xs font-bold mr-1`}>OUT</Text>
                  <Text style={[tailwind`text-sm`, { color: '#94a3b8' }]}>{incident?.player_out?.name}</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Content - Right Aligned */}
              <View style={tailwind`flex-1 items-end`}>
                <View style={tailwind`flex-row items-center mb-1`}>
                  <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>{incident?.player_in?.name}</Text>
                  <Text style={tailwind`text-green-500 text-xs font-bold ml-1`}>IN</Text>
                </View>
                <View style={tailwind`flex-row items-center`}>
                  <Text style={[tailwind`text-sm`, { color: '#94a3b8' }]}>{incident?.player_out?.name}</Text>
                  <Text style={tailwind`text-red-400 text-xs font-bold ml-1`}>OUT</Text>
                </View>
              </View>

              {/* Icon */}
              <View style={tailwind`w-8 mx-2 items-center justify-center`}>
                <Text style={tailwind`text-lg`}>🔄</Text>
              </View>

              {/* Time */}
              <View style={tailwind`w-12 items-end`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // Handle goal incidents
  if (incident.incident_type === 'goal' || incident.incident_type === 'penalty') {
    return (
      <View style={[tailwind`py-3 px-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
        <View style={tailwind`flex-row items-center ${isHomeTeam ? 'justify-start' : 'justify-end'}`}>
          {isHomeTeam ? (
            <>
              {/* Time */}
              <View style={tailwind`w-12`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
              </View>

              {/* Icon */}
              <View style={tailwind`w-8 mx-2 items-center justify-center`}>
                <Text style={tailwind`text-2xl`}>⚽</Text>
              </View>

              {/* Content & Score */}
              <View style={tailwind`flex-1 flex-row items-center`}>
                <Text style={[tailwind`text-sm font-semibold flex-1`, { color: '#f1f5f9' }]}>
                  {incident?.player?.name}
                </Text>
                {/* Score */}
                {incident.homeScore && incident.awayScore && (
                  <View style={[tailwind`rounded px-2.5 py-1 ml-2`, { backgroundColor: '#0f172a' }]}>
                    <Text style={[tailwind`font-bold text-sm`, { color: '#f1f5f9' }]}>
                      {incident.homeScore.goals} - {incident.awayScore.goals}
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* Content & Score */}
              <View style={tailwind`flex-1 flex-row items-center justify-end`}>
                {/* Score */}
                {incident.homeScore && incident.awayScore && (
                  <View style={[tailwind`rounded px-2.5 py-1 mr-2`, { backgroundColor: '#0f172a' }]}>
                    <Text style={[tailwind`font-bold text-sm`, { color: '#f1f5f9' }]}>
                      {incident.homeScore.goals} - {incident.awayScore.goals}
                    </Text>
                  </View>
                )}

                <Text style={[tailwind`text-sm font-semibold flex-1 text-right`, { color: '#f1f5f9' }]}>
                  {incident?.player?.name}
                </Text>
              </View>

              {/* Icon */}
              <View style={tailwind`w-8 mx-2 items-center justify-center`}>
                <Text style={tailwind`text-2xl`}>⚽</Text>
              </View>

              {/* Time */}
              <View style={tailwind`w-12 items-end`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // Handle yellow card
  if (incident.incident_type === 'yellow_card') {
    return (
      <View style={[tailwind`py-3 px-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
        <View style={tailwind`flex-row items-center ${isHomeTeam ? 'justify-start' : 'justify-end'}`}>
          {isHomeTeam ? (
            <>
              <View style={tailwind`w-12`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
              </View>
              <View style={tailwind`w-8 mx-2 items-center justify-center`}>
                <View style={tailwind`bg-yellow-400 w-4 h-5 rounded-sm`} />
              </View>
              <View style={tailwind`flex-1`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>
                  {incident?.player?.name}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={tailwind`flex-1 items-end`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>
                  {incident?.player?.name}
                </Text>
              </View>
              <View style={tailwind`w-8 mx-2 items-center justify-center`}>
                <View style={tailwind`bg-yellow-400 w-4 h-5 rounded-sm`} />
              </View>
              <View style={tailwind`w-12 items-end`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // Handle red card
  if (incident.incident_type === 'red_card') {
    return (
      <View style={[tailwind`py-3 px-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
        <View style={tailwind`flex-row items-center ${isHomeTeam ? 'justify-start' : 'justify-end'}`}>
          {isHomeTeam ? (
            <>
              <View style={tailwind`w-12`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
              </View>
              <View style={tailwind`w-8 mx-2 items-center justify-center`}>
                <View style={tailwind`bg-red-600 w-4 h-5 rounded-sm`} />
              </View>
              <View style={tailwind`flex-1`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>
                  {incident?.player?.name}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={tailwind`flex-1 items-end`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>
                  {incident?.player?.name}
                </Text>
              </View>
              <View style={tailwind`w-8 mx-2 items-center justify-center`}>
                <View style={tailwind`bg-red-600 w-4 h-5 rounded-sm`} />
              </View>
              <View style={tailwind`w-12 items-end`}>
                <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // Handle other incidents
  return (
    <View style={[tailwind`py-3 px-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
      <View style={tailwind`flex-row items-center ${isHomeTeam ? 'justify-start' : 'justify-end'}`}>
        {isHomeTeam ? (
          <>
            <View style={tailwind`w-12`}>
              <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
            </View>
            <View style={tailwind`w-8 mx-2 items-center justify-center`}>
              <Text style={tailwind`text-base`}>
                {incident.incident_type === 'corner_kick' ? '🚩' :
                 incident.incident_type === 'foul' ? '⚠️' :
                 incident.incident_type === 'shot_on_target' ? '🎯' : '•'}
              </Text>
            </View>
            <View style={tailwind`flex-1`}>
              <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>
                {incident?.player?.name}
              </Text>
              <Text style={[tailwind`text-xs mt-1 capitalize`, { color: '#64748b' }]}>
                {incident?.incident_type?.replace('_', ' ')}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={tailwind`flex-1 items-end`}>
              <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>
                {incident?.player?.name}
              </Text>
              <Text style={[tailwind`text-xs mt-1 capitalize`, { color: '#64748b' }]}>
                {incident?.incident_type?.replace('_', ' ')}
              </Text>
            </View>
            <View style={tailwind`w-8 mx-2 items-center justify-center`}>
              <Text style={tailwind`text-base`}>
                {incident.incident_type === 'corner_kick' ? '🚩' :
                 incident.incident_type === 'foul' ? '⚠️' :
                 incident.incident_type === 'shot_on_target' ? '🎯' : '•'}
              </Text>
            </View>
            <View style={tailwind`w-12 items-end`}>
              <Text style={[tailwind`text-sm font-medium`, { color: '#94a3b8' }]}>{incident.incident_time}'</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default IncidentCheck;