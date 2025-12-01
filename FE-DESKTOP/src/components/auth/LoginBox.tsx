"use client";

import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { useLoginMutation } from "@/service/api/authApiSlice";
import { setCredentials } from "@/service/features/authSlice";
import { useAppDispatch } from "@/service/hooks";
import { devlog } from "@/utils/devlog";
import {
  Alert,
  Button,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardRoot,
  CardTitle,
  Input,
  Link as ChakraLink,
  Stack,
} from "@chakra-ui/react";
import check from "check-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginBox() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [login, { isLoading: isLoggingIn, error: logInError }] =
    useLoginMutation();

  const handleSubmit = async () => {
    try {
      const response = await login({ code, password }).unwrap();
      const userData = response.data?.userState;
      if (!check.nonEmptyObject(userData)) {
        throw "Invalid login response";
      }
      dispatch(setCredentials(userData));
      toaster.create({
        description: `Logged in successfully as ${userData?.name}`,
        type: "success",
      });
      router.push("/");
    } catch (e) {
      devlog(e);
    }
  };

  return (
    <CardRoot w="lg">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Or{" "}
          <Link href={"register"}>
            <ChakraLink color={"blue.500"} as="span">register</ChakraLink>
          </Link>{" "}
          a new account
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Stack gap="4" w="full">
            <Field label="Handle">
              <Input
                name="code"
                value={code}
                onChange={(e) => setCode(e.currentTarget.value)}
              />
            </Field>
            <Field label="Password">
              <PasswordInput
                name="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
            </Field>
            {logInError && (
              <Alert.Root status={"error"}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Failed to login</Alert.Title>
                  <Alert.Description>
                    {(logInError as { data?: { message?: string } }).data?.message}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
          </Stack>
        </form>
      </CardBody>
      <CardFooter justifyContent="flex-end">
        <Link href={"/"}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button colorPalette={"blue"} variant="solid" onClick={handleSubmit}>Sign in</Button>
      </CardFooter>
    </CardRoot>
  );
}
