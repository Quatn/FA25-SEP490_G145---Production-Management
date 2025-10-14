import { Input, InputGroup } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

export default function SearchBar() {
  return (
    <InputGroup flex="1" startElement={<LuSearch />}>
      <Input placeholder="Search contacts" borderColor="#4E4E4E" />
    </InputGroup>
  );
}
