// App.tsx
import React from "react";
import { Provider } from "react-redux";
import store from "./src/service/store";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScanScreen from "./src/screens/paper-roll/ScanScreen";
import PaperDetailScreen from "./src/screens/paper-roll/PaperDetailScreen";
import ImportExportButtonScreen from "./src/screens/paper-roll/ImportExportButtonScreen";
import { PaperProvider } from "./src/context/PaperContext";

type RootStackParamList = {
  ImportExportButton: undefined;
  Scan: { action?: "import" | "export" } | undefined;
  Detail: { qrText: string; action?: "import" | "export" };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="ImportExportButton">
            <Stack.Screen
              name="ImportExportButton"
              component={ImportExportButtonScreen}
              options={{ title: "Chọn thao tác" }}
            />
            <Stack.Screen
              name="Scan"
              component={ScanScreen}
              options={{ title: "Quét / Nhập" }}
            />
            <Stack.Screen
              name="Detail"
              component={PaperDetailScreen}
              options={{ title: "Chi tiết cuộn" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}
