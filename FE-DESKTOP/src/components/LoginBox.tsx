"use client";

import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { useLogInMutation } from "@/service/api/authApiSlice";
import { setCredentials } from "@/service/features/authSlice";
import { useAppDispatch } from "@/service/hooks";
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
  const [username, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [logIn, { isLoading: isLoggingIn, error: logInError }] =
    useLogInMutation();

  const handleSubmit = async () => {
    try {
      const response = await logIn({ username, password }).unwrap();
      const userData = response.user;
      if (!check.nonEmptyObject(userData)) {
        throw "Invalid login response";
      }
      dispatch(setCredentials(userData));
      toaster.create({
        description: "Logged in successfully",
        type: "success",
      });
      router.push("/");
    } catch (e) {
      console.error(e);
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
                name="username"
                value={username}
                onChange={(e) => setHandle(e.currentTarget.value)}
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
                    A description might be here idk
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
        <Button variant="solid" onClick={handleSubmit}>Sign in</Button>
      </CardFooter>
    </CardRoot>
  );
}
