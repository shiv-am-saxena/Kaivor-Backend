import { env } from "../config/index.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export const generateAccessToken = (payload: JwtPayload): string => {
	return jwt.sign(payload, env.JWT_SECRET, {
		expiresIn: env.JWT_EXPIRES_IN
	});
};

export const generateRefreshToken = (payload: JwtPayload): string => {
	return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
		expiresIn: env.JWT_REFRESH_EXPIRES_IN
	});
};

export const generateResetPasswordToken = (payload: JwtPayload): string => {
	return jwt.sign(payload, env.JWT_RESET_PASSWORD_SECRET, {
		expiresIn: env.JWT_RESET_PASSWORD_EXPIRES_IN
	});
};

export const verifyAccessToken = (token: string): JwtPayload => {
	return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
	return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

export const verifyResetPasswordToken = (token: string): JwtPayload => {
	return jwt.verify(token, env.JWT_RESET_PASSWORD_SECRET) as JwtPayload;
};
