export const submitClientOnboarding = async (data) => {
  console.log("Client onboarding data:", data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: "Client onboarding completed",
        profile: data,
      });
    }, 1000);
  });
};

export const submitExpertOnboarding = async (data) => {
  console.log("Expert onboarding data:", data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: "Expert onboarding completed",
        profile: data,
      });
    }, 1000);
  });
};