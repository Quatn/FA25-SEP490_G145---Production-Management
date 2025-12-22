"use client";

import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { PASSWORD_REGEX } from "@/constants/password-regex";
import { useChangePasswordMutation } from "@/service/api/userApiSlice";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import {
  Alert,
  Button,
  CardBody,
  CardFooter,
  CardRoot,
  Stack,
} from "@chakra-ui/react";
import check from "check-types";
import { useMemo, useState } from "react";

export default function ChangePasswordBox() {
  const [interactFlag, setInteractFlag] = useState(false)
  const setFormInteractedWith = () => setInteractFlag(true)
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const userState: UserState | null = useAppSelector((state) =>
    state.auth.userState
  );

  const [showAlert, setAlert] = useState<string | null>(null);

  const passwordErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (password.length < 1) {
      return "Mật khẩu hiện tại là bắt buộc";
    }

    return undefined
  }, [interactFlag, password])

  const newPasswordErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (newPassword === password) {
      return "Mất khẩu mới không trùng với mật khẩu cũ";
    }

    if (!check.inRange(newPassword.length, 8, 200)) {
      return "Mật khẩu mới phải dài từ 8 đến 200 ký tự";
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return "Mật khẩu phải bao gồm một chữ cái viết hoa, viết thường, một chữ số vào một kí tự đặc biệt"
    }

    return undefined
  }, [interactFlag, newPassword, password])

  const confirmPasswordErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (confirmPassword !== newPassword) {
      return "Mật khẩu nhập lại phải trùng với mật khẩu mới";
    }

    return undefined
  }, [interactFlag, newPassword, confirmPassword])

  const [changePassword, { isLoading: updating, error: updateError }] =
    useChangePasswordMutation();

  const handleSubmit = async () => {
    if (check.null(userState) || !interactFlag || !!passwordErr || !!newPasswordErr || !!confirmPasswordErr) {
      setAlert(interactFlag ? "Invalid operation" : "Please fill the form to change password")
      setInteractFlag(true)
      return false
    }
    if (updating) {
      return false
    }
    try {
      await changePassword({
        id: userState.id,
        currentPassword: password,
        newPassword: newPassword,
      }).unwrap()
      setAlert(null)
      toaster.create({
        description: `Changed password successfully`,
        type: "success",
      });
    } catch { }
  };

  const handleReset = () => {
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setInteractFlag(false);
    setAlert(null)
  }

  return (
    <CardRoot w="lg">
      <CardBody>
        <form>
          <Stack gap="4" w="full">
            <Field label="Mật khẩu hiện tại" invalid={!!passwordErr} errorText={passwordErr}>
              <PasswordInput
                name="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                onBlur={setFormInteractedWith}
              />
            </Field>
            <Field label="Mật khẩu mới" invalid={!!newPasswordErr} errorText={newPasswordErr}>
              <PasswordInput
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                onBlur={setFormInteractedWith}
              />
            </Field>
            <Field label="Nhập lại mật khẩu" invalid={!!confirmPasswordErr} errorText={confirmPasswordErr}>
              <PasswordInput
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                onBlur={setFormInteractedWith}
              />
            </Field>
            {(check.string(showAlert) || !!updateError) && (
              <Alert.Root status={"error"}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Change password failed</Alert.Title>
                  <Alert.Description>
                    {showAlert ? showAlert : tryGetApiErrorMsg(updateError)}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
          </Stack>
        </form>
      </CardBody>
      <CardFooter justifyContent="flex-end">
        <Button variant="outline" onClick={handleReset}>Hủy</Button>
        <Button
          colorPalette={"blue"}
          variant="solid"
          onClick={handleSubmit}
          loading={updating}
          disabled={!!passwordErr || !!newPasswordErr || !!confirmPasswordErr}
        >
          Xác nhận
        </Button>
      </CardFooter>
    </CardRoot>
  );
}
