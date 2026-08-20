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
                const googleId = profile.id;
                const email = profile?.emails?.[0]?.value;

                let user = await UserModel.findOne({ googleId });
                if (!user && email) {
                    user = await UserModel.findOne({ email });
                    if (user) {
                        user.googleId = googleId;
                        user.isVerified = { ...user.isVerified, email: true };
                        await user.save();
                    }
                }

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
                const googleId = profile.id;
                const email = profile?.emails?.[0]?.value;

                // Check if user already exists by googleId
                let user = await UserModel.findOne({ googleId });
                if (user) {
                    return done(null, false, { message: "User already exists, Try logging in" });
                }

                // Check if user exists by email
                if (email) {
                    user = await UserModel.findOne({ email });
                    if (user) {
                        if (!user.googleId) {
                            user.googleId = googleId;
                            user.isVerified = { ...user.isVerified, email: true };
                            await user.save();
                            return done(null, user);
                        }
                        return done(null, false, { message: "User already exists, Try logging in" });
                    }
                }

                // Create new user if not existing
                const newUser = await UserModel.create({
                    googleId,
                    email: email as string,
                    fullName: profile?.displayName,
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
