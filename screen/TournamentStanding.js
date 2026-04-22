import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import PointTable from '../components/PointTable';
import { useFocusEffect } from '@react-navigation/native';
import { fetchStandings, fetchGroups, addGroup, fetchAllGroups } from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { addTeamToGroup, setStandings, setGroups } from '../redux/actions/actions';
import TournamentParticipants from './TournamentParticipants';
import { getTournamentStandings } from '../services/tournamentServices';
import Animated, {useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, Extrapolation, interpolate} from 'react-native-reanimated';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const TournamentStanding = ({ tournament, parentScrollY, headerHeight, collapsedHeader }) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStrength, setGroupStrength] = useState(3);
  const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);
  const [groupSelectedList, setGroupSelectedList] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [isModalCreateStandingVisible, setIsCreateStandingVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'assigned', 'unassigned'
  const [createGroupMode, setCreateGroupMode] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {},
  });
  const [modalError, setModalError] = useState({
    global: null,
    fields: {},
  });
  const [tournamentParticipants, setTournamentParticipants] = useState();

  // Redux state
  const groups = useSelector((state) => state.tournamentsReducers.groups);
  const standings = useSelector((state) => state.tournamentsReducers.standings);
  const game = useSelector(state => state.sportReducers.game);

  const { height: sHeight, width: sWidth } = useWindowDimensions();

  const dispatch = useDispatch();

  const currentScrollY = useSharedValue(0);

  const handlerScroll = useAnimatedScrollHandler({
    onScroll:(event) => {
        if(parentScrollY.value === collapsedHeader){
            parentScrollY.value = currentScrollY.value
        } else {
            parentScrollY.value = event.contentOffset.y
        }
      }
  });


  // Focus effect for data fetching
  useFocusEffect(
    React.useCallback(() => {
      const loadGroup = async () => {
          const response = await fetchAllGroups();
          dispatch(setGroups(response))
      }
      loadGroup();
    }, [axiosInstance])
  );

  useEffect(() => {
    const fetchTeam = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.get(
                `${BASE_URL}/${game.name}/getTournamentParticipants/${tournament.public_id}`,
                {
                  headers: {
                      'Authorization': `Bearer ${authToken}`,
                      'Content-Type': 'application/json'
                  }
                }
            );
            const item = response.data;
            setTournamentParticipants(item.data || []);
        } catch (err) {
            const backendError = err?.response?.data?.error?.fields || {};
            setModalError({global: "Unable to get teams", fields: backendError,});
            console.log("Failed to get tournament participants for adding to standing: ", err);
        }
    }
    fetchTeam()
  }, [selectedGroup])

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const response = await getTournamentStandings({ tournament: tournament, game: game});
        const item = response.data;
        dispatch(setStandings(item || []));
      } catch (err) {
          const backendError = err.response.data.error.fields;
          setError({
            global: "Unable to get tournament standing",
            fields: backendError,
          });
          console.log("Unable to get tournament standing: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStandings();
  }, [tournament, axiosInstance, dispatch]);

  const getGroup = async () => {
    setLoading(true);
    try {
      const res = fetchAllGroups();
      dispatch(setGroups(res.data))
    } catch(err) {
      const backendErrrors = err?.response?.data?.error?.fields;
      setError({
        global: "Unable to get groups",
        fields: backendErrrors,
      })
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getGroup()
  }, []);

  // Group selection handler (tap again to deselect)
  const handleGroupSelect = (item) => {
    if (selectedGroup?.id === item.id) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(item);
      setIsModalGroupVisible(false);
    }
  };

  // Team toggle handler with validation
  const handleTeamToggle = (participant) => {
    if (selectedTeams?.some(t => t.id === participant.entity.id)) {
      setSelectedTeams(selectedTeams?.filter(t => t?.id !== participant.entity.id));
    } else {
      if (selectedTeams.length >= 20) {
        Alert.alert('Limit Reached', 'Maximum 20 teams can be selected at once.');
        return;
      }
      setSelectedTeams([...selectedTeams, participant.entity]);
    }
  };

  // Bulk participant selection
  const handleBulkSelect = (selectAll = true) => {
    if (selectAll) {
      const availableTeams = filteredTeams.slice(0, 20); // Limit to 20
      setSelectedTeams(availableTeams);
    } else {
      setSelectedTeams([]);
    }
  };

  // Enhanced participant to group assignment
  const handleTeamToGroup = async (publicID = null) => {
    if (!selectedGroup) {
      return;
    }

    if (selectedTeams.length === 0 && !publicID) {
      Alert.alert('Error', 'Please select at least one participant.');
      return;
    }

    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const teamsToProcess = publicID ? [{ public_id: publicID }] : selectedTeams;

      const promises = teamsToProcess.map(participant => {
        const groupData = {
          group_id: selectedGroup.id,
          team_public_id: participant.public_id,
          tournament_public_id: tournament.public_id
        };
        console.log("Group Data: ", groupData)

        return axiosInstance.post(`${BASE_URL}/${game.name}/createTournamentStanding`, groupData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
      });

      await Promise.all(promises);

      // Success: close both modals and clear selection
      setSelectedTeams([]);
      setIsModalTeamVisible(false);
      setIsCreateStandingVisible(false);

    } catch (err) {
      const backendError = err?.response?.data?.error?.fields || {};
      if(err?.response?.data?.error?.code === "FORBIDDEN"){
          setModalError({
              global: err?.response?.data?.error?.message,
              fields: {},
          })
      } else {
        setModalError({
          global: 'Failed to add teams to standing. Please try again.',
          fields: backendError,
        });
      }
      console.log("Unable to add teams to group: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter teams based on search and filter mode
  const filteredTeams = tournamentParticipants?.filter(participant => {
    const matchesSearch = participant?.entity?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterMode === 'all') return matchesSearch;
    if (filterMode === 'assigned') {
      // Logic to check if participant is already assigned
      return matchesSearch; // Implement assignment check
    }
    if (filterMode === 'unassigned') {
      // Logic to check if participant is not assigned
      return matchesSearch; // Implement assignment check
    }

    return matchesSearch;
  });

  // Render participant item with enhanced UI
  const renderTeamItem = ({ item }) => {
    const isSelected = selectedTeams.some(t => t.id === item.entity.id);
    return (
      <Pressable
        onPress={() => handleTeamToggle(item.entity)}
        style={[
          tailwind`p-4 flex-row justify-between items-center`,
          { borderBottomWidth: 1, borderBottomColor: '#334155' },
          isSelected && { backgroundColor: '#f8717115' }
        ]}
      >
        <View style={tailwind`flex-row items-center flex-1`}>
          <View style={[
            tailwind`w-8 h-8 rounded-full items-center justify-center mr-3`,
            { backgroundColor: isSelected ? '#f87171' : '#334155' }
          ]}>
            <Text style={[
              tailwind`text-xs font-bold`,
              { color: isSelected ? '#fff' : '#64748b' }
            ]}>
              {item.entity.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={tailwind`flex-1`}>
            <Text style={[
              tailwind`text-sm font-medium`,
              { color: isSelected ? '#f87171' : '#f1f5f9' }
            ]}>
              {item.entity.name}
            </Text>
            <Text style={[tailwind`text-xs mt-0.5`, { color: '#64748b' }]}>
              {item.entity.category || 'No category'} • {item.entity.players_count || 0} players
            </Text>
          </View>
        </View>
        <CheckBox
          value={isSelected}
          onValueChange={() => handleTeamToggle(item)}
          tintColors={{ true: '#f87171', false: '#475569' }}
        />
      </Pressable>
    );
  };

  // Render group item
  const renderGroupItem = ({ item }) => {
    const isSelected = selectedGroup?.id === item.id;
    return (
      <Pressable
        onPress={() => handleGroupSelect(item)}
        style={[
          tailwind`p-4 flex-row justify-between items-center`,
          { borderBottomWidth: 1, borderBottomColor: '#334155' },
          isSelected && { backgroundColor: '#f8717115' }
        ]}
      >
        <View style={tailwind`flex-1`}>
          <Text style={[
            tailwind`text-base font-medium`,
            { color: isSelected ? '#f87171' : '#f1f5f9' }
          ]}>{item.name}</Text>
          <Text style={[tailwind`text-xs mt-0.5`, { color: '#64748b' }]}>
            {isSelected ? 'Tap to deselect' : `Capacity: ${item.strength || 'Not set'} teams`}
          </Text>
        </View>
        {isSelected ? (
          <MaterialIcon name="close" size={20} color="#f87171" />
        ) : (
          <MaterialIcon name="radio-button-unchecked" size={20} color="#475569" />
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#f87171" />
        <Text style={[tailwind`mt-3`, { color: '#64748b' }]}>Loading Standings...</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: '#0f172a' }}
    >
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: '#0f172a' }}
        onScroll={handlerScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 100,
            minHeight: sHeight + 100,
        }}
      >
        {/* Header Section */}
        <View style={{ backgroundColor: '#0f172a', padding: 8 }}>
          <Pressable
            onPress={() => setIsCreateStandingVisible(true)}
            style={[
              tailwind`p-4 rounded-xl flex-row justify-center items-center`,
              { backgroundColor: '#f87171' }
            ]}
          >
            <MaterialIcon name="add-circle-outline" size={22} color="#fff" />
            <Text style={tailwind`text-white text-base font-semibold ml-2`}>
              Create Standing
            </Text>
          </Pressable>
        </View>
        {error?.global && standings.length === 0 && (
            <View style={[tailwind`mx-3 mb-3 p-3 rounded-xl flex-row items-center`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                <MaterialIcon name="error-outline" size={18} color="#f87171" />
                <Text style={[tailwind`text-sm ml-2 flex-1`, { color: '#fca5a5' }]}>
                    {error?.global}
                </Text>
            </View>
        )}

        {/* Standings Section */}
        <View style={tailwind`p-2`}>
          {loading ? (
            <View style={[tailwind`rounded-xl p-8 items-center`, { backgroundColor: '#1e293b' }]}>
              <ActivityIndicator size="large" color="#f87171" />
              <Text style={[tailwind`mt-4`, { color: '#64748b' }]}>Loading standings...</Text>
            </View>
          ) : standings?.length > 0 ? (
            standings.filter(group => group.group_name)
                .map((group, index) => (
                    <View
                      key={index}
                      style={[
                        tailwind`mb-3 rounded-2xl overflow-hidden`,
                        { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
                      ]}
                    >
                        <View style={tailwind`px-4 pt-3 pb-2 flex-row items-center`}>
                            <View style={[tailwind`w-1 h-5 rounded-full mr-2.5`, { backgroundColor: '#f87171' }]} />
                            <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>
                                {group.group_name}
                            </Text>
                        </View>
                        <PointTable standingsData={group.team_row} game={game} />
                    </View>
                ))

          ) : (
            <View style={[
              tailwind`rounded-2xl p-12 items-center`,
              { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
            ]}>
              <View style={[tailwind`w-16 h-16 rounded-full items-center justify-center mb-4`, { backgroundColor: '#334155' }]}>
                <MaterialIcon name="leaderboard" size={32} color="#475569" />
              </View>
              <Text style={[tailwind`text-lg font-semibold mb-1`, { color: '#f1f5f9' }]}>
                No Standings Yet
              </Text>
              <Text style={[tailwind`text-sm text-center`, { color: '#64748b' }]}>
                Create your first tournament standing to get started
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Create Standing Modal */}
      {isModalCreateStandingVisible && (
        <Modal
          animationType="slide"
          visible={isModalCreateStandingVisible}
          transparent={true}
        >
          <View style={tailwind`flex-1 justify-end bg-black/50`}>
            <View style={[tailwind`rounded-t-3xl p-6`, { backgroundColor: '#1e293b', maxHeight: sHeight * 0.55 }]}>
              {/* Drag handle */}
              <View style={[tailwind`w-10 h-1 rounded-full self-center mb-5`, { backgroundColor: '#475569' }]} />

              {/* Header */}
              <View style={tailwind`flex-row justify-between items-start mb-5`}>
                <View style={tailwind`flex-1 mr-3`}>
                  <Text style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}>Create Standing</Text>
                  <Text style={[tailwind`text-sm mt-0.5`, { color: '#64748b' }]}>Set up a group and assign teams</Text>
                </View>
                <Pressable
                  onPress={() => setIsCreateStandingVisible(false)}
                  style={[tailwind`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}
                >
                  <MaterialIcon name="close" size={18} color="#94a3b8" />
                </Pressable>
              </View>

              {(tournament?.stage === "group" || tournament?.stage === "league") && (
                <View style={tailwind`gap-3`}>
                  {/* Select Group */}
                  <Pressable
                    onPress={() => setIsModalGroupVisible(true)}
                    style={[
                      tailwind`flex-row items-center p-4 rounded-2xl`,
                      { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }
                    ]}
                  >
                    <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center mr-3`, { backgroundColor: '#f8717120' }]}>
                      <MaterialIcon name="folder-open" size={22} color="#f87171" />
                    </View>
                    <View style={tailwind`flex-1`}>
                      <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>Select Group</Text>
                      {selectedGroup ? (
                        <Text style={[tailwind`text-xs mt-0.5 font-medium`, { color: '#f87171' }]}>✓ {selectedGroup.name}</Text>
                      ) : (
                        <Text style={[tailwind`text-xs mt-0.5`, { color: '#64748b' }]}>Choose which group to use</Text>
                      )}
                    </View>
                    <MaterialIcon name="chevron-right" size={20} color="#475569" />
                  </Pressable>

                  {/* Add Teams */}
                  <Pressable
                    onPress={() => {
                      if (selectedGroup) {
                        setError({ global: null, fields: {} });
                        setIsModalTeamVisible(true);
                      } else {
                        Alert.alert('Select Group First', 'Please select a group before adding teams.');
                      }
                    }}
                    style={[
                      tailwind`flex-row items-center p-4 rounded-2xl`,
                      { backgroundColor: selectedGroup ? '#0f172a' : '#0f172a80', borderWidth: 1, borderColor: '#334155' }
                    ]}
                  >
                    <View style={[
                      tailwind`w-11 h-11 rounded-full items-center justify-center mr-3`,
                      { backgroundColor: selectedGroup ? '#334155' : '#1e293b' }
                    ]}>
                      <MaterialIcon name="group-add" size={22} color={selectedGroup ? "#f1f5f9" : "#475569"} />
                    </View>
                    <View style={tailwind`flex-1`}>
                      <View style={tailwind`flex-row items-center gap-1 mb-0.5`}>
                        {!selectedGroup && <MaterialIcon name="lock" size={11} color="#475569" />}
                      </View>
                      <Text style={[tailwind`text-sm font-semibold`, { color: selectedGroup ? '#f1f5f9' : '#475569' }]}>
                        Add Teams
                      </Text>
                      <Text style={[tailwind`text-xs mt-0.5`, { color: selectedGroup ? '#64748b' : '#334155' }]}>
                        {selectedGroup ? `Adding to ${selectedGroup.name}` : 'Select a group first'}
                      </Text>
                    </View>
                    <MaterialIcon name="chevron-right" size={20} color={selectedGroup ? "#475569" : "#334155"} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Group Selection Modal */}
      {isModalGroupVisible && (
        <Modal
          animationType="slide"
          visible={isModalGroupVisible}
          transparent={true}
        >
          <View style={tailwind`flex-1 justify-end bg-black/50`}>
            <View style={[tailwind`rounded-t-3xl h-96`, { backgroundColor: '#1e293b' }]}>
              <View style={[tailwind`w-10 h-1 rounded-full self-center mt-3`, { backgroundColor: '#475569' }]} />
              <View style={[tailwind`p-6`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                <View style={tailwind`flex-row justify-between items-center mb-4`}>
                  <Text style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}>
                    Select Group
                  </Text>
                </View>
              </View>
              <FlatList
                data={groups}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGroupItem}
                style={tailwind`flex-1`}
                ListEmptyComponent={() => (
                  <View style={tailwind`p-8 items-center`}>
                    <Text style={{ color: '#64748b' }}>No groups available</Text>
                  </View>
                )}
              />

              <Pressable
                onPress={() => setIsModalGroupVisible(false)}
                style={[tailwind`p-4 items-center`, { borderTopWidth: 1, borderTopColor: '#334155' }]}
              >
                <Text style={[tailwind`font-medium`, { color: '#94a3b8' }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Team Selection Modal */}
      {isModalTeamVisible && (
        <Modal
          animationType="slide"
          visible={isModalTeamVisible}
          transparent={true}
        >
          <View style={tailwind`flex-1 justify-end bg-black/50`}>
            <View style={[tailwind`rounded-t-3xl h-5/6`, { backgroundColor: '#1e293b' }]}>
              <View style={[tailwind`w-10 h-1 rounded-full self-center mt-3`, { backgroundColor: '#475569' }]} />
              {/* Header */}
              <View style={[tailwind`p-6`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                <Text style={[tailwind`text-xl font-bold mb-2`, { color: '#f1f5f9' }]}>
                  Add Teams to {selectedGroup?.name}
                </Text>
                {modalError?.global && (
                    <View style={[tailwind`mb-3 p-3 rounded-xl flex-row items-center`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                        <MaterialIcon name="error-outline" size={18} color="#f87171" />
                        <Text style={[tailwind`text-sm ml-2 flex-1`, { color: '#fca5a5' }]}>
                            {modalError?.global}
                        </Text>
                    </View>
                )}
                {/* Search Bar */}
                <View style={[tailwind`rounded-xl flex-row items-center px-3 mb-3`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
                  <MaterialIcon name="search" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[tailwind`flex-1 p-3 text-sm`, { color: '#f1f5f9' }]}
                    placeholderTextColor="#475569"
                  />
                </View>

                {/* Bulk Actions */}
                <View style={tailwind`flex-row justify-between items-center`}>
                  <Text style={[tailwind`text-sm`, { color: '#94a3b8' }]}>
                    {selectedTeams.length} selected
                  </Text>
                  <View style={tailwind`flex-row gap-2`}>
                    <Pressable
                      onPress={() => handleBulkSelect(true)}
                      style={[tailwind`px-3 py-1.5 rounded-full`, { backgroundColor: '#f8717120' }]}
                    >
                      <Text style={[tailwind`text-xs font-medium`, { color: '#f87171' }]}>
                        Select All
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleBulkSelect(false)}
                      style={[tailwind`px-3 py-1.5 rounded-full`, { backgroundColor: '#334155' }]}
                    >
                      <Text style={[tailwind`text-xs font-medium`, { color: '#94a3b8' }]}>
                        Clear All
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Team List */}
              <FlatList
                data={filteredTeams || teams}
                keyExtractor={(item) => item.entity.id.toString()}
                renderItem={renderTeamItem}
                style={tailwind`flex-1`}
                ListEmptyComponent={() => (
                  <View style={tailwind`p-8 items-center`}>
                    <Text style={{ color: '#64748b' }}>
                      {searchQuery ? 'No teams found' : 'No teams available'}
                    </Text>
                  </View>
                )}
              />

              {/* Bottom Actions */}
              <View style={[tailwind`p-4 gap-3`, { borderTopWidth: 1, borderTopColor: '#334155' }]}>
                <Pressable
                  onPress={() => handleTeamToGroup()}
                  disabled={loading || selectedTeams.length === 0}
                  style={[
                    tailwind`p-4 rounded-xl items-center`,
                    { backgroundColor: (loading || selectedTeams.length === 0) ? '#334155' : '#f87171' }
                  ]}
                >
                  <Text style={[
                    tailwind`font-semibold text-base`,
                    { color: (loading || selectedTeams.length === 0) ? '#475569' : '#fff' }
                  ]}>
                    {loading
                      ? 'Adding Teams...'
                      : `Add ${selectedTeams.length} Team${selectedTeams.length !== 1 ? 's' : ''}`
                    }
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsModalTeamVisible(false)}
                  style={tailwind`p-3 items-center`}
                >
                  <Text style={[tailwind`font-medium`, { color: '#94a3b8' }]}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default TournamentStanding;