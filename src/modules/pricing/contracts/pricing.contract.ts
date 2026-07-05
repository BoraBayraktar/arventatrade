export type PromotionEvaluationInput = {
	code?: string;
	subtotal: number;
	currency: string;
};

export type PromotionEvaluationResult = {
	applied: boolean;
	code: string | null;
	discountTotal: number;
	reason: "NONE" | "NOT_FOUND" | "INACTIVE" | "OUTSIDE_ACTIVE_WINDOW" | "MIN_SUBTOTAL" | "USAGE_LIMIT" | "CURRENCY_MISMATCH";
};
