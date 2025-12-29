import UserManagementList from "@/components/user/user-management-page/List";
import { UserManagementPageProvider } from "@/context/user/userManagementPageContext";
import { Box, Heading, Stack } from "@chakra-ui/react";

export default function PaperSupplierHome() {
  return (
    <UserManagementPageProvider>
      <Box
        m={5}
        p={2}
        flexGrow={1}
        boxSizing={"border-box"}
        rounded={"sm"}
      >
        <Stack ms={3} direction={"row"} justifyContent={"space-between"}>
          <Heading>Danh sách người dùng</Heading>
        </Stack>
        <Stack ms={3} mt={5}>
          <UserManagementList />
        </Stack>
      </Box>
    </UserManagementPageProvider>
  );
}
