"use client"

import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import { Avatar, Box, Button, Center, DataList, HStack, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function ProfilePage() {
  const userState: UserState | null = useAppSelector((state) =>
    state.auth.userState
  );

  const stats = [
    { label: "Tên", value: userState?.name },
    { label: "Chức danh", value: userState?.roleName },
    { label: "Mã nhân viên", value: userState?.employeeCode },
    { label: "Email", value: userState?.email },
    { label: "Điện thoại", value: userState?.contactNumber },
    { label: "Địa chỉ", value: userState?.address },
    { label: "Quyền truy cập", value: userState?.accessPrivileges.join(", ") },
  ]

  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
      boxSizing={"border-box"}
      rounded={"sm"}
    >
      <Center>
        <HStack alignItems={"stretch"} gap={20}>
          <Avatar.Root shape="rounded" h="20rem" w="20rem">
            <Avatar.Fallback name={userState?.name} />
            <Avatar.Image src={undefined} />
          </Avatar.Root>
          <Stack justifyContent={"space-between"}>
            <DataList.Root orientation="horizontal">
              {stats.map((item) => (
                <DataList.Item key={item.label}>
                  <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
                  <DataList.ItemValue>{item.value}</DataList.ItemValue>
                </DataList.Item>
              ))}
            </DataList.Root>
            <HStack justifyContent={"end"}>
              <Link href="/change-password">
                <Button size="sm" colorPalette={"blue"}>Đổi mật khẩu</Button>
              </Link>
            </HStack>
          </Stack>
        </HStack>
      </Center>
    </Box>
  );
}
