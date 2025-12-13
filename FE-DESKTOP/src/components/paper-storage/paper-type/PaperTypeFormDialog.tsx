"use client"

import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    Field,
    Flex,
    Input,
    NumberInput,
    Portal,
} from "@chakra-ui/react";
import {
    Combobox,
    useFilter,
    useListCollection,
} from "@chakra-ui/react";
import { PaperType } from "@/types/PaperType";
import { PaperColor, PaperColorResponse } from "@/types/PaperColor";

interface PaperTypeFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: PaperType | undefined;
    colorsData: PaperColorResponse[];
    onAdd: (data: PaperType) => Promise<boolean>;
    onUpdate: (data: PaperType) => Promise<boolean>;
}

type ErrorMap = Record<string, string>;

const PaperTypeFormDialog: React.FC<PaperTypeFormDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    colorsData,
    onAdd,
    onUpdate,
}) => {
    const [type, setType] = useState<PaperType>({
        paperColor: {
            _id: '',
            code: '',
            title: '',
        },
        width: 0,
        grammage: 0,
    });
    const [errors, setErrors] = useState<ErrorMap>({});

    const paperColors: PaperColorResponse[] = colorsData ?? [];

    const { contains } = useFilter({ sensitivity: "base" });
    const initialItems = paperColors.map((c) => ({
        label: `${c.code} - ${c.title}`,
        value: c._id,
    }));
    const { collection, filter } = useListCollection({
        initialItems,
        filter: contains,
    });

    useEffect(() => {
        if (isOpen) {
            setType({
                _id: initialData?._id,
                paperColor: initialData?.paperColor ?? { _id: '', code: '', title: '' },
                width: initialData?.width ?? 0,
                grammage: initialData?.grammage ?? 0,
            });

            setErrors({
                paperColor: initialData ? "" : "Màu giấy không được để trống",
                width: initialData ? "" : "Khổ giấy không được để trống",
                grammage: initialData ? "" : "Định lượng không được để trống",
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof PaperType, value: any) => {
        if (field === 'paperColor') {
            const input: PaperColor = {
                _id: value._id,
                code: value.code,
                title: value.title,
            }
            setType((prev) => ({ ...prev, paperColor: input }));
        } else setType((prev) => ({ ...prev, [field]: value }));

        let errorMsg = "";
        if (field === "paperColor" && !value) errorMsg = "Màu giấy không được để trống";
        if (field === "width") {
            if (!value || value <= 0)
                errorMsg = "Khổ giấy không được để trống";
            if (value && value > 2000) {
                errorMsg = "Khổ giấy không được vượt quá 2000cm";
            }
        }
        if (field === "grammage") {
            if (!value || value <= 0) {
                errorMsg = "Định lượng không được để trống";
            }
            if (value && value > 2000) {
                errorMsg = "Định lượng không được vượt quá 2000cm";
            }
        }

        setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

    const handleSubmit = async () => {
        let isSuccess = false;

        if (!!initialData) {
            isSuccess = await onUpdate(type);
        } else {
            isSuccess = await onAdd(type);
        }

        if (isSuccess) {
            onClose();
        }

        filter('');
    };

    const initInputPaperColor = (id: string) => {
        const searchCollection = initialItems;
        return searchCollection.find((item) => item.value === id)?.label;
    }

    const hasError = Object.values(errors).some((msg) => msg);
    const isEmpty = !type.paperColor || !type.width || !type.grammage;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size="lg">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                {!!!initialData ? "Thêm Loại Giấy Mới" : "Sửa Thông Tin Loại Giấy"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex gap={3} direction="column">
                                <Field.Root invalid={errors.paperColor !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Màu giấy</Field.Label>
                                    <Combobox.Root
                                        collection={collection}
                                        defaultInputValue={initInputPaperColor((type.paperColor as PaperColor)._id ?? "")}
                                        onInputValueChange={(e) => filter(e.inputValue)}
                                        onValueChange={(details) => {
                                            const selectedValue = details.value[0] as string;
                                            const selectedItem = paperColors.find((c) => c._id === selectedValue);
                                            handleChange("paperColor", selectedItem);
                                        }}>
                                        <Combobox.Control>
                                            <Combobox.Input placeholder="Chọn hoặc tìm màu giấy" />
                                            <Combobox.IndicatorGroup>
                                                <Combobox.ClearTrigger />
                                                <Combobox.Trigger />
                                            </Combobox.IndicatorGroup>
                                        </Combobox.Control>
                                        <Combobox.Positioner>
                                            <Combobox.Content>
                                                <Combobox.Empty>
                                                    Không có màu giấy phù hợp
                                                </Combobox.Empty>
                                                {collection.items.map((item, index) => (
                                                    <Combobox.Item key={index} item={item}>
                                                        {item.label}
                                                        <Combobox.ItemIndicator />
                                                    </Combobox.Item>
                                                ))}
                                            </Combobox.Content>
                                        </Combobox.Positioner>
                                    </Combobox.Root>
                                    <Box minH="20px" mt="1">
                                        {errors.paperColor && <Field.ErrorText>{errors.paperColor}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                <Field.Root invalid={errors.width !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Khổ giấy</Field.Label>
                                    <NumberInput.Root
                                        size="lg"
                                        width="200px"
                                        min={0}
                                        value={String(type.width ?? 0)}
                                        onValueChange={(details) => {
                                            let value = details.valueAsNumber;

                                            if (value == null || isNaN(value) || value < 0) {
                                                value = 0;
                                            }

                                            handleChange("width", value);
                                        }}
                                    >
                                        <NumberInput.Input
                                            onKeyDown={(e) => {
                                                if (e.key === "-" || e.key === "e") {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                const text = e.clipboardData.getData("text");
                                                if (text.includes("-")) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />

                                        <NumberInput.Control />
                                    </NumberInput.Root>
                                    <Box minH="20px" mt="1">
                                        {errors.width && <Field.ErrorText>{errors.width}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                <Field.Root invalid={errors.grammage !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Định lượng</Field.Label>
                                    <NumberInput.Root
                                        size="lg"
                                        width="200px"
                                        min={0}
                                        value={String(type.grammage ?? 0)}
                                        onValueChange={(details) => {
                                            let value = details.valueAsNumber;

                                            if (value == null || isNaN(value) || value < 0) {
                                                value = 0;
                                            }

                                            handleChange("grammage", value);
                                        }}
                                    >
                                        <NumberInput.Input
                                            onKeyDown={(e) => {
                                                if (e.key === "-" || e.key === "e") {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                const text = e.clipboardData.getData("text");
                                                if (text.includes("-")) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />

                                        <NumberInput.Control />
                                    </NumberInput.Root>
                                    <Box minH="20px" mt="1">
                                        {errors.grammage && <Field.ErrorText>{errors.grammage}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>
                            </Flex>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button onClick={onClose} colorPalette="red">
                                    Thoát
                                </Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorPalette={!!!initialData ? "green" : "yellow"}
                                onClick={handleSubmit}
                                disabled={hasError || isEmpty}
                            >
                                {!!!initialData ? "Thêm" : "Lưu thay đổi"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default PaperTypeFormDialog;
