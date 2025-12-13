"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { useEffect } from "react";
import store from "@/service/store";
import { hydrate as hydrateUserState } from "@/service/features/authSlice";
import { Provider as ReduxStoreProvider } from "react-redux";

function ReduxHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateUserState());
  }, []);

  return <>{children}</>;
}

export function Provider(props: ColorModeProviderProps) {
  return (
    <ReduxStoreProvider store={store}>
      <ReduxHydrator>
        <ChakraProvider value={defaultSystem}>
          <ColorModeProvider {...props} />
        </ChakraProvider>
      </ReduxHydrator>
    </ReduxStoreProvider>
  );
}
