"use client";

import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { PASSWORD_REGEX } from "@/constants/password-regex";
import { useChangePasswordMutation } from "@/service/api/userApiSlice";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import { devlog } from "@/utils/devlog";
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
      return "Current password is required";
    }

    return undefined
  }, [interactFlag, password])

  const newPasswordErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (newPassword === password) {
      return "New password must not be the same as old password";
    }

    if (!check.inRange(newPassword.length, 8, 200)) {
      return "New password must be between 8 and 200 characters";
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return "Password must contain least one lowercase, uppercase, digit, and special character"
    }

    return undefined
  }, [interactFlag, newPassword, password])

  const confirmPasswordErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (confirmPassword !== newPassword) {
      return "Confirm password must match new password";
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
            <Field label="Current password" invalid={!!passwordErr} errorText={passwordErr}>
              <PasswordInput
                name="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                onBlur={setFormInteractedWith}
              />
            </Field>
            <Field label="New password" invalid={!!newPasswordErr} errorText={newPasswordErr}>
              <PasswordInput
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                onBlur={setFormInteractedWith}
              />
            </Field>
            <Field label="Confirm password" invalid={!!confirmPasswordErr} errorText={confirmPasswordErr}>
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
        <Button variant="outline" onClick={handleReset}>Reset</Button>
        <Button
          colorPalette={"blue"}
          variant="solid"
          onClick={handleSubmit}
          loading={updating}
          disabled={!!passwordErr || !!newPasswordErr || !!confirmPasswordErr}
        >
          Confirm
        </Button>
      </CardFooter>
    </CardRoot>
  );
}
