import { useState, useEffect } from "react";
import { Box, Button, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react"
import { ProductType } from "@/types/ProductType";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ProductType;
    onAdd: (data: ProductType) => void;
    onUpdate: (data: ProductType) => void;
}

type ErrorMap = Record<string, string>;

const ProductTypeFormDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onAdd, onUpdate }) => {
    const emptyItem = { _id: "", code: "", name: "", description: "", note: "", createdAt: new Date(), updatedAt: new Date() } as ProductType;
    const [item, setItem] = useState<ProductType>(emptyItem);
    const [errors, setErrors] = useState<ErrorMap>({});

    const validateField = (field: keyof ProductType, value: string) => {
        let errorMsg = "";

        switch (field) {
            case "code":
                if (!value.trim()) errorMsg = "Mã không được để trống";
                break;
            case "name":
                if (!value.trim()) errorMsg = "Tên không được để trống";
                break;
        }

        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
        return errorMsg === "";
    };

    const handleChange = (field: keyof ProductType, value: string) => {
        setItem((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    }

    useEffect(() => {
        if (isOpen) {
            setItem(initialData ?? emptyItem);
            setErrors({ code: initialData ? "" : "Mã không được để trống", name: initialData ? "" : "Tên không được để trống" });
        }
    }, [isOpen, initialData]);

    const handleSubmit = () => {
        const isCodeValid = validateField("code", item.code);
        const isNameValid = validateField("name", item.name);

        if (isCodeValid && isNameValid) {
            !!initialData ? onUpdate(item) : onAdd(item);
            if (!initialData) setItem(emptyItem);
        } else return;
        onClose();
    }

    const hasError = Object.values(errors).some((m) => m);
    const isEmpty = !item.code.trim() || !item.name.trim();

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"lg"} scrollBehavior={"inside"}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{!initialData ? "Thêm Loại Sản Phẩm" : "Sửa Loại Sản Phẩm"}</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex gap={3} direction="column">

                                <Field.Root invalid={errors.code !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Mã</Field.Label>
                                    <Input size="lg" fontSize="lg" fontWeight="bold" value={item.code} placeholder="Nhập mã" required onChange={(e) => handleChange("code", e.target.value.toUpperCase())} />
                                    <Box minH="20px" mt="1">{errors.code && <Field.ErrorText>{errors.code}</Field.ErrorText>}</Box>
                                </Field.Root>

                                <Field.Root invalid={errors.name !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Tên</Field.Label>
                                    <Input size="lg" fontSize="lg" fontWeight="bold" value={item.name} placeholder="Nhập tên" required onChange={(e) => handleChange("name", e.target.value)} />
                                    <Box minH="20px" mt="1">{errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}</Box>
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Mô tả</Field.Label>
                                    <Input size="lg" value={item.description} onChange={(e) => handleChange("description", e.target.value)} />
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Ghi chú</Field.Label>
                                    <Input size="lg" value={item.note} onChange={(e) => handleChange("note", e.target.value)} />
                                </Field.Root>

                            </Flex>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button onClick={onClose} colorPalette={"red"}>Thoát</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette={!initialData ? "green" : "yellow"} onClick={handleSubmit} disabled={hasError || isEmpty}>{!initialData ? "Thêm" : "Lưu thay đổi"}</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

export default ProductTypeFormDialog;