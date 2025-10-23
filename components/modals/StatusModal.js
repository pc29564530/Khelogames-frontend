import {Modal, View, Text, Pressable, ScrollView, TouchableOpacity} from 'react-native'
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import tailwind from 'twrnc';

export const StatusModal = ({ statuses, visible, onClose, onStatusSelect }) => {
    return (
      <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
        <TouchableOpacity onPress={onClose} style={tailwind`flex-1 justify-end bg-black/50`}>
          <View style={tailwind`bg-white rounded-t-3xl px-6 py-6 shadow-xl`}>
            <View style={tailwind`items-center mb-4`}>
              <View style={tailwind`w-12 h-1.5 bg-gray-300 rounded-full`} />
              <Text style={tailwind`text-xl font-bold text-gray-900 mt-3`}>
                Update Match Status
              </Text>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {statuses?.map((status) => (
                <Pressable
                  key={status.code}
                  onPress={() => onStatusSelect(status.code)}
                  style={tailwind`py-4 px-3 border-b border-gray-200 flex-row items-center`}
                >
                  <MaterialIcon name="sports-cricket" size={22} color="#4b5563" />
                  <Text style={tailwind`text-lg text-gray-700 ml-3`}>{status.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };