import { prisma } from "@/lib/prisma";

export class PricingRepository {
	async findPromotionByCode(code: string) {
		return prisma.promotion.findFirst({
			where: {
				code,
				deleted: false,
			},
		});
	}

	async incrementPromotionUsage(id: string) {
		return prisma.promotion.update({
			where: { id },
			data: {
				usedCount: {
					increment: 1,
				},
			},
		});
	}
}
