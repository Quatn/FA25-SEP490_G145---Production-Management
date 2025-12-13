import { Center, CenterProps, Link, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { LuTriangleAlert } from "react-icons/lu";

export type DataFetchErrorProps = CenterProps & {
  errorText?: string,
  refetch?: () => void,
}

export default function DataFetchError(props: DataFetchErrorProps) {
  return (
    <Center h={"full"} {...props}>
      <Stack alignItems={"center"}>
        <LuTriangleAlert color={"#ee6666"} strokeWidth={1} size={"10rem"} />
        <Text colorPalette={"red"} color={"colorPalette.fg"}>{check.undefined(props.errorText) ? "Có lỗi xảy ra trong quá trình lấy dữ liệu" : props.errorText}</Text>
        {props.refetch && (
          <Link as="p" colorPalette={"teal"} onClick={props.refetch}>Thử lại</Link>
        )}
      </Stack>
    </Center>
  )
}
