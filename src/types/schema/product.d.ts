import { Types } from "mongoose";

export default interface IProduct {
	_id: Types.ObjectId;
	title: string;
	description: string;
	inStock: boolean;
	amount: number;
	discount: number;
	supplierId: Types.ObjectId;
	supplierEmail: string;
	assetLink: string;
	supplierCost: number;
	fabric: string;
	baseImage: string;
	tag: string[];
	variants: IVariant[];
	size: [string];
	createdAt: Date;
	updatedAt: Date;
}

export default interface IVariant {
	_id: string;
	hexCode: string;
	color: string;
	frontFace: string;
	backFace: string;
	frontFull: string;
	backFull: string;
}
