"use client"

import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { PASSWORD_REGEX } from "@/constants/password-regex";
import { useCreateUsersMutation } from "@/service/api/userApiSlice";
import { Employee } from "@/types/Employee";
import { devlog } from "@/utils/devlog";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { Button, HStack, Input, Stack } from "@chakra-ui/react";
import check from "check-types";
import { useMemo, useState } from "react";

export type AddUserFormProps = {
  employee: Employee,
}

export function AddUserForm(props: AddUserFormProps) {
  const [interactFlag, setInteractFlag] = useState(false)
  const setFormInteractedWith = () => setInteractFlag(true)
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const [showAlert, setAlert] = useState<string | null>(null);

  const codeErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (code.length < 1) {
      return "Mã đăng nhập là bắt buộc";
    }

    return undefined
  }, [interactFlag, code])

  const newPasswordErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (!check.inRange(password.length, 8, 200)) {
      return "Mật khẩu phải dài từ 8 đến 200 kí tự";
    }

    if (!PASSWORD_REGEX.test(password)) {
      return "Mật khẩu phải bao gồm một chữ cái viết hoa, viết thường, một chữ số vào một kí tự đặc biệt"
    }

    return undefined
  }, [interactFlag, password])


  const [createUser, { isLoading: creating, error: createError }] =
    useCreateUsersMutation();

  const handleSubmit = async () => {
    if (!interactFlag || !!codeErr || !!newPasswordErr) {
      setAlert(interactFlag ? "Dữ liệu không hợp lệ" : "Hãy điền mã đăng nhập và mật khẩu cho tài khoản")
      setInteractFlag(true)
      return false
    }
    if (creating) {
      return false
    }
    try {
      await createUser({
        code,
        password,
        employee: props.employee._id,
        accessPrivileges: [],
      }).unwrap()
      setAlert(null)
      toaster.create({
        description: `Added user to employee ${props.employee.name} successfully`,
        type: "success",
      });
    } catch (e) {
      const errorMsg = showAlert ? showAlert : tryGetApiErrorMsg(e as Error)

      toaster.create({
        description: check.string(errorMsg) ? errorMsg : `Failed to add user to emploee ${props.employee.name}`,
        type: "error",
      });
    }
  };

  const handleReset = () => {
    setCode("");
    setPassword("");
    setInteractFlag(false);
  }

  return (
    <Stack>
      <form >
        <Stack gap="4" w="full">
          <Field label="Mã đăng nhập" invalid={!!codeErr} errorText={codeErr} required>
            <Input
              size="sm"
              name="code"
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              onBlur={setFormInteractedWith}
            />
          </Field>
          <Field label="Mật khẩu" invalid={!!newPasswordErr} errorText={newPasswordErr} required>
            <PasswordInput
              size="sm"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              onBlur={setFormInteractedWith}
            />
          </Field>
        </Stack>
      </form >
      <HStack w="full" justifyContent={"end"}>
        <Button variant="outline" onClick={handleReset}>Hủy</Button>
        <Button
          colorPalette={"blue"}
          variant="solid"
          onClick={handleSubmit}
          loading={creating}
          disabled={!!codeErr || !!newPasswordErr}
        >
          Xác nhận
        </Button>
      </HStack>
    </Stack>
  )
}
