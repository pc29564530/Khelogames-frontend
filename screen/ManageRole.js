import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, FlatList, ActivityIndicator, Image, Modal } from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { useNavigation } from '@react-navigation/native';

const ROLE_OPTIONS = [
  { key: 'owner', label: 'Owner' },
  { key: 'admin', label: 'Admin' },
  { key: 'scorer', label: 'Scorer' },
  { key: 'umpire', label: 'Umpire' },
  { key: 'media_manager', label: 'Media Manager' },
  { key: 'viewer', label: 'Viewer' },
];

const ManageRole = ({ route, navigation }) => {
  const { tournament } = route.params;
  const modalInputRef = useRef(null);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const game = useSelector((state) => state.sportReducers.game);

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      setUserResults([]);
      return;
    }

    const delaySearch = setTimeout(() => onSearchUser(search), 500);
    return () => clearTimeout(delaySearch);
  }, [search]);

  const onSearchUser = async (q) => {
    if (!q.trim()) return;

    setSearching(true);
    try {
      const token = await AsyncStorage.getItem("AccessToken");
      const res = await axiosInstance.post(
        `${BASE_URL}/search-user`,
        { name: q },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserResults(res.data || []);
      setShowModal(true); // OPEN MODAL
    } catch (err) {
      console.log("Search error:", err);
      setUserResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setShowModal(false);
    setSearch('');
  };

  const onSave = async () => {
    if (!selectedUser) return alert("Select a user");
    if (!selectedRoles) return alert("Select a role");

    try {
      const token = await AsyncStorage.getItem("AccessToken");

      const data = {
        tournament_public_id: tournament.public_id,
        user_public_id: selectedUser.public_id,
        role: selectedRoles,
      };

      const res = await axiosInstance.post(
        `${BASE_URL}/${game.name}/createTournamentUserRole/${tournament.public_id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Role assigned successfully!");
      setSelectedRoles(null);
      setSelectedUser(null);

    } catch (err) {
      console.log(err);
      alert("Failed to assign role");
    }
  };

  useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: `Add User Role`,
            headerLeft: () => (
                <Pressable onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
                </Pressable>
            ),
            headerStyle: tailwind`bg-red-400`,
        });
    }, [navigation]);

  useEffect(() => {
    if(showModal) {
      setTimeout(() => {
        modalInputRef?.current?.focus();
      }, 100)
    }
  },[showModal])


  return (
    <View style={tailwind`flex-1 bg-white`}>

      {/* HEADER */}
      <View style={tailwind`p-4 flex-row justify-between items-center`}>
        <Text style={tailwind`text-lg font-bold`}>Manage Roles</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={22} />
        </Pressable>
      </View>

      {/* SEARCH */}
      <View style={tailwind`px-4`}>
        <TextInput
          placeholder="Search by name"
          value={search}
          onChangeText={(t) => {
            setSearch(t)
            if(!showModal && t.trim() !== "") {
              setShowModal(true);
            }
          }}
          style={tailwind`border border-gray-300 p-2 rounded`}
        />

        {searching && (
          <View style={tailwind`p-2`}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>

      {/* SELECTED USER */}
      {selectedUser && (
        <View style={tailwind`mt-3 mx-4 p-3 bg-gray-100 rounded`}>
          <Text style={tailwind`font-semibold`}>
            Selected: {selectedUser.full_name}
          </Text>
        </View>
      )}

      {/* ROLE OPTIONS */}
      <View style={tailwind`mt-4 mx-4`}>
        <Text style={tailwind`font-semibold mb-2`}>Select Role</Text>

        <View style={tailwind`flex-row flex-wrap`}>
          {ROLE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setSelectedRoles(opt.key)}
              style={tailwind`border rounded px-3 py-2 mr-2 mb-2 ${
                selectedRoles === opt.key
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300"
              }`}
            >
              <Text
                style={tailwind`${
                  selectedRoles === opt.key
                    ? "text-white font-semibold"
                    : "text-gray-700"
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* SAVE BUTTON */}
      <View style={tailwind`mt-6 mx-4`}>
        <Pressable
          onPress={onSave}
          style={tailwind`px-4 py-3 bg-red-400 rounded items-center ${
            !selectedUser || !selectedRoles ? "opacity-50" : ""
          }`}
          disabled={!selectedUser || !selectedRoles}
        >
          <Text style={tailwind`text-white font-semibold`}>Save Role</Text>
        </Pressable>
      </View>

      {/* USER SEARCH MODAL */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={tailwind`flex-1 bg-black/40 justify-end`}>
          <View style={tailwind`bg-white p-4 rounded-t-2xl max-h-3/5`}>

            <View style={tailwind`flex-row justify-between items-center mb-3`}>
              <Text style={tailwind`text-lg font-bold`}>Select User</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={22} />
              </Pressable>
            </View>
            <TextInput
              ref={modalInputRef}
              placeholder="Search by name"
              value={search}
              onChangeText={(t) => {
                setSearch(t)
              }}
              style={tailwind`border border-gray-300 p-2 rounded`}
            />
            {userResults.length > 0 ? (
                <FlatList
                  data={userResults}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => selectUser(item)}
                      style={tailwind`p-3 border-b border-gray-200`}
                    >
                      <View style={tailwind`flex-row items-center gap-3`}>
                        {item.avatar_url ? (
                          <Image
                            source={{ uri: item.avatar_url }}
                            style={tailwind`w-10 h-10 rounded-full`}
                          />
                        ) : (
                          <View
                            style={tailwind`w-10 h-10 rounded-full bg-yellow-300 items-center justify-center`}
                          >
                            <Text style={tailwind`font-semibold`}>
                              {item.full_name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}

                        <View style={tailwind``}>
                          <Text style={tailwind`font-medium`}>{item.full_name}</Text>
                          <Text style={tailwind`text-xs text-black`}>
                            {item.username}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  )}
                />
            ):(
                <View style={tailwind`py-6 items-center justify-center`}>
                  <MaterialIcons name="search-off" size={30} color="gray" />
                  <Text style={tailwind`text-sm text-gray-600 mt-2`}>
                    No Result Found
                  </Text>
                </View>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default ManageRole;
