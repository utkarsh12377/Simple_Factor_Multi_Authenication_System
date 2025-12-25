import axios from "axios";

const AUTH_API = "https://localhost:5000/api/auth";
const OTP_API = "https://localhost:5000/api/otp";

export const loginUser = (email, password) => {
  return axios.post(`${AUTH_API}/login`, { email, password });
};

export const requestOtp = (email) => {
  return axios.post(`${OTP_API}/request-otp`, { email });
};

export const verifyOtp = (email, otp) => {
  return axios.post(`${OTP_API}/verify-otp`, { email, otp });
};
