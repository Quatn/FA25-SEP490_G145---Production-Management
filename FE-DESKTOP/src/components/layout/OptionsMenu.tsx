"use client";

import { Button, Stack } from "@chakra-ui/react";
import {
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
import UserAvatar from "./UserAvatar";
import PrivilegedContent from "./PrivilegedContent";
import Link from "next/link";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";

const systemPrivs: AnyAccessPrivileges[] = ["system-admin", "system-read", "system-readWrite"]
const usersPrivs: AnyAccessPrivileges[] = ["user-admin", "user-read", "user-readWrite"]

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
          <Stack>
            <UserAvatar displayDetails />
            <DrawerTitle>Options</DrawerTitle>
          </Stack>
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
          <PrivilegedContent
            requiredPrivileges={[...systemPrivs, ...usersPrivs]}
          >
            <Link href={"/admin-dashboard"}>
              <Button colorPalette={"blue"} variant="solid">Admin Dashboard</Button>
            </Link>
          </PrivilegedContent>

          <AuthenticatedContent>
            <LogoutButton />
          </AuthenticatedContent>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  );
};
