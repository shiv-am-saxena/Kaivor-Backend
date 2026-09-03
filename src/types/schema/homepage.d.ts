import { Types } from "mongoose";

type HomepageStatus = "draft" | "published" | "archived";

export default interface IHomepage {
	_id: Types.ObjectId; // Unique identifier for the homepage
	status: HomepageStatus; // Status of the homepage (draft, published, archived)
	adminId: Types.ObjectId; // Identifier for the admin who created or manages the homepage
	title: string; // Title of the homepage
	data: any; // Data associated with the homepage (can be of any type)
	createdAt: Date; // Timestamp indicating when the homepage was created
	updatedAt: Date; // Timestamp indicating when the homepage was last updated
}

export interface IAnnouncement {
	order: number; // Order of the announcement in the list
	title: string; // Title of the announcement
	buttonText: string; // Text displayed on the announcement button
	buttonLink: string; // URL or link associated with the announcement button
	isActive: boolean; // Indicates whether the announcement is currently active or not
	countDownTimer?: Date | null; // Optional countdown timer for the announcement (null if not set)
	createdAt: Date; // Timestamp indicating when the announcement was created
	updatedAt: Date; // Timestamp indicating when the announcement was last updated
}

export interface ICarousel {
	order: number; // Order of the carousel in the list
	isGlobal: boolean; // Indicates whether the carousel is global or specific to a homepage
	slides: ICarouselSlide[]; // Array of slides in the carousel
	autoplay: boolean; // Indicates whether the carousel should autoplay or not
	isActive: boolean; // Indicates whether the carousel is currently active or not
	createdAt: Date; // Timestamp indicating when the carousel was created
	updatedAt: Date; // Timestamp indicating when the carousel was last updated
}

export interface ICarouselSlide {
	order: number; // Order of the slide in the carousel
	imageUrl?: string; // URL of the slide image
	videoUrl?: string | null; // Optional URL of the slide video (null if not set)
	title: string; // Title of the slide
	description: string; // Description of the slide
	buttonText: string; // Text displayed on the slide button
	buttonLink: string; // URL or link associated with the slide button
	startDate?: Date | null; // Optional start date for the slide (null if not set)
	endDate?: Date | null; // Optional end date for the slide (null if not set)
	isActive: boolean; // Indicates whether the slide is currently active or not
	createdAt: Date; // Timestamp indicating when the slide was created
	updatedAt: Date; // Timestamp indicating when the slide was last updated
}

export interface IFeaturedProduct {
	order: number; // Order of the featured product in the list
	title: string; // Title of the featured product
	products: Types.ObjectId[]; // Array of identifiers for the featured products
	autoplay: boolean; // Indicates whether the featured product section should autoplay or not
	startDate?: Date | null; // Optional start date for the featured product section (null if not set)
	endDate?: Date | null; // Optional end date for the featured product section (null if not set)
	isActive: boolean; // Indicates whether the featured product is currently active or not
	createdAt: Date; // Timestamp indicating when the featured product was created
	updatedAt: Date; // Timestamp indicating when the featured product was last updated
}

export interface ICategory {
	order: number; // Order of the category in the list
	title: string; // Title of the category
	categories: [{
		imageUrl: string; // Optional URL of the category image
		name: string; // Name of the category
		link: string; // URL or link associated with the category

	}];
	isActive: boolean; // Indicates whether the category is currently active or not
	createdAt: Date; // Timestamp indicating when the category was created
	updatedAt: Date; // Timestamp indicating when the category was last updated
}

export interface IWhyWe {
	order: number; // Order of the "Why We" section in the list
	isActive: boolean; // Indicates whether the "Why We" section is currently active or not
	title: string; // Title for the "Why We" section
	subtitle: string; // Subtitle for the "Why We" section
	pillars: [
		{
			icon: string; // Icon representing the pillar
			tag: string; // Tagline for the pillar
			title: string; // Title for the pillar
			description: string; // Description for the pillar
		}
	];
	createdAt: Date; // Timestamp indicating when the "Why We" section was created
	updatedAt: Date; // Timestamp indicating when the "Why We" section was last updated
}

export interface IEditorialProduct {
	order: number; // Order of the editorial product in the list
	isActive: boolean; // Indicates whether the editorial product is currently active or not
	tag: string; // Tagline for the editorial product
	title: string; // Title for the editorial product
	description: string; // Description for the editorial product
	imageKey: string; // Key for the editorial product image
	productId: string; // Identifier for the editorial product
	specs: [{ label: string; value: string }];
	cta: {
		text: string; // Text for the call-to-action button
		link: string; // Link for the call-to-action button
	};
	createdAt: Date; // Timestamp indicating when the editorial product was created
	updatedAt: Date; // Timestamp indicating when the editorial product was last updated
}

export interface ICommunity {
	order: number; // Order of the community section in the list
	isActive: boolean; // Indicates whether the community section is currently active or not
	title: string; // Title for the community section
	subtitle: string; // Subtitle for the community section
	items: [
		{
			id: number;
			driver: string;
			vehicle: string;
			imageKey: string;
			productWorn: string;
			review: string;
		}
	];
	createdAt: Date; // Timestamp indicating when the community section was created
	updatedAt: Date; // Timestamp indicating when the community section was last updated
}

export interface IFAQs {
	order: number; // Order of the FAQs section in the list
	isActive: boolean; // Indicates whether the FAQs section is currently active or not
	title: string; // Title for the FAQs section
	subtitle: string; // Subtitle for the FAQs section
	faqs: [
		{
			question: string; // Question for the FAQ
			answer: string; // Answer for the FAQ
		}
	];
	createdAt: Date; // Timestamp indicating when the FAQs section was created
	updatedAt: Date; // Timestamp indicating when the FAQs section was last updated
}
