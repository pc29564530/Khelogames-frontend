import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
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
  Animated,
  Dimensions
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import PointTable from '../components/PointTable';
import { useFocusEffect } from '@react-navigation/native';
import { fetchStandings, fetchGroups, addGroup, getTeamsByTournamentID, fetchAllGroups } from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { addTeamToGroup } from '../redux/actions/actions';
import TournamentParticipants from './TournamentParticipants';

const { width: screenWidth } = Dimensions.get('window');

const TournamentStanding = ({ route }) => {
  const { tournament, currentRole } = route.params;
  
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
  const [tournamentParticipants, setTournamentParticipants] = useState();

  // Redux state
  const groups = useSelector((state) => state.tournamentsReducers.groups);
  const standings = useSelector((state) => state.tournamentsReducers.standings);
  const game = useSelector(state => state.sportReducers.game);
  
  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(100);

  // Focus effect for data fetching
  useFocusEffect(
    React.useCallback(() => {
      fetchAllGroups({ axiosInstance: axiosInstance, dispatch: dispatch });
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
            console.log("Teams: ", response.data)
            setTournamentParticipants(response.data || []);
        } catch (err) {
            console.error("Failed to get tournamentParticipants for adding to standing: ", err);
        }
    }
    fetchTeam()
  }, [selectedGroup])

  useEffect(() => {
    fetchStandings({ tournament: tournament, axiosInstance: axiosInstance, dispatch: dispatch, game: game });
  }, [tournament, axiosInstance, dispatch]);

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAllGroups({ axiosInstance: axiosInstance, dispatch: dispatch }),
        fetchStandings({ tournament: tournament, axiosInstance: axiosInstance, dispatch: dispatch, game: game })
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Group selection handler
  const handleGroupSelect = (item) => {
    setSelectedGroup(item);
    setIsModalGroupVisible(false);
    // Show success feedback
    Alert.alert('Success', `Selected group: ${item.name}`);
  };

  // Team toggle handler with validation
  const handleTeamToggle = (participant) => {
    console.log("Participant : ", participant)
    if (selectedTeams?.some(t => t.id === participant.id)) {
      setSelectedTeams(selectedTeams?.filter(t => t?.id !== participant.id));
    } else {
      if (selectedTeams.length >= 20) {
        Alert.alert('Limit Reached', 'Maximum 20 teams can be selected at once.');
        return;
      }
      setSelectedTeams([...selectedTeams, participant]);
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
      console.error("Unable to add teams to group: ", err);
      Alert.alert('Error', 'Failed to add teams to group. Please try again.');
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
  const renderTeamItem = ({ item }) => (
    <Pressable
      onPress={() => handleTeamToggle(item.entity)}
      style={[
        tailwind`p-4 border-b border-gray-100 flex-row justify-between items-center`,
        selectedTeams.some(t => t.id === item.entity.id) && tailwind`bg-blue-50`
      ]}
    >
      <View style={tailwind`flex-1`}>
        <Text style={[
          tailwind`text-lg font-medium`,
          selectedTeams.some(t => t.id === item.entity.id) ? tailwind`text-blue-600` : tailwind`text-gray-800`
        ]}>
          {item.entity.name}
        </Text>
        <Text style={tailwind`text-sm text-gray-500 mt-1`}>
          {item.entity.category || 'No category'} • {item.entity.players_count || 0} players
        </Text>
      </View>
      <CheckBox
        value={selectedTeams.some(t => t.id === item.entity.id)}
        onValueChange={() => handleTeamToggle(item)}
        tintColors={{ true: '#3B82F6', false: '#D1D5DB' }}
      />
    </Pressable>
  );

  // Render group item
  const renderGroupItem = ({ item }) => (
    <Pressable
      onPress={() => handleGroupSelect(item)}
      style={[
        tailwind`p-4 border-b border-gray-100 flex-row justify-between items-center`,
        selectedGroup?.id === item.id && tailwind`bg-green-50`
      ]}
    >
      <View style={tailwind`flex-1`}>
        <Text style={tailwind`text-lg font-medium text-gray-800`}>{item.name}</Text>
        <Text style={tailwind`text-sm text-gray-500 mt-1`}>
          Capacity: {item.strength || 'Not set'} teams
        </Text>
      </View>
      {selectedGroup?.id === item.id && (
        <View style={tailwind`w-3 h-3 bg-green-500 rounded-full`} />
      )}
    </Pressable>
  );

  return (
    <Animated.View 
      style={[
        tailwind`flex-1 bg-gray-50`,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <ScrollView
        style={tailwind`flex-1`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={tailwind`bg-white p-2`}>
          <Pressable
            onPress={() => setIsCreateStandingVisible(true)}
            style={tailwind`bg-blue-600 p-4 rounded-xl flex-row justify-center items-center shadow-lg`}
          >
            <Text style={tailwind`text-white text-lg font-semibold`}>
              ⚡ Create Standing
            </Text>
          </Pressable>
        </View>

        {/* Standings Section */}
        <View style={tailwind`p-2`}>
            {console.log("India 336")}
          {loading ? (
            <View style={tailwind`bg-white rounded-xl p-8 items-center shadow-sm`}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={tailwind`text-gray-600 mt-4`}>Loading standings...</Text>
            </View>
          ) : standings?.length > 0 ? (
            standings.filter(group => group.group_name)
                .map((group, index) => (
                    <View key={index} style={tailwind`mb-2 rounded-l shadow-lg bg-white p-2`}>
                        <View style={tailwind``}>
                            <Text style={tailwind`text-black text-lg font-bold`}>
                                {group.group_name}
                            </Text>
                        </View>
                        <PointTable standingsData={group.team_row} game={game} />
                    </View>
                ))

          ) : (
            <View style={tailwind`bg-white rounded-xl p-12 items-center shadow-sm`}>
              <Text style={tailwind`text-6xl mb-4`}>📊</Text>
              <Text style={tailwind`text-xl font-semibold text-gray-800 mb-2`}>
                No Standings Yet
              </Text>
              <Text style={tailwind`text-gray-500 text-center`}>
                Create your first tournament standing to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Standing Modal */}
      {isModalCreateStandingVisible && (
        <Modal
          animationType="slide"
          visible={isModalCreateStandingVisible}
          transparent={true}
        >
          <View style={tailwind`flex-1 justify-end bg-black/50`}>
            <View style={tailwind`bg-white rounded-t-3xl p-6`}>
              <View style={tailwind`flex-row justify-between items-center mb-6`}>
                <Text style={tailwind`text-2xl font-bold text-gray-900`}>
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
                    <View style={tailwind`bg-green-50 p-4 rounded-xl border border-green-200`}>
                      <Text style={tailwind`text-green-800 font-medium`}>
                        Selected Group: {selectedGroup.name}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={tailwind`flex-row gap-4`}>
                    <Pressable
                      onPress={() => setIsModalGroupVisible(true)}
                      style={tailwind`flex-1 p-4 bg-blue-600 rounded-xl items-center`}
                    >
                      <Text style={tailwind`text-white font-semibold text-lg`}>
                        📁 Select Group
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
                        tailwind`flex-1 p-4 rounded-xl items-center`,
                        selectedGroup 
                          ? tailwind`bg-green-600` 
                          : tailwind`bg-gray-300`
                      ]}
                      disabled={!selectedGroup}
                    >
                      <Text style={tailwind`text-white font-semibold text-lg`}>
                        👥 Add Teams
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
              <View style={tailwind`p-6 border-b border-gray-200`}>
                <View style={tailwind`flex-row justify-between items-center mb-4`}>
                  <Text style={tailwind`text-xl font-bold text-gray-900`}>
                    Select Group
                  </Text>
                  <Pressable
                    onPress={() => setCreateGroupMode(!createGroupMode)}
                    style={tailwind`px-3 py-1 bg-blue-100 rounded-full`}
                  >
                    <Text style={tailwind`text-blue-600 font-medium text-sm`}>
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
                      style={tailwind`border border-gray-300 rounded-lg p-3`}
                    />
                    <View style={tailwind`flex-row gap-2`}>
                      <Pressable
                        onPress={handleCreateGroup}
                        disabled={loading}
                        style={tailwind`flex-1 p-3 bg-green-600 rounded-lg items-center`}
                      >
                        <Text style={tailwind`text-white font-medium`}>
                          {loading ? 'Creating...' : 'Create Group'}
                        </Text>
                      </Pressable>
                    </View>
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
                style={tailwind`p-4 bg-gray-100 items-center`}
              >
                <Text style={tailwind`text-gray-600 font-medium`}>Close</Text>
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
              {/* Header */}
              <View style={tailwind`p-6 border-b border-gray-200`}>
                <Text style={tailwind`text-xl font-bold text-gray-900 mb-2`}>
                  Add Teams to {selectedGroup?.name}
                </Text>
                
                {/* Search Bar */}
                <TextInput
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={tailwind`border border-gray-300 rounded-lg p-3 mb-3`}
                />

                {/* Bulk Actions */}
                <View style={tailwind`flex-row justify-between items-center`}>
                  <Text style={tailwind`text-sm text-gray-600`}>
                    {selectedTeams.length} selected
                  </Text>
                  <View style={tailwind`flex-row gap-2`}>
                    <Pressable
                      onPress={() => handleBulkSelect(true)}
                      style={tailwind`px-3 py-1 bg-blue-100 rounded`}
                    >
                      <Text style={tailwind`text-blue-600 text-xs font-medium`}>
                        Select All
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleBulkSelect(false)}
                      style={tailwind`px-3 py-1 bg-gray-100 rounded`}
                    >
                      <Text style={tailwind`text-gray-600 text-xs font-medium`}>
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
                      ? tailwind`bg-gray-300`
                      : tailwind`bg-blue-600`
                  ]}
                >
                  <Text style={tailwind`text-white font-semibold text-lg`}>
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
    </Animated.View>
  );
};

export default TournamentStanding;