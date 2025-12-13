import { useState, useEffect } from "react";
import { Box, Button, Dialog, Field, Flex, Input, Portal } from "@chakra-ui/react"
import { Customer } from "@/types/Customer";

interface CustomerFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: Customer | undefined;
    onAdd: (data: Customer) => Promise<boolean>;
    onUpdate: (data: Customer) => Promise<boolean>;
}

type ErrorMap = Record<string, string>;

const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
    isOpen,
    onClose,
    initialData,
    onAdd,
    onUpdate,
}) => {
    const [customer, setCustomer] = useState<Customer>({
        code: "",
        name: "",
        contactNumber: undefined,
        address: undefined,
        email: undefined,
        note: undefined,
    });

    const [errors, setErrors] = useState<ErrorMap>({});

    const validateField = (field: keyof Customer, value: string) => {
        let errorMsg = "";

        switch (field) {
            case "code":
                if (!value.trim()) errorMsg = "Mã khách hàng không được để trống";
                else if (!/^[A-Z0-9]{2,20}$/.test(value))
                    errorMsg = "Chỉ được dùng chữ in hoa hoặc số, độ dài từ 2 đến 20 ký tự";
                break;

            case "contactNumber":
                if (value && !/^[0-9\-\+\s]{9,15}$/.test(value))
                    errorMsg = "Số điện thoại phải từ 9 đến 15 chữ số";
                break;

            case "email":
                if (value && !/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value))
                    errorMsg = "Email không hợp lệ";
                break;

            case "name":
                if (!value.trim()) errorMsg = "Tên khách hàng không được để trống";
                // else if (!/^(?!.* {2})[A-ZÀ-Ỹ0-9 ]{2,20}$/.test(value))
                //     errorMsg = "Tên khách hàng phải từ 2 đến 20 ký tự, không được chứa ký tự đặc biệt, mỗi từ cách nhau không quá 1 khoảng trắng";
                if (value && value.length > 100)
                    errorMsg = `${field} không được quá 100 ký tự`;
                break;
            case "address":
                if (value && value.length > 100)
                    errorMsg = `Địa chỉ không được quá 100 ký tự`;
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

    const handleChange = (field: keyof Customer, value: string) => {
        setCustomer((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    useEffect(() => {
        if (isOpen) {

            setCustomer({
                _id: initialData?._id,
                code: initialData?.code ?? "",
                name: initialData?.name ?? "",
                contactNumber: initialData?.contactNumber,
                address: initialData?.address,
                email: initialData?.email,
                note: initialData?.note,
            });

            setErrors({
                code: initialData ? "" : "Mã khách hàng không được để trống",
                name: initialData ? "" : "Tên khách hàng không được để trống",
                contactNumber: "",
                address: "",
                email: "",
                note: "",
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        const isCodeValid = validateField("code", customer.code);
        const isNameValid = validateField("name", customer.name);

        if (isCodeValid && isNameValid) {
            let isSuccess = false;

            if (!!initialData) {
                isSuccess = await onUpdate(customer);
            } else {
                isSuccess = await onAdd(customer);
            }

            if (isSuccess) {
                onClose();
            }
        }
    };

    const hasError = Object.values(errors).some((msg) => msg);
    const isEmpty = !customer.code.trim() || !customer.name.trim();

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size={"lg"} scrollBehavior={"inside"}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                {!!!initialData ? "Thêm Khách Hàng Mới" : "Sửa Thông Tin Khách Hàng"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex gap={3} direction="column">

                                {/* Code */}
                                <Field.Root invalid={errors.code !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Mã Khách Hàng</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={customer.code}
                                        placeholder="Nhập mã"
                                        required
                                        disabled={!!initialData}
                                        onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.code &&
                                            <Field.ErrorText>
                                                {errors.code}
                                            </Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Name */}
                                <Field.Root invalid={errors.name !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Tên Khách Hàng</Field.Label>
                                    <Input
                                        size="lg"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        value={customer.name}
                                        placeholder="Nhập tên"
                                        required
                                        onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.name &&
                                            <Field.ErrorText>
                                                {errors.name}
                                            </Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Phone */}
                                <Field.Root invalid={errors.contactNumber !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Số điện thoại</Field.Label>
                                    <Input
                                        size="lg"
                                        value={customer.contactNumber ?? ""}
                                        placeholder="Nhập số điện thoại"
                                        required
                                        onChange={(e) => handleChange("contactNumber", e.target.value)}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.contactNumber &&
                                            <Field.ErrorText>
                                                {errors.contactNumber}
                                            </Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Address */}
                                <Field.Root invalid={errors.address !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Địa chỉ</Field.Label>
                                    <Input
                                        size="lg"
                                        value={customer.address ?? ""}
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
                                        value={customer.email ?? ""}
                                        placeholder="Nhập email"
                                        onChange={(e) => handleChange("email", e.target.value)}
                                    />
                                    <Box minH="20px" mt="1">
                                        {errors.email && <Field.ErrorText>{errors.email}</Field.ErrorText>}
                                    </Box>
                                </Field.Root>

                                {/* Note */}
                                <Field.Root invalid={errors.note !== ""} orientation="vertical">
                                    <Field.Label fontSize="lg">Ghi chú</Field.Label>
                                    <Input
                                        size="lg"
                                        value={customer.note ?? ""}
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

export default CustomerFormDialog;