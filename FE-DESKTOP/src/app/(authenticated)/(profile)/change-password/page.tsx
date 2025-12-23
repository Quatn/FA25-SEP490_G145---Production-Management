import ChangePasswordBox from "@/components/auth/ChangePasswordBox";
import { Box, Center, HStack, Stack, Text } from "@chakra-ui/react";

export default function ChangePassword() {
  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
      boxSizing={"border-box"}
      rounded={"sm"}
    >
      <Center ms={3} mt={5}>
        <Stack>
          <HStack ms={3} justifyContent={"space-between"}>
            <Text fontWeight={"bold"} color={"black"}>
              Đổi mật khẩu
            </Text>
          </HStack>
          <ChangePasswordBox />
        </Stack>
      </Center>
    </Box>
  );
}
