import { PricingRepository } from "@/modules/pricing/repositories/pricing.repository";
import type { PromotionEvaluationInput, PromotionEvaluationResult } from "@/modules/pricing/contracts/pricing.contract";

function roundMoney(value: number) {
	return Math.round(value * 100) / 100;
}

export class PricingService {
	constructor(private readonly repository: PricingRepository) {}

	async evaluatePromotion(input: PromotionEvaluationInput): Promise<PromotionEvaluationResult> {
		const code = input.code?.trim().toUpperCase();
		if (!code) {
			return {
				applied: false,
				code: null,
				discountTotal: 0,
				reason: "NONE",
			};
		}

		const promotion = await this.repository.findPromotionByCode(code);
		if (!promotion) {
			return {
				applied: false,
				code,
				discountTotal: 0,
				reason: "NOT_FOUND",
			};
		}

		if (!promotion.active) {
			return {
				applied: false,
				code,
				discountTotal: 0,
				reason: "INACTIVE",
			};
		}

		const now = new Date();
		if ((promotion.startsAt && promotion.startsAt > now) || (promotion.endsAt && promotion.endsAt < now)) {
			return {
				applied: false,
				code,
				discountTotal: 0,
				reason: "OUTSIDE_ACTIVE_WINDOW",
			};
		}

		if (promotion.usageLimit !== null && promotion.usageLimit !== undefined && promotion.usedCount >= promotion.usageLimit) {
			return {
				applied: false,
				code,
				discountTotal: 0,
				reason: "USAGE_LIMIT",
			};
		}

		if (promotion.currency !== input.currency) {
			return {
				applied: false,
				code,
				discountTotal: 0,
				reason: "CURRENCY_MISMATCH",
			};
		}

		const minSubtotal = promotion.minSubtotal?.toNumber() ?? null;
		if (minSubtotal !== null && input.subtotal < minSubtotal) {
			return {
				applied: false,
				code,
				discountTotal: 0,
				reason: "MIN_SUBTOTAL",
			};
		}

		const rawDiscount = promotion.type === "PERCENTAGE"
			? (input.subtotal * promotion.value.toNumber()) / 100
			: promotion.value.toNumber();

		const maxDiscount = promotion.maxDiscount?.toNumber() ?? null;
		const cappedDiscount = maxDiscount === null ? rawDiscount : Math.min(rawDiscount, maxDiscount);
		const discountTotal = roundMoney(Math.min(cappedDiscount, input.subtotal));

		if (discountTotal <= 0) {
			return {
				applied: false,
				code,
				discountTotal: 0,
				reason: "INACTIVE",
			};
		}

		return {
			applied: true,
			code,
			discountTotal,
			reason: "NONE",
		};
	}

	async markPromotionUsage(code: string) {
		const promotion = await this.repository.findPromotionByCode(code);
		if (!promotion) {
			return;
		}

		await this.repository.incrementPromotionUsage(promotion.id);
	}
}

export const pricingService = new PricingService(new PricingRepository());
