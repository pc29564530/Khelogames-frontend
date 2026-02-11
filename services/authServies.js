import axios from "axios";
import { AUTH_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {setAuthenticated, setUser, logout} from '../redux/actions/actions';
import {persistor} from '../redux/store';
import { clearSecureStorage, removeRefreshToken, storeRefreshToken, storeRefreshTokenExpiresAt } from "../utils/SecureStorage";
import { logSilentError } from "../utils/errorHandler";

export const loginServies = async ({ username, password, dispatch, isAuthenticated }) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, {username,password });
        const item = response.data;
        await AsyncStorage.setItem("AccessToken", item.access_token);
        await AsyncStorage.setItem("Role", item.user.role);
        await AsyncStorage.setItem("User", item.user);
        await AsyncStorage.setItem("AccessTokenExpiresAt", item.access_token_expires_at);
        await storeRefreshToken(item.refresh_token);
        await storeRefreshTokenExpiresAt(item.refresh_token_expires_at);
        dispatch(setAuthenticated(!isAuthenticated));
        dispatch(setUser(item.user));
    } catch (err) {
      await AsyncStorage.clear();
      dispatch(setAuthenticated(false));
      logSilentError(err, {action: 'login'});
    }
};

export const logoutServies = async ({dispatch}) => {
    try {
        const userPublicID = await AsyncStorage.getItem('UserPublicID');
        await axios.delete(`${AUTH_URL}/removeSession/${userPublicID}`);
        dispatch(logout());
        await AsyncStorage.clear();
        dispatch(setAuthenticated(false));
        await clearSecureStorage();
        await persistor.purge();
    } catch (err) {
        logSilentError(err, {action: 'logout'});
    }
}