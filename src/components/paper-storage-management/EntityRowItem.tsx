import { EntityRow } from "@/types/paperStorage.types";
import { Flex, Field, Input, Box, Button } from "@chakra-ui/react";

interface EntityRowItemProps {
    row: EntityRow;
    index: number;
    onChange: (index: number, field: keyof EntityRow, value: string) => void;
    onSaveOrUpdate: (index: number) => void;
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
    labelPrefix?: string;
}

export const EntityRowItem = ({
  row,
  index,
  onChange,
  onSaveOrUpdate,
  onRemove,
  onEdit,
  labelPrefix = "Dòng",
}: EntityRowItemProps) => {
  const isInvalidCode = !!row.error?.code;
  const isInvalidName = !!row.error?.name;
  const isActionDisabled = isInvalidCode || isInvalidName;

  return (
    <Flex gap={3} direction="row">
      <Field.Root
        invalid={isInvalidCode}
        orientation="vertical"
        width="56"
        disabled={row.isSaved && !row.isEditing || row.isLoading}
      >
        {index === 0 && <Field.Label fontSize="lg">Mã {labelPrefix}</Field.Label>}
        <Input
          size="lg"
          fontSize="lg"
          fontWeight="bold"
          value={row.code}
          placeholder="Nhập mã"
          borderColor="gray"
          onChange={(e) => onChange(index, "code", e.target.value.toUpperCase())}
        />
        <Box minH="20px" mt="1">
          {row.error?.code && <Field.ErrorText>{row.error.code}</Field.ErrorText>}
        </Box>
      </Field.Root>

      <Field.Root
        invalid={isInvalidName}
        orientation="vertical"
        disabled={row.isSaved && !row.isEditing || row.isLoading}
      >
        {index === 0 && <Field.Label fontSize="lg">Tên {labelPrefix}</Field.Label>}
        <Input
          size="lg"
          fontSize="lg"
          fontWeight="bold"
          value={row.name}
          placeholder="Nhập tên"
          borderColor="gray"
          onChange={(e) => onChange(index, "name", e.target.value.toUpperCase())}
        />
        <Box minH="20px" mt="1">
          {row.error?.name && <Field.ErrorText>{row.error.name}</Field.ErrorText>}
        </Box>
      </Field.Root>

      <Button
        colorPalette={row.isSaved ? (row.isEditing ? "blue" : "yellow") : "blue"}
        marginTop={index === 0 ? "7" : undefined}
        loading={row.isLoading}
        disabled={isActionDisabled}
        onClick={() =>
          row.isSaved && !row.isEditing ? onEdit(index) : onSaveOrUpdate(index)
        }
      >
        {row.isSaved ? (row.isEditing ? "Lưu" : "Sửa") : "Lưu"}
      </Button>

      <Button
        colorPalette="red"
        marginTop={index === 0 ? "7" : undefined}
        disabled={row.isLoading}
        loading={row.isDeleting}
        onClick={() => onRemove(index)}
      >
        Xóa
      </Button>
    </Flex>
  );
};