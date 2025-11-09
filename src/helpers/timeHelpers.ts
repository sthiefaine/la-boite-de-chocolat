const TIMEZONE = "Europe/Paris";

export const getParisCurrentTime = async (): Promise<Date> => {
  const currentTime = new Date().toLocaleString("en-US", {
    timeZone: TIMEZONE,
  });
  return new Date(currentTime);
};

export const allowedHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

export const shouldRunImport = async (): Promise<boolean> => {
  const parisTime = await getParisCurrentTime();
  const hour = parisTime.getHours();
  return allowedHours.includes(hour);
};
