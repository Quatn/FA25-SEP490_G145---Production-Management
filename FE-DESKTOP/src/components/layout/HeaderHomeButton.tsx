import { Heading, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { BsBoxSeam } from "react-icons/bs";

export default function HeaderHomeButton() {
  return (
    <Link href={"/"}>
      <HStack ms={2}>
        <BsBoxSeam size={"2rem"} />
        <Heading>XC Production Management System</Heading>
      </HStack>
    </Link>
  )
}
