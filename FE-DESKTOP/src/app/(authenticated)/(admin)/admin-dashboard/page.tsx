"use client"
// import { Box, Text } from "@chakra-ui/react";
import { redirect, RedirectType } from 'next/navigation'

export default function AdminDashboard() {
  redirect('/user', RedirectType.replace)

  /*
  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
      boxSizing={"border-box"}
      rounded={"sm"}
      bg={"gray.200"}
    >
      <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
        Admin Dashboard
      </Text>
    </Box>
  );
    */
}
