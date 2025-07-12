const TIMEZONE = "Europe/Paris";

export const getParisCurrentTime = async (): Promise<Date> => {
  const currentTime = new Date().toLocaleString("en-US", {
    timeZone: TIMEZONE,
  });
  return new Date(currentTime);
};

export const allowedHours = [0, 1, 8, 12, 17];

export const shouldRunImport = async (): Promise<boolean> => {
  const parisTime = await getParisCurrentTime();
  const hour = parisTime.getHours();
  return allowedHours.includes(hour);
};
