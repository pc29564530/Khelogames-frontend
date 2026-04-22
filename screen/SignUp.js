import { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions
} from 'react-native';

import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTH_URL } from '../constants/ApiConstants';
import { setAuthenticated, setUser, setAuthProfile, setAuthProfilePublicID, setAuthUser, setAuthUserPublicID, setCurrentProfile } from '../redux/actions/actions';

import { storeRefreshToken, storeRefreshTokenExpiresAt } from '../utils/SecureStorage';
import { validateAuthForm } from '../utils/validation/authValidation';
import { use } from 'react';

const SignUp = () => {

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  /* responsive helpers */
  const CARD_WIDTH = Math.min(width * 0.92, 420);
  const ICON_SIZE = Math.min(width * 0.08, 32);
  const FONT_TITLE = Math.min(width * 0.065, 26);
  const FONT_TEXT = Math.min(width * 0.04, 16);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState({
    global: null,
    fields: {},
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailSignUp = async () => {
    console.log("Lineno 65")
    try {

      const validation = validateAuthForm(formData);
      console.log("Validation: ", validation)
      if (!validation.isValid) {
        setError(validation.errors);
        return;
      }


      setLoading(true);

      const signupData = {
        full_name: formData.full_name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

      const response = await axios.post(`${AUTH_URL}/google/createEmailSignUp`, signupData);

      if (response.data.success) {

        const item = response.data;

        await AsyncStorage.multiSet([
          ["AccessToken", item.accessToken],
          ["AccessTokenExpiresAt", item.accessTokenExpiresAt],
          ["UserPublicID", item.user.public_id],
          ["Role", item.user.role],
          ["User", JSON.stringify(item.user)],
        ]);

        await storeRefreshToken(item.refreshToken);
        await storeRefreshTokenExpiresAt(item.refreshTokenExpiresAt);

        const profileResponse = await axios.get(
          `${AUTH_URL}/getProfile/${item.user.public_id}`,
          {
            headers: {
              Authorization: `Bearer ${item.accessToken}`
            }
          }
        );

        
        dispatch(setAuthProfile(profileResponse.data.data));
        dispatch(setCurrentProfile(profileResponse.data.data));
        dispatch(setAuthProfilePublicID(profileResponse.data.data.public_id));
        dispatch(setAuthUser(item.user));
        dispatch(setAuthUserPublicID(item.user.public_id));
        dispatch(setAuthenticated(true));

        // Use reset instead of navigate
        navigation.reset({
          index: 0,
          routes: [{ name: "DrawerNavigation" }],
        });
      }

    } catch (err) {

      setError({
        global: err.response?.data?.error?.message || "Unable to create account",
        fields: {}
      });

    } finally {
      setLoading(false);
    }

  };

  navigation.setOptions({
    title: '',
    headerStyle: { backgroundColor: '#0f172a' },
    headerTintColor: 'white',
    headerRight: () => (
      <View style={{ marginRight: 16 }}>
        <Pressable onPress={() => navigation.navigate('SignIn')}>
          <FontAwesome name="close" size={22} color="white" />
        </Pressable>
      </View>
    )
  });

  return (

    <ScrollView
      style={{ flex: 1, backgroundColor: "#0f172a" }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}

      <View
        style={{
          paddingTop: height * 0.1,
          paddingBottom: height * 0.05,
          alignItems: "center",
          paddingHorizontal: 20
        }}
      >

        <View
          style={{
            backgroundColor: "#1e293b",
            width: width * 0.16,
            height: width * 0.16,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16
          }}
        >
          <MaterialIcons name="emoji-events" size={ICON_SIZE} color="#ef4444" />
        </View>

        <Text style={{ color: "#f1f5f9", fontSize: FONT_TITLE, fontWeight: "bold" }}>
          Create Account
        </Text>

        <Text style={{ color: "#94a3b8", marginTop: 6, textAlign: "center" }}>
          Join Kridagram and start your journey
        </Text>

      </View>

      {/* Card */}

      <View
        style={{
          width: CARD_WIDTH,
          alignSelf: "center",
          backgroundColor: "#1e293b",
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: "#334155"
        }}
      >

        {error.global && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: "#f87171", textAlign: "center" }}>
              {error.global}
            </Text>
          </View>
        )}

        {/* INPUT FUNCTION */}

        {[
          { key: "full_name", label: "Full Name", icon: "person" },
          { key: "email", label: "Email", icon: "email" }
        ].map(item => (

          <View key={item.key} style={{ marginBottom: 16 }}>

            <Text style={{ color: "#cbd5f5", marginBottom: 6 }}>
              {item.label}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#020617",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12
              }}
            >

              <MaterialIcons name={item.icon} size={20} color="#64748b" />

              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: "white",
                  fontSize: FONT_TEXT
                }}
                placeholder={`Enter ${item.label}`}
                placeholderTextColor="#64748b"
                value={formData[item.key]}
                onChangeText={(text) => handleInputChange(item.key, text)}
              />

            </View>
            {error.fields && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: "#f87171", textAlign: "center" }}>
                  {error.fields.label}
                </Text>
              </View>
            )}

          </View>

        ))}

        {/* PASSWORD */}

        <View style={{ marginBottom: 16 }}>

          <Text style={{ color: "#cbd5f5", marginBottom: 6 }}>
            Password
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#020617",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12
            }}
          >

            <MaterialIcons name="lock" size={20} color="#64748b" />

            <TextInput
              style={{ flex: 1, marginLeft: 10, color: "white", fontSize: FONT_TEXT }}
              placeholder="Enter password"
              placeholderTextColor="#64748b"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color="#64748b"
              />
            </Pressable>

          </View>

        </View>

        {/* CONF PASSWORD */}
        <View style={{ marginBottom: 16 }}>

          <Text style={{ color: "#cbd5f5", marginBottom: 6 }}>
            Confirm Password
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#020617",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12
            }}
          >

            <MaterialIcons name="lock" size={20} color="#64748b" />

            <TextInput
              style={{ flex: 1, marginLeft: 10, color: "white", fontSize: FONT_TEXT }}
              placeholder="Enter password"
              placeholderTextColor="#64748b"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirm_password}
              onChangeText={(text) => handleInputChange("confirm_password", text)}
            />

            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color="#64748b"
              />
            </Pressable>

          </View>

        </View>

        {/* BUTTON */}

        <Pressable
          style={{
            backgroundColor: "#ef4444",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center"
          }}
          onPress={() => handleEmailSignUp()}
        >

          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={{ color: "white", fontWeight: "bold", fontSize: FONT_TEXT }}>
                Create Account
              </Text>
          }

        </Pressable>

        {/* Login Link */}
        <View style={tailwind`flex-row justify-center items-center`}>
            <Text style={tailwind`text-slate-400 text-sm`}>
                Already have an account?
            </Text>

            <Pressable onPress={() => navigation.navigate("SignIn")}>
                <Text style={tailwind`text-red-400 text-sm font-semibold ml-1`}>
                Sign In
                </Text>
            </Pressable>
        </View>

      </View>

    </ScrollView>

  );

};

export default SignUp;