import InsufficientPrivilegeErrorWarning from "@/components/layout/InsufficientPrivilegeErrorWarning";
import PrivilegedContent from "@/components/layout/PrivilegedContent";
import { fluteCombinationAdminPrivileges } from "@/types/CascadingAccessPrivileges";
import { Box, Center, Spinner } from "@chakra-ui/react";

export default function FluteCombinationRestoreListLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PrivilegedContent
      requiredPrivileges={fluteCombinationAdminPrivileges}
      loading={
        <Box
          flexGrow={1}
        >
          <Center h="full">
            <Spinner />
          </Center>
        </Box>
      }
      unauthenticatedContent={<InsufficientPrivilegeErrorWarning
        flexGrow={1}
        rounded={"lg"}
        m={5}
        colorPalette={"gray"}
        bg={"colorPalette.subtle"}
      />}
    >
      {/* ^^^ Add this to guard a page ^^^*/}
      {children}
    </PrivilegedContent >
  );
}
