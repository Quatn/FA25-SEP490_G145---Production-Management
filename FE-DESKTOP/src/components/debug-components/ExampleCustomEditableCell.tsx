import { Input, NumberInput, Portal, Select } from "@chakra-ui/react"
import check from "check-types"
import { formatDateToYYYYMMDD } from "@/utils/dateUtils"
import { DataTableEditableCellInputTypes } from "../ui/data-table/constants"
import { DataTableEditableCellProps } from "../ui/data-table/types"

export const ExampleCustomDataTableEditableCell = (props: DataTableEditableCellProps) => {
  switch (props.type) {
    case DataTableEditableCellInputTypes.Text:
      return (
        <Input
          colorPalette={"red"}
          bg={"colorPalette.muted"}
          value={props.value as string}
          variant="flushed"
          width="100%"
          padding="0"
          margin="0"
          onChange={(ev) => props.setValue(ev.target.value)}
          placeholder={"Nhấn để nhập"} onBlur={(ev) => {
            if (props.onBlur)
              props.onBlur(ev.target.value)
          }}
        />
      )
    case DataTableEditableCellInputTypes.Select:
      if (props.selectCollection) {
        const col = props.selectCollection
        return (
          <Select.Root
            colorPalette={"green"}
            bg={"colorPalette.muted"}
            collection={col}
            size="sm"
            w="full"
            value={[props.value as string]}
            onValueChange={(e) => props.updateTableData(check.undefined(e.value.at(0)) ? "" : e.value.at(0)!)}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Chọn" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {col.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        )
      }
      return <p>Chưa có lựa chọn</p>
    case DataTableEditableCellInputTypes.Number:
      return (
        <NumberInput.Root
          colorPalette={"blue"}
          bg={"colorPalette.muted"}
          value={props.value as string}
          onValueChange={(ev) => props.setValue(ev.value)}
          defaultValue={"0"} onFocusChange={(ev) => {
            if (!ev.focused && props.onBlur)
              props.onBlur(ev.value)
          }}
        >

          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
      )
    case DataTableEditableCellInputTypes.Date:
      return (
        <Input
          bg={"bg"}
          type="date"
          value={[formatDateToYYYYMMDD(props.value as string | Date)]}
          onChange={(ev) => {
            return props.setValue(new Date(ev.target.value))
          }}
          placeholder={"Nhấn để nhập"} onBlur={(ev) => {
            if (props.onBlur)
              props.onBlur(ev.target.value)
          }}
        />
      )
  }
}
