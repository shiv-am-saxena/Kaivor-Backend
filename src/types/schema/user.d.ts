import { ObjectId } from "mongoose";

export default interface IUser {
    _id: ObjectId; // Unique identifier for the user
    fullName: string; // User's full name
    role: "user" | "admin"; // User's role, either "user" or "admin"
    email: string; // User's email address
    password: string;
    phoneNumber: string; // User's phone number
    googleId?: string; // Optional Google ID for users who sign in with Google
    isVerified: {
        email: boolean; // Indicates if the user's email is verified
        phone: boolean; // Indicates if the user's phone number is verified
    }
    addressBook: IUserAddressBook[]; // Array of user's address book entries
    refreshToken: string; // Token used for refreshing the user's session
    createdAt: Date; // Timestamp indicating when the user was created
    updatedAt: Date; // Timestamp indicating when the user was last updated
}

export default interface IUserAddressBook{
    _id: string; // Unique identifier for the address book entry
    name: string; // Name associated with the address book entry
    phoneNumber: string; // Phone number associated with the address book entry
    address: {
        type: "home" | "work" | "other"; // Type of address (e.g., home, work)
        location?: {
            longitude: number; // Longitude coordinate of the address
            latitude: number; // Latitude coordinate of the address
        }
        street: string; // Street address
        city: string; // City of the address
        state: string; // State of the address
        postalCode: string; // Postal code of the address
        country: string; // Country of the address
    }
}