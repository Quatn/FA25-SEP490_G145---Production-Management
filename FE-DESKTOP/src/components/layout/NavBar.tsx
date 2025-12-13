import { HStack, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import AuthenticatedContent from "./AuthenticatedContent";
import PrivilegedContent from "./PrivilegedContent";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";

const systemPrivs: AnyAccessPrivileges[] = ["system-admin", "system-read", "system-readWrite"]
const usersPrivs: AnyAccessPrivileges[] = ["user-admin", "user-read", "user-readWrite"]

export default function NavBar() {

  return (
    <nav>
      <HStack bg={{ base: "gray.200", _dark: "gray.900" }} color={{ base: "gray.700", _dark: "gray.300" }} p={1} ps={3} gap={2}>
        <Link href={"/"}>
          <ChakraLink as={"p"} colorPalette={"cyan"}>Home</ChakraLink>
        </Link>

        <AuthenticatedContent
          unauthenticatedContent={
            <>
              <p> - </p>
              <Link href={"/dashboard"}>
                <ChakraLink as={"p"} colorPalette={"cyan"}>Dashboard</ChakraLink>
              </Link>
            </>
          }
        />

        <PrivilegedContent
          requiredPrivileges={[...systemPrivs, ...usersPrivs]}
        >
          <p> - </p>
          <Link href={"/admin-dashboard"}>
            <ChakraLink as={"p"} colorPalette={"cyan"}>Admin Dashboard</ChakraLink>
          </Link>
        </PrivilegedContent>
      </HStack>
    </nav>
  );
}
