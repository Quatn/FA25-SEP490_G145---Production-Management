import { useState, useEffect } from "react";
import { Box, Button, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react"
import { PaperColor } from "@/types/PaperColor";

interface PaperColorFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: PaperColor | undefined;
    onAdd: (data: PaperColor) => Promise<boolean>;
    onUpdate: (data: PaperColor) => Promise<boolean>;
}

type ErrorMap = Record<string, string>;

const PaperColorFormDialog: React.FC<PaperColorFormDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    onAdd,
    onUpdate,
}) => {
    const [color, setColor] = useState<PaperColor>({
        code: "",
        title: "",
    });

    const [errors, setErrors] = useState<ErrorMap>({});

    const validateField = (field: keyof PaperColor, value: string) => {
        let errorMsg = "";

        switch (field) {
            case "code":
                if (!value.trim()) errorMsg = "Mã màu giấy không được để trống";
                else if (!/^[A-Z0-9]{1,3}$/.test(value))
                    errorMsg = "Mã màu giấy chỉ được dùng chữ in hoa hoặc số, độ dài từ 1 đến 3 ký tự";
                break;

            case "title":
                if (!value.trim()) errorMsg = "Tiêu đề màu giấy không được để trống";
                else if (!/^(?!.* {2})[A-ZÀ-Ỹ0-9 ]{2,10}$/.test(value))
                    errorMsg = "Tiêu đề màu giấy chỉ được dùng chữ in hoa hoặc số cách nhau tối đa 1 khoảng trắng, độ dài từ 2 đến 10 ký tự";
                break;
        }

        setErrors((prev) => ({
            ...prev,
            [field]: errorMsg,
        }));

        return errorMsg === "";
    };

    const handleChange = (field: keyof PaperColor, value: string) => {
        setColor((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    useEffect(() => {
        if (isOpen) {
            setColor({
                _id: initialData?._id,
                code: initialData?.code ?? "",
                title: initialData?.title ?? "",
            })

            setErrors({
                code: initialData ? "" : "Mã màu giấy không được để trống",
                title: initialData ? "" : "Tiêu đề màu giấy không được để trống",
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        const isCodeValid = validateField("code", color.code);
        const isNameValid = validateField("title", color.title);

        if (isCodeValid && isNameValid) {
            let isSuccess = false;

            if (!!initialData) {
                isSuccess = await onUpdate(color);
            } else {
                isSuccess = await onAdd(color);
            }

            if (isSuccess) {
                onClose();
            }
        }
    };

    const hasError = Object.values(errors).some((msg) => msg);
    const isEmpty = !color.code.trim() || !color.title.trim();

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"lg"} scrollBehavior={"inside"}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                {!initialData ? "Thêm Màu Giấy Mới" : "Sửa Thông Tin Màu Giấy"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex gap={3} direction="column">

                                {/* Code */}
                                <Field.Root invalid={errors.code !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Mã màu giấy</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={color.code}
                                        placeholder="Nhập mã"
                                        required
                                        disabled={!!initialData}
                                        onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.code && <Field.ErrorText>{errors.code}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Title */}
                                <Field.Root invalid={errors.title !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Tiêu đề màu giấy</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={color.title}
                                        placeholder="Nhập tiêu đề"
                                        required
                                        onChange={(e) => handleChange("title", e.target.value.toUpperCase())}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.title && <Field.ErrorText>{errors.title}</Field.ErrorText>}
                                    </Box>
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
};

export default PaperColorFormDialog;