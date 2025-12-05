import { Center, CenterProps, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { LuTriangleAlert } from "react-icons/lu";

export type DataFetchErrorProps = CenterProps & {
  errorText?: string
}

export default function DataFetchError(props: DataFetchErrorProps) {
  return (
    <Center h={"full"} {...props}>
      <Stack alignItems={"center"} colorPalette={"red"}>
        <LuTriangleAlert color={"#ee6666"} strokeWidth={1} size={"10rem"} />
        <Text color={"colorPalette.solid"}>{check.undefined(props.errorText) ? "Có lỗi xảy ra trong quá trình lấy dữ liệu" : props.errorText}</Text>
      </Stack>
    </Center>
  )
}
