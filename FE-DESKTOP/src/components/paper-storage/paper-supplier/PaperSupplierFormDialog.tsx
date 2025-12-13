import { useState, useEffect } from "react";
import { Box, Button, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react"
import { PaperSupplier } from "@/types/PaperSupplier";

interface PaperSupplierFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: PaperSupplier | undefined;
    onAdd: (data: PaperSupplier) => Promise<boolean>;
    onUpdate: (data: PaperSupplier) => Promise<boolean>;
}

type ErrorMap = Record<string, string>;

const PaperSupplierFormDialog: React.FC<PaperSupplierFormDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    onAdd,
    onUpdate,
}) => {
    const [supplier, setSupplier] = useState<PaperSupplier>({
        code: "",
        name: "",
        phone: undefined,
        address: undefined,
        email: undefined,
        bank: undefined,
        bankAccount: undefined,
        note: undefined,
    });

    const [errors, setErrors] = useState<ErrorMap>({});

    const validateField = (field: keyof PaperSupplier, value: string) => {
        let errorMsg = "";

        switch (field) {
            case "code":
                if (!value.trim()) errorMsg = "Mã nhà giấy không được để trống";
                else if (!/^[A-Z0-9]{2,3}$/.test(value))
                    errorMsg = "Chỉ được dùng chữ in hoa hoặc số, độ dài từ 2 đến 3 ký tự";
                break;

            case "name":
                if (!value.trim()) errorMsg = "Tên nhà giấy không được để trống";
                else if (!/^(?!.* {2})[A-ZÀ-Ỹ0-9 ]{2,20}$/.test(value))
                    errorMsg = "Tên nhà giấy phải từ 2 đến 20 ký tự, không được chứa ký tự đặc biệt, mỗi từ cách nhau không quá 1 khoảng trắng";
                break;

            case "phone":
                if (value && !/^[0-9\-\+\s]{9,15}$/.test(value))
                    errorMsg = "Số điện thoại phải từ 9 đến 15 chữ số";
                break;

            case "email":
                if (value && !/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value))
                    errorMsg = "Email không hợp lệ";
                break;

            case "bankAccount":
                if (value && !/^[0-9]{6,20}$/.test(value))
                    errorMsg = "Số tài khoản phải từ 6 đến 20 chữ số";
                break;

            case "address":
                if (value && value.length > 100)
                    errorMsg = `Địa chỉ không được quá 100 ký tự`;
                break;
            case "bank":
                if (value && value.length > 100)
                    errorMsg = `Ngân hàng không được quá 100 ký tự`;
                break;
            case "note":
                if (value && value.length > 100)
                    errorMsg = `Ghi chú không được quá 100 ký tự`;
                break;
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

            setSupplier({
                _id: initialData?._id,
                code: initialData?.code ?? "",
                name: initialData?.name ?? "",
                phone: initialData?.phone,
                address: initialData?.address,
                email: initialData?.email,
                bank: initialData?.bank,
                bankAccount: initialData?.bankAccount,
                note: initialData?.note,
            });

            setErrors({
                code: initialData ? "" : "Mã nhà giấy không được để trống",
                name: initialData ? "" : "Tên nhà giấy không được để trống",
                phone: "",
                address: "",
                email: "",
                bank: "",
                bankAccount: "",
                note: "",
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        const isCodeValid = validateField("code", supplier.code);
        const isNameValid = validateField("name", supplier.name);

        if (isCodeValid && isNameValid) {
            let isSuccess = false;

            if (!!initialData) {
                isSuccess = await onUpdate(supplier);
            } else {
                isSuccess = await onAdd(supplier);
            }

            if (isSuccess) {
                onClose();
            }
        }
    };

    const hasError = Object.values(errors).some((msg) => msg);
    const isEmpty = !supplier.code.trim() || !supplier.name.trim();

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"lg"} scrollBehavior={"inside"}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                {!!!initialData ? "Thêm Nhà Giấy Mới" : "Sửa Thông Tin Nhà Giấy"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex gap={3} direction="column">

                                {/* Code */}
                                <Field.Root invalid={errors.code !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Mã nhà giấy</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={supplier.code}
                                        placeholder="Nhập mã"
                                        required
                                        disabled={!!initialData}
                                        onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.code && <Field.ErrorText>{errors.code}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Name */}
                                <Field.Root invalid={errors.name !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Tên nhà giấy</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={supplier.name}
                                        placeholder="Nhập tên"
                                        required
                                        onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Phone */}
                                <Field.Root invalid={errors.phone !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Số điện thoại</Field.Label>
                                    <Input
                                        size="lg"
                                        value={supplier.phone}
                                        placeholder="Nhập số điện thoại"
                                        required
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.phone && <Field.ErrorText>{errors.phone}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Address */}
                                <Field.Root invalid={errors.address !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Địa chỉ</Field.Label>
                                    <Input
                                        size="lg"
                                        value={supplier.address}
                                        placeholder="Nhập địa chỉ"
                                        onChange={(e) => handleChange("address", e.target.value)}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.address && <Field.ErrorText>{errors.address}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Email */}
                                <Field.Root invalid={errors.email !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Email</Field.Label>
                                    <Input
                                        size="lg"
                                        type="email"
                                        value={supplier.email}
                                        placeholder="Nhập email"
                                        onChange={(e) => handleChange("email", e.target.value)}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.email && <Field.ErrorText>{errors.email}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Bank */}
                                <Field.Root invalid={errors.bank !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Ngân hàng</Field.Label>
                                    <Input
                                        size="lg"
                                        value={supplier.bank}
                                        placeholder="Nhập ngân hàng"
                                        onChange={(e) => handleChange("bank", e.target.value)}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.bank && <Field.ErrorText>{errors.bank}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Bank Account */}
                                <Field.Root invalid={errors.bankAccount !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Số tài khoản</Field.Label>
                                    <Input
                                        size="lg"
                                        value={supplier.bankAccount}
                                        placeholder="Nhập số tài khoản"
                                        onChange={(e) => handleChange("bankAccount", e.target.value)}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.bankAccount && <Field.ErrorText>{errors.bankAccount}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Note */}
                                <Field.Root invalid={errors.note !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Ghi chú</Field.Label>
                                    <Input
                                        size="lg"
                                        value={supplier.note}
                                        placeholder="Nhập ghi chú"
                                        onChange={(e) => handleChange("note", e.target.value)}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.note && <Field.ErrorText>{errors.note}</Field.ErrorText>}
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

export default PaperSupplierFormDialog;