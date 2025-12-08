import { useState, useEffect } from "react";
import { Box, Button, createListCollection, Dialog, Field, Flex, Input, Portal, Select } from "@chakra-ui/react"
import { FluteCombination } from "@/types/FluteCombination";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FluteCombination;
    onAdd: (data: FluteCombination) => void;
    onUpdate: (data: FluteCombination) => void;
}

type ErrorMap = Record<string, string>;

const FluteCombinationFormDialog: React.FC<Props> = ({ isOpen, onClose, initialData, onAdd, onUpdate }) => {
    const [item, setItem] = useState<FluteCombination>({
        code: "",
        flutes: [],
        description: "",
        note: ""
    });
    const [errors, setErrors] = useState<ErrorMap>({});

    const fluteCollection = createListCollection({
        items: [
            { label: "Sóng E", value: "EFlute" },
            { label: "Lớp giữa EB", value: "EBLiner" },
            { label: "Sóng B", value: "BFlute" },
            { label: "Lớp giữa BAC", value: "BACLiner" },
            { label: "Sóng AC", value: "ACFlute" },
            { label: "Lớp mặt", value: "faceLayer" },
            { label: "Lớp đáy", value: "backLayer" },
        ],
    })

    const validateField = (field: keyof FluteCombination, value: string) => {
        let errorMsg = "";

        switch (field) {
            case "code":
                if (!value.trim()) errorMsg = "Mã không được để trống";
                if (!value.trim().match("^[A-Z0-9-]{1,10}$")) errorMsg = "Mã tổ hợp sóng chỉ cho phép chứa từ 1 đến 10 chữ cái in hoa và số"
                break;
        }

        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
        return errorMsg === "";
    };

    const handleChange = (field: keyof FluteCombination, value: string) => {
        setItem((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    }

    const handleFlutesChange = (values: string[]) => {
        setItem((prev) => ({ ...prev, flutes: values }))
    }

    useEffect(() => {
        if (isOpen) {
            setItem({
                _id: initialData?._id,
                code: initialData?.code ?? '',
                flutes: initialData?.flutes ?? [],
                description: initialData?.description ?? '',
                note: initialData?.note ?? '',
            });
            setErrors({ code: initialData ? "" : "Mã không được để trống" });
        }
    }, [isOpen, initialData]);

    const handleSubmit = () => {
        const isCodeValid = validateField("code", item.code);

        if (isCodeValid) {
            !!initialData ? onUpdate(item) : onAdd(item);
        } else return;
        onClose();
    }

    const hasError = Object.values(errors).some((m) => m) || !item.code.trim() || item.flutes.length < 1;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"lg"} scrollBehavior={"inside"}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                {!initialData ? "Thêm Loại Sóng" : "Sửa Loại Sóng"}
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

                                <Field.Root invalid={item.flutes.length < 1}>
                                    <Field.Label fontSize="lg">Tổ hợp sóng</Field.Label>
                                    <Select.Root
                                        multiple
                                        collection={fluteCollection}
                                        size="lg"
                                        disabled={!!initialData}
                                        value={item.flutes}
                                        onValueChange={(e) => handleFlutesChange(e.value)}>
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger>
                                                <Select.ValueText placeholder="Chọn lớp sóng và lớp giấy" />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Select.Positioner>
                                            <Select.Content>
                                                {fluteCollection.items.map((framework) => (
                                                    <Select.Item item={framework} key={framework.value}>
                                                        {framework.label}
                                                        <Select.ItemIndicator />
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                        </Select.Positioner>
                                    </Select.Root>
                                    <Box minH="20px" mt="1">
                                        {item.flutes.length < 1 &&
                                            <Field.ErrorText>
                                                Chọn ít nhất 1 lớp giấy hoặc lớp sóng
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
                            <Button colorPalette={!initialData ? "green" : "yellow"}
                                onClick={handleSubmit}
                                disabled={hasError}>
                                {!initialData ? "Thêm" : "Lưu thay đổi"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

export default FluteCombinationFormDialog;