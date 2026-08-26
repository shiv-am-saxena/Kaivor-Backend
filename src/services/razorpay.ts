import Razorpay from "razorpay";
import { env } from "../config/index.js";
import logger from "../libs/logger.js";

export let rzrpe: Razorpay;

const razorpayInit = async (): Promise<Razorpay> => {
	const rzp = new Razorpay({
		key_id: env.RAZORPAY_API_KEY,
		key_secret: env.RAZORPAY_API_SECRET
	});
	if (rzp) {
		logger.info("Razorpay connection established");
		rzrpe = rzp;
		return await Promise.resolve(rzrpe);
	} else {
		return await Promise.reject(new Error("Failed to connect to Razorpay"));
	}
};


export default razorpayInit;
