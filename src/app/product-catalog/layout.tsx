import Header from "@/components/Header";
import { Flex } from "@chakra-ui/react";

export default function POLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex h={"full"} direction={"column"} grow={1}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
      <footer>
      </footer>
    </Flex>
  );
}
