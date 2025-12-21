"use client"
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { PASSWORD_REGEX } from "@/constants/password-regex";
import { useUpdateManyUsersMutation } from "@/service/api/userApiSlice";
import { ALL_ACCESS_PRIVILEGE_VALUES, AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { User } from "@/types/User";
import { devlog } from "@/utils/devlog";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { Button, createListCollection, HStack, Input, Portal, Select, Stack } from "@chakra-ui/react";
import check from "check-types";
import { useCallback, useEffect, useMemo, useState } from "react";

const privilegeCol = createListCollection({
  items: ALL_ACCESS_PRIVILEGE_VALUES.map(pv => (
    { label: pv, value: pv }
  ))
})

export type EditUserFormProps = {
  user: User,
}

export function EditUserForm(props: EditUserFormProps) {
  const [interactFlag, setInteractFlag] = useState(false)
  const setFormInteractedWith = () => setInteractFlag(true)
  const [code, setCode] = useState(props.user.code);
  const [accessPrivileges, setAccessPrivileges] = useState(props.user.accessPrivileges);
  const [newPassword, setNewPassword] = useState("");

  const [showAlert, setAlert] = useState<string | null>(null);

  const codeErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (code.length < 1) {
      return "";
    }

    return undefined
  }, [interactFlag, code])

  const newPasswordErr: string | undefined = useMemo(() => {
    if (!interactFlag || check.emptyString(newPassword)) return undefined

    if (!check.inRange(newPassword.length, 8, 200)) {
      return "Password must be between 8 and 200 characters";
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return "Password must contain least one lowercase, uppercase, digit, and special character"
    }

    return undefined
  }, [interactFlag, newPassword])


  const [updateUsers, { isLoading: updating, error: updateError }] =
    useUpdateManyUsersMutation();

  const handleSubmit = async () => {
    if (!interactFlag || !!codeErr || !!newPasswordErr) {
      setAlert(interactFlag ? "Invalid operation" : "Please fill in the empoyee's code and login password")
      setInteractFlag(true)
      return false
    }
    if (updating) {
      return false
    }
    try {
      await updateUsers({
        users: [{
          id: props.user._id,
          code: code !== props.user.code ? code : undefined,
          password: check.nonEmptyString(newPassword) ? newPassword : undefined,
          accessPrivileges,
        }]
      }).unwrap()
      setAlert(null)
      toaster.create({
        description: `Saved user successfully`,
        type: "success",
      });
    } catch (e) {
      const errorMsg = showAlert ? showAlert : tryGetApiErrorMsg(e as Error)

      toaster.create({
        description: check.string(errorMsg) ? errorMsg : `Failed to save user`,
        type: "error",
      });
    }
  };

  const handleReset = useCallback(() => {
    setCode(props.user.code);
    setNewPassword("");
    setAccessPrivileges(props.user.accessPrivileges)
    setInteractFlag(false);
  }, [setCode, setNewPassword, setAccessPrivileges, setInteractFlag, props.user.code, props.user.accessPrivileges])

  useEffect(() => {
    handleReset()
  }, [handleReset])

  return (
    <Stack>
      <Field label="Mã đăng nhập" invalid={!!codeErr} errorText={codeErr} required>
        <Input
          colorPalette={interactFlag ? "yellow" : undefined}
          borderColor={"colorPalette.emphasized"}
          size="sm"
          name="code"
          value={code}
          onChange={(e) => setCode(e.currentTarget.value)}
          onBlur={setFormInteractedWith}
        />
      </Field>

      <Select.Root multiple value={accessPrivileges} onValueChange={(e) => {
        setAccessPrivileges(e.value as AnyAccessPrivileges[])
        setFormInteractedWith()
      }} collection={privilegeCol} size="sm" >
        <Select.HiddenSelect />
        <Select.Label>Các quyền truy cập</Select.Label>
        <Select.Control>
          <Select.Trigger
            colorPalette={interactFlag ? "yellow" : undefined}
            borderColor={"colorPalette.emphasized"}
          >
            <Select.ValueText placeholder="Chọn các quyền" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {privilegeCol.items.map((priv) => (
                <Select.Item item={priv} key={priv.value}>
                  {priv.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      <Field label="Mật khẩu mới" invalid={!!newPasswordErr} errorText={newPasswordErr}>
        <PasswordInput
          {... (interactFlag && newPassword.length > 0 && !newPasswordErr) ? { colorPalette: "yellow", borderColor: "colorPalette.emphasized" } : undefined}
          size="sm"
          name="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          onBlur={setFormInteractedWith}
        />
      </Field>

      {interactFlag && (
        <HStack w="full" justifyContent={"end"}>
          <Button variant="surface" colorPalette={"gray"} onClick={handleReset}>Reset</Button>
          <Button
            colorPalette={"blue"}
            variant="solid"
            onClick={handleSubmit}
            loading={updating}
            disabled={!!codeErr || !!newPasswordErr}
          >
            Confirm
          </Button>
        </HStack>
      )}
    </Stack>
  )
}
