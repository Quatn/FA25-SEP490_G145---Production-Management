import { useState, useEffect } from "react";
import { Box, Button, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react";
import { PrintColor } from "@/types/PrintColor";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData: PrintColor | undefined;
    onAdd: (data: PrintColor) => Promise<boolean>;
    onUpdate: (data: PrintColor) => Promise<boolean>;
}

type ErrorMap = Record<string, string>;

const PrintColorFormDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onAdd, onUpdate }) => {
    const [item, setItem] = useState<PrintColor>({ code: "", description: "", note: "" });
    const [errors, setErrors] = useState<ErrorMap>({});

    const validateField = (field: keyof PrintColor, value: string) => {
        let errorMsg = "";
        switch (field) {
            case "code":
                if (!value.trim()) errorMsg = "Mã màu in không được để trống";
                else if (!/^[A-Z0-9]{2,10}$/.test(value)) errorMsg = "Mã màu in chỉ dùng chữ in hoa hoặc số, 2-10 ký tự";
                break;
        }

        setErrors((p) => ({ ...p, [field]: errorMsg }));
        return errorMsg === "";
    };

    const handleChange = (field: keyof PrintColor, value: string) => {
        setItem((p) => ({ ...p, [field]: value }));
        validateField(field, value);
    };

    useEffect(() => {
        if (isOpen) {
            setItem({ _id: initialData?._id, code: initialData?.code ?? "", description: initialData?.description ?? "", note: initialData?.note ?? "" });
            setErrors({ code: initialData ? "" : "Mã màu in không được để trống" });
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        const isCodeValid = validateField("code", item.code);
        if (!isCodeValid) return;

        let success = false;
        if (initialData) success = await onUpdate(item);
        else success = await onAdd(item);

        if (success) onClose();
    };

    const hasError = Object.values(errors).some((m) => m);
    const isEmpty = !item.code.trim();

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"lg"} scrollBehavior={"inside"}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{initialData ? "Sửa Màu In" : "Thêm Màu In"}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Flex gap={3} direction="column">
                                <Field.Root invalid={!!errors.code} orientation="vertical">
                                    <Field.Label fontSize="lg">Mã Màu In</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={item.code}
                                        placeholder="Nhập mã"
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

                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Mô tả</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        value={item.description}
                                        placeholder="Mô tả"
                                        onChange={(e) => handleChange("description", e.target.value)} />
                                </Field.Root>

                                <Field.Root orientation="vertical">
                                    <Field.Label fontSize="lg">Ghi chú</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        value={item.note}
                                        placeholder="Ghi chú"
                                        onChange={(e) => handleChange("note", e.target.value)} />
                                </Field.Root>
                            </Flex>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button
                                    onClick={onClose}
                                    colorPalette={"red"}>
                                    Thoát
                                </Button>
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
};

export default PrintColorFormDialog;
