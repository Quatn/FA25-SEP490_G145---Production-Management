import { Center, CenterProps, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { LuArchiveX, LuSearchX } from "react-icons/lu";

export type DataEmptyProps = CenterProps & {
  text?: string;
  searched?: boolean;
}

export default function DataEmpty(props: DataEmptyProps) {
  return (
    <Center h={"full"} {...props}>
      <Stack alignItems={"center"}>
        {props.searched && <LuSearchX color={"gray"} strokeWidth={1} size={"10rem"} />}
        {!props.searched && <LuArchiveX color={"gray"} strokeWidth={1} size={"10rem"} />}
        <Text colorPalette={"gray"}>{(!check.undefined(props.text)) ? props.text : props.searched ? "Không có dữ liệu hoặc tất cả đều bị ẩn bởi bộ lọc" : "Không có dữ liệu"}</Text>
      </Stack>
    </Center>
  )
}
