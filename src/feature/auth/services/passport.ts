import GoogleStrategy from "passport-google-oauth20";
import { env } from "../../../config/index.js";
import passport from "passport";
import UserModel from "../../../models/user.model.js";

passport.serializeUser((user: any, done: (error: any, id?: unknown) => void): void => {
	done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (error: any, user?: any) => void): Promise<void> => {
	try {
		const user = await UserModel.findById(id);
		done(null, user);
	} catch (error) {
		done(error);
	}
});

passport.use("google-signin",
    new GoogleStrategy.Strategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await UserModel.findOne({ googleId: profile.id });
                if (!user) {
                    return done(null, false, { message: "User not found, Try registering first" });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use("google-signup",
    new GoogleStrategy.Strategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/register/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await UserModel.findOne({ googleId: profile?.emails?.[0]?.value });
                if (user) {
                    if(user.googleId === profile.id) {
                        return done(null, false, { message: "User already exists, Try logging in" });
                    }
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                }
                const newUser = await UserModel.create({
                    googleId: profile.id,
                    email: profile?.emails?.[0]?.value as string,
                    name: profile?.displayName,
                    isVerified: {
                        email: true,
                    },
                });
                if (!newUser) {
                    return done(null, false, { message: "User creation failed" });
                }
                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    )
);

export default passport;
