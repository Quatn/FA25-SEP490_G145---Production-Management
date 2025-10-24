import { SupplierRow } from "@/types/paperSupplier.types";
import { Box, Button, Field, Flex, Input } from "@chakra-ui/react";


type Props = {
    row: SupplierRow;
    index: number;
    onChange: (index: number, field: keyof SupplierRow, value: string) => void;
    onSaveOrUpdate: (index: number) => void;
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
};

export const SupplierRowItem: React.FC<Props> = ({
    row,
    index,
    onChange,
    onSaveOrUpdate,
    onRemove,
    onEdit,
}) => {
    const isInvalidCode = !!row.error?.code;
    const isInvalidName = !!row.error?.name;
    const isActionDisabled =
        ((row.isEditing || !row.isSaved) &&
            (isInvalidCode || isInvalidName)) ||
        row.isLoading ||
        row.isDeleting;

    return (
        <Flex gap={3} direction="row">
            <Field.Root
                invalid={isInvalidCode}
                orientation="vertical"
                width="56"
                disabled={row.isSaved && !row.isEditing || row.isLoading}
            >
                {index === 0 && <Field.Label fontSize="lg">Mã nhà giấy</Field.Label>}
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
                {index === 0 && <Field.Label fontSize="lg">Tên nhà giấy</Field.Label>}
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
                onClick={() => (row.isSaved && !row.isEditing ? onEdit(index) : onSaveOrUpdate(index))}
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
