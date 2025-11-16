import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScanScreen from "./src/screens/paper-roll/ScanScreen";
import PaperDetailScreen from "./src/screens/paper-roll/PaperDetailScreen";
import { PaperProvider } from "./src/context/PaperContext";

type RootStackParamList = {
  Scan: undefined;
  Detail: { qrText: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider children={undefined}>
      <NavigationContainer children={undefined}>
        <Stack.Navigator children={undefined} initialRouteName="Scan">
          <Stack.Screen name="Scan" component={ScanScreen} options={{ title: "Quét / Nhập" }} />
          <Stack.Screen name="Detail" component={PaperDetailScreen} options={{ title: "Chi tiết cuộn" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
