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
  Dimensions
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

const { width: screenWidth } = Dimensions.get('window');

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
  })
  const [tournamentParticipants, setTournamentParticipants] = useState();

  // Redux state
  const groups = useSelector((state) => state.tournamentsReducers.groups);
  const standings = useSelector((state) => state.tournamentsReducers.standings);
  const game = useSelector(state => state.sportReducers.game);

  const { height: sHeight, width: sWidth } = Dimensions.get("window");
  
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
    React.useCallback(async () => {
      const response = await fetchAllGroups();
      dispatch(setGroups(response))
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
            setError({global: "Unable to get teams", fields: backendError,});
            console.error("Failed to get tournament participants for adding to standing: ", err);
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
      Alert.alert('Error', 'Please select a group first.');
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
      
      // Success feedback
      Alert.alert(
        'Success!', 
        `${teamsToProcess.length} participant(s) added to ${selectedGroup.name}`,
        [{ text: 'OK', onPress: () => {
          setSelectedTeams([]);
          setIsModalTeamVisible(false);
          onRefresh(); // Refresh standings
        }}]
      );

    } catch (err) {
      const backendError = err?.response?.data?.error?.fields || {};
      setError({
        global: "Unable to create standing",
        fields: backendError,
      });
      console.error("Unable to add teams to group: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const groupData = {
        name: newGroupName.trim(),
        tournament_id: tournament.id,
        strength: groupStrength
      };

      await addGroup({ groupData, axiosInstance, dispatch });
      
      Alert.alert('Success!', `Group "${newGroupName}" created successfully.`);
      setNewGroupName('');
      setCreateGroupMode(false);
      fetchAllGroups({ axiosInstance: axiosInstance, dispatch: dispatch });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
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
          tailwind`p-4 border-b border-gray-50 flex-row justify-between items-center`,
          isSelected && tailwind`bg-red-50`
        ]}
      >
        <View style={tailwind`flex-row items-center flex-1`}>
          <View style={[
            tailwind`w-8 h-8 rounded-full items-center justify-center mr-3`,
            isSelected ? tailwind`bg-red-400` : tailwind`bg-gray-100`
          ]}>
            <Text style={[
              tailwind`text-xs font-bold`,
              isSelected ? tailwind`text-white` : tailwind`text-gray-400`
            ]}>
              {item.entity.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={tailwind`flex-1`}>
            <Text style={[
              tailwind`text-sm font-medium`,
              isSelected ? tailwind`text-red-400` : tailwind`text-gray-900`
            ]}>
              {item.entity.name}
            </Text>
            <Text style={tailwind`text-xs text-gray-400 mt-0.5`}>
              {item.entity.category || 'No category'} • {item.entity.players_count || 0} players
            </Text>
          </View>
        </View>
        <CheckBox
          value={isSelected}
          onValueChange={() => handleTeamToggle(item)}
          tintColors={{ true: '#f87171', false: '#D1D5DB' }}
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
          tailwind`p-4 border-b border-gray-50 flex-row justify-between items-center`,
          isSelected && tailwind`bg-red-50`
        ]}
      >
        <View style={tailwind`flex-1`}>
          <Text style={[
            tailwind`text-base font-medium`,
            isSelected ? tailwind`text-red-400` : tailwind`text-gray-800`
          ]}>{item.name}</Text>
          <Text style={tailwind`text-xs text-gray-400 mt-0.5`}>
            {isSelected ? 'Tap to deselect' : `Capacity: ${item.strength || 'Not set'} teams`}
          </Text>
        </View>
        {isSelected ? (
          <MaterialIcon name="close" size={20} color="#f87171" />
        ) : (
          <MaterialIcon name="radio-button-unchecked" size={20} color="#d1d5db" />
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f87171" />
        <Text style={tailwind`mt-3`}>Loading Standings...</Text>
      </View>
    );
  }

  return (
    <View 
      style={[
        tailwind`flex-1 bg-gray-50`,
      ]}
    >
      <Animated.ScrollView
        style={tailwind`flex-1 bg-gray-50`}
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
        <View style={tailwind`bg-white p-2`}>
          <Pressable
            onPress={() => setIsCreateStandingVisible(true)}
            style={[
              tailwind`bg-red-400 p-4 rounded-xl flex-row justify-center items-center`,
              {shadowColor: '#f87171', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3}
            ]}
          >
            <MaterialIcon name="add-circle-outline" size={22} color="#fff" />
            <Text style={tailwind`text-white text-base font-semibold ml-2`}>
              Create Standing
            </Text>
          </Pressable>
        </View>
        {error?.global && standings.length === 0 && (
            <View style={tailwind`mx-3 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl flex-row items-center`}>
                <MaterialIcon name="error-outline" size={18} color="#f87171" />
                <Text style={tailwind`text-gray-600 text-sm ml-2 flex-1`}>
                    {error?.global}
                </Text>
            </View>
        )}

        {/* Standings Section */}
        <View style={tailwind`p-2`}>
          {loading ? (
            <View style={tailwind`bg-white rounded-xl p-8 items-center shadow-sm`}>
              <ActivityIndicator size="large" color="#f87171" />
              <Text style={tailwind`text-gray-500 mt-4`}>Loading standings...</Text>
            </View>
          ) : standings?.length > 0 ? (
            standings.filter(group => group.group_name)
                .map((group, index) => (
                    <View
                      key={index}
                      style={[
                        tailwind`mb-3 rounded-2xl bg-white overflow-hidden`,
                        {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1}
                      ]}
                    >
                        <View style={tailwind`px-4 pt-3 pb-2 flex-row items-center`}>
                            <View style={tailwind`w-1 h-5 bg-red-400 rounded-full mr-2.5`} />
                            <Text style={tailwind`text-gray-900 text-base font-bold`}>
                                {group.group_name}
                            </Text>
                        </View>
                        <PointTable standingsData={group.team_row} game={game} />
                    </View>
                ))

          ) : (
            <View style={[
              tailwind`bg-white rounded-2xl p-12 items-center`,
              {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1}
            ]}>
              <View style={tailwind`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4`}>
                <MaterialIcon name="leaderboard" size={32} color="#d1d5db" />
              </View>
              <Text style={tailwind`text-lg font-semibold text-gray-900 mb-1`}>
                No Standings Yet
              </Text>
              <Text style={tailwind`text-sm text-gray-400 text-center`}>
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
            <View style={tailwind`bg-white rounded-t-3xl p-6`}>
              <View style={tailwind`w-10 h-1 bg-gray-200 rounded-full self-center mb-4`} />
              <View style={tailwind`flex-row justify-between items-center mb-6`}>
                <Text style={tailwind`text-xl font-bold text-gray-900`}>
                  Create Standing
                </Text>
                <Pressable
                  onPress={() => setIsCreateStandingVisible(false)}
                  style={tailwind`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                >
                  <Text style={tailwind`text-gray-600 font-bold`}>×</Text>
                </Pressable>
              </View>

              {(tournament?.stage === "group" || tournament?.stage === "league") && (
                <View style={tailwind`gap-4`}>
                  {/* Selected Group Display */}
                  {selectedGroup && (
                    <View style={tailwind`bg-red-50 p-4 rounded-xl border border-red-100 flex-row items-center`}>
                      <MaterialIcon name="check-circle" size={18} color="#f87171" />
                      <Text style={tailwind`text-gray-700 font-medium ml-2`}>
                        Selected: <Text style={tailwind`text-red-400 font-bold`}>{selectedGroup.name}</Text>
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={tailwind`flex-row gap-3`}>
                    <Pressable
                      onPress={() => setIsModalGroupVisible(true)}
                      style={tailwind`flex-1 p-4 bg-red-400 rounded-xl items-center flex-row justify-center`}
                    >
                      <MaterialIcon name="folder-open" size={20} color="#fff" />
                      <Text style={tailwind`text-white font-semibold text-base ml-2`}>
                        Select Group
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        if (selectedGroup) {
                          setIsModalTeamVisible(true);
                        } else {
                          Alert.alert('Error', 'Please select a group first.');
                        }
                      }}
                      style={[
                        tailwind`flex-1 p-4 rounded-xl items-center flex-row justify-center`,
                        selectedGroup
                          ? tailwind`bg-gray-900`
                          : tailwind`bg-gray-200`
                      ]}
                      disabled={!selectedGroup}
                    >
                      <MaterialIcon name="group-add" size={20} color={selectedGroup ? "#fff" : "#9ca3af"} />
                      <Text style={[
                        tailwind`font-semibold text-base ml-2`,
                        selectedGroup ? tailwind`text-white` : tailwind`text-gray-400`
                      ]}>
                        Add Teams
                      </Text>
                    </Pressable>
                  </View>
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
            <View style={tailwind`bg-white rounded-t-3xl h-96`}>
              <View style={tailwind`w-10 h-1 bg-gray-200 rounded-full self-center mt-3`} />
              <View style={tailwind`p-6 border-b border-gray-100`}>
                <View style={tailwind`flex-row justify-between items-center mb-4`}>
                  <Text style={tailwind`text-xl font-bold text-gray-900`}>
                    Select Group
                  </Text>
                  <Pressable
                    onPress={() => setCreateGroupMode(!createGroupMode)}
                    style={tailwind`px-3 py-1.5 bg-red-50 rounded-full`}
                  >
                    <Text style={tailwind`text-red-400 font-medium text-sm`}>
                      {createGroupMode ? 'Cancel' : '+ New'}
                    </Text>
                  </Pressable>
                </View>

                {/* Create Group Section */}
                {createGroupMode && (
                  <View style={tailwind`gap-3`}>
                    <TextInput
                      placeholder="Enter group name"
                      value={newGroupName}
                      onChangeText={setNewGroupName}
                      style={tailwind`bg-gray-100 rounded-xl p-3 text-sm text-gray-900`}
                      placeholderTextColor="#9ca3af"
                    />
                    <Pressable
                      onPress={handleCreateGroup}
                      disabled={loading}
                      style={tailwind`p-3 bg-red-400 rounded-xl items-center`}
                    >
                      <Text style={tailwind`text-white font-medium`}>
                        {loading ? 'Creating...' : 'Create Group'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
              <FlatList
                data={groups}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGroupItem}
                style={tailwind`flex-1`}
                ListEmptyComponent={() => (
                  <View style={tailwind`p-8 items-center`}>
                    <Text style={tailwind`text-gray-500`}>No groups available</Text>
                  </View>
                )}
              />

              <Pressable
                onPress={() => setIsModalGroupVisible(false)}
                style={tailwind`p-4 items-center border-t border-gray-100`}
              >
                <Text style={tailwind`text-gray-500 font-medium`}>Close</Text>
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
            <View style={tailwind`bg-white rounded-t-3xl h-5/6`}>
              <View style={tailwind`w-10 h-1 bg-gray-200 rounded-full self-center mt-3`} />
              {/* Header */}
              <View style={tailwind`p-6 border-b border-gray-100`}>
                <Text style={tailwind`text-xl font-bold text-gray-900 mb-2`}>
                  Add Teams to {selectedGroup?.name}
                </Text>
                
                {/* Search Bar */}
                <View style={tailwind`bg-gray-100 rounded-xl flex-row items-center px-3 mb-3`}>
                  <MaterialIcon name="search" size={20} color="#9ca3af" />
                  <TextInput
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={tailwind`flex-1 p-3 text-sm text-gray-900`}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Bulk Actions */}
                <View style={tailwind`flex-row justify-between items-center`}>
                  <Text style={tailwind`text-sm text-gray-600`}>
                    {selectedTeams.length} selected
                  </Text>
                  <View style={tailwind`flex-row gap-2`}>
                    <Pressable
                      onPress={() => handleBulkSelect(true)}
                      style={tailwind`px-3 py-1.5 bg-red-50 rounded-full`}
                    >
                      <Text style={tailwind`text-red-400 text-xs font-medium`}>
                        Select All
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleBulkSelect(false)}
                      style={tailwind`px-3 py-1.5 bg-gray-100 rounded-full`}
                    >
                      <Text style={tailwind`text-gray-500 text-xs font-medium`}>
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
                    <Text style={tailwind`text-gray-500`}>
                      {searchQuery ? 'No teams found' : 'No teams available'}
                    </Text>
                  </View>
                )}
              />

              {/* Bottom Actions */}
              <View style={tailwind`p-4 border-t border-gray-200 gap-3`}>
                <Pressable
                  onPress={() => handleTeamToGroup()}
                  disabled={loading || selectedTeams.length === 0}
                  style={[
                    tailwind`p-4 rounded-xl items-center`,
                    (loading || selectedTeams.length === 0)
                      ? tailwind`bg-gray-200`
                      : tailwind`bg-red-400`
                  ]}
                >
                  <Text style={[
                    tailwind`font-semibold text-base`,
                    (loading || selectedTeams.length === 0)
                      ? tailwind`text-gray-400`
                      : tailwind`text-white`
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
                  <Text style={tailwind`text-gray-600 font-medium`}>Cancel</Text>
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