"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import {
  Button,
  Group,
  HStack,
  Input,
  InputGroup,
  NativeSelect,
} from "@chakra-ui/react";

const DomainSelect = () => (
  <NativeSelect.Root size="xs" variant="plain" width="auto" me="-1">
    <NativeSelect.Field defaultValue=".com" fontSize="sm">
      <option value=".com">.com</option>
      <option value=".org">.org</option>
      <option value=".net">.net</option>
    </NativeSelect.Field>
    <NativeSelect.Indicator />
  </NativeSelect.Root>
);

export default function ManufacturingOrderPaginationControl() {
  const { } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <HStack>
      <Group attached>
        <Button variant="outline">Item 1</Button>
        <Button variant="outline">Item 2</Button>
      </Group>

      <InputGroup
        flex="1"
        startElement="https://"
        endElement={<DomainSelect />}
      >
        <Input ps="4.75em" pe="0" placeholder="yoursite.com" />
      </InputGroup>
    </HStack>
  );
}
