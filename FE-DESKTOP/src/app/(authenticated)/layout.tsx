import AuthenticatedContent from "@/components/layout/AuthenticatedContent";
import UnauthenticatedErrorWarning from "@/components/layout/UnauthenticatedErrorWarning";
import { Box, Center, Spinner } from "@chakra-ui/react";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthenticatedContent
      loading={
        <Box
          w={"100vw"}
          h={"100vh"}
          colorPalette={"gray"}
          bg={"colorPalette.subtle"}
        >
          <Center h="full">
            <Spinner />
          </Center>
        </Box>
      }
      unauthenticatedContent={<UnauthenticatedErrorWarning
        w={"100vw"}
        h={"100vh"}
        colorPalette={"gray"}
        bg={"colorPalette.subtle"}
      />}
    >
      {children}
    </AuthenticatedContent>
  );
}
