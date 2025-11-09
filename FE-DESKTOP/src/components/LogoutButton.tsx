import { useLogOutMutation } from "@/service/api/authApiSlice";
import { useRouter } from "next/navigation";
import { toaster } from "./ui/toaster";
import { devlog } from "@/utils/devlog";
import { clearCredentials } from "@/service/features/authSlice";
import { useAppDispatch } from "@/service/hooks";
import { Button } from "@chakra-ui/react";

export default function LogoutButton() {
  const router = useRouter();
  const [logOut, { isLoading: isLoggingOut, error: logOutError }] =
    useLogOutMutation();

  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await logOut().unwrap();
      dispatch(clearCredentials());
      toaster.create({
        title: "Logged out sucessfully",
        type: "success",
      });
      router.push("/auth/login");
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
