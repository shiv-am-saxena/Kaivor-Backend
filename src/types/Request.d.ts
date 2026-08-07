import IUser from "./schema/user.d.js";

declare global {
	namespace Express {
		interface Request {
			user?: IUser; // Optional property to hold the authenticated user object, which can be of type IUser or null
		}
	}
}
