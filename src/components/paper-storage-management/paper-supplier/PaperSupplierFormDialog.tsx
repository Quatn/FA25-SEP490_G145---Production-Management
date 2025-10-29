import { useState, useEffect } from "react";
import { Box, Button, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react"
import { PaperSupplier } from "@/types/PaperSupplier";

interface PaperSupplierFormDialogProps {
    existingSuppliers: PaperSupplier[];
    isOpen: boolean;
    onClose: () => void;
    initialData?: PaperSupplier;
    onAdd: (data: PaperSupplier) => void;
    onUpdate: (data: PaperSupplier) => void;
}

type ErrorMap = Record<string, string>;

const PaperSupplierFormDialog: React.FC<PaperSupplierFormDialogProps> = ({
    existingSuppliers,
    isOpen,
    onClose,
    initialData,
    onAdd,
    onUpdate,
}) => {
    const [supplier, setSupplier] = useState<PaperSupplier>({
        code: "",
        name: "",
    });

    const [errors, setErrors] = useState<ErrorMap>({});

    const validateField = (field: keyof PaperSupplier, value: string) => {
        let errorMsg = "";

        if (field === "code") {
            if (!value.trim()) errorMsg = "Mã nhà giấy không được để trống";
            else if (!/^[A-Z0-9]+$/.test(value))
                errorMsg = "Chỉ được dùng chữ in hoa hoặc số";
            else {
                const isDuplicate = existingSuppliers.some(
                    (s) =>
                        s.code.toUpperCase() === value.toUpperCase() &&
                        s.code !== initialData?.code
                );
                if (isDuplicate) errorMsg = "Mã nhà giấy đã tồn tại";
            }
        }

        if (field === "name") {
            if (!value.trim()) errorMsg = "Tên nhà giấy không được để trống";
            else if (!/^[A-ZÀ-Ỹ0-9]+(?:\s{0,1}[A-ZÀ-Ỹ0-9]+)*$/.test(value))
                errorMsg = "Sai cú pháp";
            else {
                const isDuplicate = existingSuppliers.some(
                    (s) =>
                        s.name.toUpperCase() === value.toUpperCase() &&
                        s.name !== initialData?.name
                );
                if (isDuplicate) errorMsg = "Tên nhà giấy đã tồn tại";
            }
        }

        setErrors((prev) => ({
            ...prev,
            [field]: errorMsg,
        }));

        return errorMsg === "";
    };

    const handleChange = (field: keyof PaperSupplier, value: string) => {
        setSupplier((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    useEffect(() => {
        if (isOpen) {
            setSupplier(initialData ?? { code: "", name: "" });
            setErrors({});
        }
    }, [isOpen, initialData]);

    const handleSubmit = () => {
        const isCodeValid = validateField("code", supplier.code);
        const isNameValid = validateField("name", supplier.name);

        if (isCodeValid && isNameValid) {
            !!initialData ? onUpdate(supplier) : onAdd(supplier);
            if (!!!initialData) setSupplier({
                code: "",
                name: "",
            });
        }
    };

    const hasError = Object.values(errors).some((msg) => msg);
    const isEmpty = !supplier.code.trim() || !supplier.name.trim();

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="md">
                        <Dialog.Header>
                            <Dialog.Title>
                                {!!!initialData ? "Thêm Nhà Giấy Mới" : "Cập Nhật Nhà Giấy"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex gap={3} direction="column">
                                <Field.Root
                                    invalid
                                    orientation="vertical">
                                    <Field.Label fontSize="lg">Mã nhà giấy</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={supplier.code}
                                        placeholder="Nhập mã"
                                        borderColor="gray"
                                        onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.code && (<Field.ErrorText>{errors.code}</Field.ErrorText>)}
                                    </Box>
                                </Field.Root>

                                <Field.Root
                                    orientation="vertical"
                                    invalid>
                                    <Field.Label fontSize="lg">Tên nhà giấy</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={supplier.name}
                                        placeholder="Nhập tên"
                                        borderColor="gray"
                                        onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.name && (<Field.ErrorText>{errors.name}</Field.ErrorText>)}
                                    </Box>
                                </Field.Root>
                            </Flex>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button onClick={onClose} colorPalette={"red"}>Thoát</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorPalette={!!!initialData ? "green" : "yellow"}
                                onClick={handleSubmit}
                                disabled={hasError || isEmpty}>
                                {!!!initialData ? "Thêm" : "Lưu thay đổi"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default PaperSupplierFormDialog;