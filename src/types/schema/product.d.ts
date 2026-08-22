export default interface IProduct {
    _id: string;
    title: string;
    description: string;
    amount: number;
    discount: number;
    supplierId: string;
    supplierEmail: string;
    assetLink: string;
    supplierCost: number;
    fabric: string;
    tag: [string];
    varient: IVariant[];
    createdAt: Date;
    updatedAt: Date;
}

export default interface IVariant {
    _id: string;
    color: string;
    size: string;
    frontFace: string;
    backFace: string;
    frontFull: string;
    backFull: string;
}