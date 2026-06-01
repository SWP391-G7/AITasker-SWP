export const login = async (data) => {
  console.log("Login data:", data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: "fake-token",
        user: {
          email: data.email,
          role: "client",
        },
      });
    }, 1000);
  });
};

export const register = async (data) => {
  console.log("Register data:", data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: "Register successfully",
        user: {
          fullName: data.fullName,
          email: data.email,
        },
      });
    }, 1000);
  });
};