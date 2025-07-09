const TIMEZONE = "Europe/Paris";

export const getParisCurrentTime = async (): Promise<Date> => {
  const currentTime = new Date().toLocaleString("en-US", {
    timeZone: TIMEZONE,
  });
  return new Date(currentTime);
};

export const shouldRunImport = async (): Promise<boolean> => {
  const parisTime = await getParisCurrentTime();
  const hour = parisTime.getHours();
  const allowedHours = [0, 1, 8, 12, 17];
  return allowedHours.includes(hour);
};
