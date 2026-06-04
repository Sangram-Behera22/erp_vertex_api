export const apiResponse = <T>(
  data: T,
  message = "Success"
) => ({
  success: true,
  message,
  data,
});

export const apiError = (
  message = "Something went wrong"
) => ({
  success: false,
  message,
});