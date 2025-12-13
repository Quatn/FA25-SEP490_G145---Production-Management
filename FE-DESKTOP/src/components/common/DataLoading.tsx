import { Center, CenterProps, Spinner, Stack, Text } from "@chakra-ui/react";
import check from "check-types";

export type DataLoadingProps = CenterProps & {
  text?: string
}

export default function DataLoading(props: DataLoadingProps) {
  return (
    <Center h={"full"} {...props}>
      <Stack alignItems={"center"}>
        <Spinner size="xl" />
        <Text>{check.undefined(props.text) ? "Đang tải" : props.text}</Text>
      </Stack>
    </Center>
  )
}
