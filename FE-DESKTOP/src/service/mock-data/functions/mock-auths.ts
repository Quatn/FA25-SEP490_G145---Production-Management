import mockUsers from "../mock-users.json";

export const mockLogin = async (
  { username, password }: { username: string; password: string },
) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = mockUsers.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    return {
      data: {
        user: {
          username: user.username,
          email: user.email,
        },
      },
    };
  } else {
    throw ({
      error: { status: 401, data: { message: "Invalid credentials" } },
    });
  }
};

export const mockLogout = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: {
      message: "Logged out successfully",
    },
  };
};
