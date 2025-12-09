import { useState, useEffect } from "react";
import { Box, Button, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react"
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData: WareManufacturingProcessType | undefined;
    onAdd: (data: WareManufacturingProcessType) => Promise<boolean>;
    onUpdate: (data: WareManufacturingProcessType) => Promise<boolean>;
}

type ErrorMap = Record<string, string>;

const WareManufacturingProcessTypeFormDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onAdd, onUpdate }) => {
    const [item, setItem] = useState<WareManufacturingProcessType>({
        code: "",
        name: "",
        description: "",
        note: ""
    });
    const [errors, setErrors] = useState<ErrorMap>({});

    const validateField = (field: keyof WareManufacturingProcessType, value: string) => {
        let errorMsg = "";

        switch (field) {
            case "code":
                if (!value.trim()) errorMsg = "Mã loại gia công mã hàng không được để trống";
                else if (!/^[A-Z]{2,20}$/.test(value))
                    errorMsg = "Mã loại gia công mã hàng chỉ được dùng chữ in hoa, độ dài từ 2 đến 20 ký tự";
                break;
            case "name":
                if (!value.trim()) errorMsg = "Tên loại gia công mã hàng không được để trống";
                else if (!/^(?!.* {2})[A-Za-zÀ-Ỹà-ỹ ]{2,20}$/.test(value))
                    errorMsg = "Tên loại gia công mã hàng chỉ được dùng chữ cái, cách nhau tối đa 1 khoảng trắng, độ dài từ 2 đến 20 ký tự";
                break;
        }

        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
        return errorMsg === "";
    };

    const handleChange = (field: keyof WareManufacturingProcessType, value: string) => {
        setItem((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    }

    useEffect(() => {
        if (isOpen) {
            setItem({
                _id: initialData?._id,
                code: initialData?.code ?? "",
                name: initialData?.name ?? "",
                description: initialData?.description ?? "",
                note: initialData?.note ?? "",
            });
            setErrors({
                code: initialData ? "" : "Mã loại gia công mã hàng không được để trống",
                name: initialData ? "" : "Tên loại gia công mã hàng không được để trống"
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        const isCodeValid = validateField("code", item.code);
        const isNameValid = validateField("name", item.name);

        if (isCodeValid && isNameValid) {
            let isSuccess = false;

            if (!!initialData) {
                isSuccess = await onUpdate(item);
            } else {
                isSuccess = await onAdd(item);
            }

            if (isSuccess) {
                onClose();
            }
        }
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
                            <Dialog.Title>
                                {!initialData ? "Thêm Loại Gia Công" : "Sửa Loại Gia Công"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex gap={3} direction="column">

                                <Field.Root invalid={errors.code !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Mã</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={item.code}
                                        placeholder="Nhập mã loại gia công"
                                        required
                                        disabled={!!initialData}
                                        onChange={(e) => handleChange("code", e.target.value.toUpperCase())} />
                                    <Box minH="20px" mt="1">
                                        {errors.code &&
                                            <Field.ErrorText>
                                                {errors.code}
                                            </Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                <Field.Root invalid={errors.name !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Tên</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={item.name}
                                        placeholder="Nhập tên loại gia công"
                                        required
                                        onChange={(e) => handleChange("name", e.target.value)} />
                                    <Box minH="20px" mt="1">
                                        {errors.name &&
                                            <Field.ErrorText>
                                                {errors.name}
                                            </Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Mô tả</Field.Label>
                                    <Input
                                        size="lg"
                                        value={item.description}
                                        onChange={(e) => handleChange("description", e.target.value)} />
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Ghi chú</Field.Label>
                                    <Input
                                        size="lg"
                                        value={item.note}
                                        onChange={(e) => handleChange("note", e.target.value)} />
                                </Field.Root>

                            </Flex>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button onClick={onClose} colorPalette={"red"}>Thoát</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorPalette={!initialData ? "green" : "yellow"}
                                onClick={handleSubmit}
                                disabled={hasError || isEmpty}>
                                {!initialData ? "Thêm" : "Lưu thay đổi"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

export default WareManufacturingProcessTypeFormDialog;