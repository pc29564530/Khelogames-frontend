import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import tailwind from 'twrnc';

class ErrorBoundary extends React.Component {
    constructor(props) {
        console.log("Lin eno 7: ", props)
        super(props);
        this.state = {hasError: false, error: null};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error: error}
    }

    componentDidCatch(error, errorInfo) {
        console.log("line no 16: ", error);
        console.log("line no ");
        console.error("ErrorBoundary caught an error", error, errorInfo);
         // Send to Sentry / backend
        // Sentry.captureException(error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={tailwind`font-bold font-xl items-center justify-center`}>Something went wrong.</Text>
                    <Text style={tailwind`font-lg items-center justify-center`}>{this.state.error.toString()}</Text>
                </View>
            );
        }
        return this.props.children;
    }  
}

export default ErrorBoundary;