import { DeviceEventEmitter } from 'react-native';

class ToastManager {
    static show(message, type = 'info', duration = 3000) {
        DeviceEventEmitter.emit('showToast', {
            message,
            type,
            duration,
            timestamp: Date.now(),
        });
    }

    static success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    static error(message, duration = 4000) {
        this.show(message, 'error', duration);
    }

    static warning(message, duration = 3500) {
        this.show(message, 'warning', duration);
    }

    static info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
}

export default ToastManager;
