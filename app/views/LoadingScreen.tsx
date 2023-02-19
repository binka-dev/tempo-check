import React from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

function LoadingScreen() {
    return (
        <View style={{flex: 1, justifyContent:'center'}}>
            <ActivityIndicator animating={true} size={"large"}/>
        </View>
        
    )
}
export default LoadingScreen;