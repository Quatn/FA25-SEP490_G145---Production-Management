import { useLogoutMutation } from "@/service/api/authApiSlice";
import { useRouter } from "next/navigation";
import { devlog } from "@/utils/devlog";
import { clearCredentials } from "@/service/features/authSlice";
import { useAppDispatch } from "@/service/hooks";
import { Button } from "@chakra-ui/react";
import { toaster } from "../ui/toaster";

export default function LogoutButton() {
  const router = useRouter();
  const [logout, { isLoading: isLoggingOut, error: logOutError }] =
    useLogoutMutation();

  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      const response = await logout({}).unwrap();
      dispatch(clearCredentials());
      toaster.create({
        title: `Logged out sucessfully as ${response.data?.code}`,
        type: "success",
      });
      router.push("/login");
    } catch (e) {
      devlog(e);
      toaster.create({
        title: "An error occurred while trying to logout",
        type: "error",
      });
    }
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
