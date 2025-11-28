"use client"

import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { PASSWORD_REGEX } from "@/constants/password-regex";
import { useCreateUsersMutation } from "@/service/api/userApiSlice";
import { Employee } from "@/types/Employee";
import { devlog } from "@/utils/devlog";
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
      return "code is required";
    }

    return undefined
  }, [interactFlag, code])

  const newPasswordErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (!check.inRange(password.length, 8, 200)) {
      return "Password must be between 8 and 200 characters";
    }

    if (!PASSWORD_REGEX.test(password)) {
      return "Password must contain least one lowercase, uppercase, digit, and special character"
    }

    return undefined
  }, [interactFlag, password])


  const [createUser, { isLoading: creating, error: createError }] =
    useCreateUsersMutation();

  const handleSubmit = async () => {
    if (!interactFlag || !!codeErr || !!newPasswordErr) {
      setAlert(interactFlag ? "Invalid operation" : "Please fill in the empoyee's code and login password")
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
      devlog(e)
      const errorMsg = showAlert ? showAlert : ((e as { data: { message: string } }).data.message)

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
          <Field label="Current password" invalid={!!codeErr} errorText={codeErr}>
            <Input
              size="sm"
              name="code"
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              onBlur={setFormInteractedWith}
            />
          </Field>
          <Field label="New password" invalid={!!newPasswordErr} errorText={newPasswordErr}>
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
        <Button variant="outline" onClick={handleReset}>Reset</Button>
        <Button
          colorPalette={"blue"}
          variant="solid"
          onClick={handleSubmit}
          loading={creating}
          disabled={!!codeErr || !!newPasswordErr}
        >
          Confirm
        </Button>
      </HStack>
    </Stack>
  )
}
