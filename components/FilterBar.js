import {View, Text, Pressable,} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

export const FilterBar = ({typeFilter, setTypeFilterModal, setStatusFilterModal, statusFilter}) => {
  return (
    <View
      style={[
        tailwind`flex-row items-center px-4 py-2`,
        {
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#334155"
        }
      ]}
    >
      <Pressable
        style={[
          tailwind`flex-row items-center px-3.5 py-2 rounded-lg border mr-2`,
          typeFilter !== "all"
            ? tailwind`border-red-400 bg-red-400`
            : { borderColor: "#334155" }
        ]}
        onPress={() => setTypeFilterModal(true)}
      >
        <MaterialIcons
          name="filter-list"
          size={16}
          color={typeFilter !== "all" ? "white" : "#94a3b8"}
        />
        <Text
          style={[
            tailwind`text-sm ml-1.5`,
            typeFilter !== "all"
              ? tailwind`text-white`
              : { color: "#94a3b8" }
          ]}
        >
          {typeFilter !== "all" ? typeFilter : "Category"}
        </Text>
      </Pressable>

      <Pressable
        style={[
          tailwind`flex-row items-center px-3.5 py-2 rounded-lg border`,
          statusFilter !== "all"
            ? tailwind`border-red-400 bg-red-400`
            : { borderColor: "#334155" }
        ]}
        onPress={() => setStatusFilterModal(true)}
      >
        <MaterialIcons
          name="schedule"
          size={16}
          color={statusFilter !== "all" ? "white" : "#94a3b8"}
        />
        <Text
          style={[
            tailwind`text-sm ml-1.5`,
            statusFilter !== "all"
              ? tailwind`text-white`
              : { color: "#94a3b8" }
          ]}
        >
          {statusFilter !== "all" ? statusFilter : "Status"}
        </Text>
      </Pressable>
    </View>
  );
};

export const MatchesFilterBar = ({
  selectedDate,
  setIsDatePickerVisible,
  handleLocation,
  handleLiveMatches,
  formattedDate
}) => {
  return (
    <View
      style={[
        tailwind`flex-row items-center justify-between px-4 py-3`,
        {
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#334155"
        }
      ]}
    >
      {/* DATE */}
      <Pressable
        style={tailwind`flex-row items-center`}
        onPress={() => setIsDatePickerVisible(true)}
      >
        <AntDesign name="calendar" size={20} color="#94a3b8" />

        <Text style={[tailwind`ml-2`, { color: "#f1f5f9" }]}>
          {formattedDate(selectedDate)}
        </Text>
      </Pressable>

      {/* ACTION BUTTONS */}
      <View style={tailwind`flex-row`}>
        <Pressable
          onPress={handleLocation}
          style={tailwind`bg-slate-700 px-3 py-1 rounded mr-2`}
        >
          <Text style={tailwind`text-white text-xs`}>Nearby</Text>
        </Pressable>

        <Pressable
          onPress={handleLiveMatches}
          style={tailwind`bg-red-500 px-3 py-1 rounded`}
        >
          <Text style={tailwind`text-white text-xs`}>Live</Text>
        </Pressable>
      </View>
    </View>
  );
};