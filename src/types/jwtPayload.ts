export type JwtUserPayload = {
  id: string;
  email: string;
  role: string;
};

export type JwtDevicePayload = {
  id: string;
  status: string;
};
