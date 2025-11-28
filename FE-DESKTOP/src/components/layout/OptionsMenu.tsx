"use client";

import { Button } from "@chakra-ui/react";
import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ReactNode, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useColorMode } from "@/components/ui/color-mode";
import AuthenticatedContent from "./AuthenticatedContent";
import LogoutButton from "../auth/LogoutButton";

export const OptionsMenu = (props: {
  open?: boolean;
  trigger: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(props.open ?? false);
  }, [props.open]);

  const cm = useColorMode();
  const [checked, setChecked] = useState(cm.colorMode === "dark");
  const handleSetChecked = (checked: boolean) => {
    cm.setColorMode(checked ? "dark" : "light");
    setChecked(checked);
  };

  return (
    <DrawerRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        {props.trigger}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Options</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <Switch
            checked={checked}
            onCheckedChange={(e) => handleSetChecked(e.checked)}
          >
            Dark mode
          </Switch>
        </DrawerBody>
        <DrawerFooter>
          <AuthenticatedContent>
            <LogoutButton />
          </AuthenticatedContent>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  );
};
