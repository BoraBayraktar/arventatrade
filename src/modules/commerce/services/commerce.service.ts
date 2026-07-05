import { z } from "zod";

import { redisCache } from "@/lib/redis";
import type {
  AdminOrderDetail,
  AdminOrderDetailItem,
  AdminOrderListItem,
  AdminOrderListQuery,
  AdminOrderListResult,
  AdminPaymentStatusHistoryEntry,
  AdminOrderSummary,
  AdminOrderStatusHistoryEntry,
  AdminUpdateOrderStatusInput,
  CommerceCheckoutInput,
  CommerceCheckoutResult,
  CommerceLineQuote,
  CommerceQuoteInput,
  CommerceQuoteResult,
} from "@/modules/commerce/contracts/commerce.contract";
import { CommerceRepository } from "@/modules/commerce/repositories/commerce.repository";
import { pricingService } from "@/modules/pricing/services/pricing.service";

const lineSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

const quoteSchema = z.object({
  lines: z.array(lineSchema).min(1).max(30),
  promotionCode: z.string().trim().max(40).optional(),
});

const orderListQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const orderIdSchema = z.object({
  id: z.string().trim().min(1),
});

const updateOrderStatusSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"]).optional(),
  changedByUserId: z.string().trim().min(1),
  note: z.string().trim().max(280).optional(),
}).refine((value) => Boolean(value.status || value.paymentStatus), {
  message: "Order status or payment status is required",
});

export class CommerceCheckoutError extends Error {
  constructor(message: string, public readonly status = 409) {
    super(message);
    this.name = "CommerceCheckoutError";
  }
}

export class CommerceOrderAdminError extends Error {
  constructor(message: string, public readonly status = 404) {
    super(message);
    this.name = "CommerceOrderAdminError";
  }
}

function normalizeLines(lines: CommerceQuoteInput["lines"]) {
  const aggregated = new Map<string, number>();

  for (const line of lines) {
    aggregated.set(line.productId, (aggregated.get(line.productId) ?? 0) + line.quantity);
  }

  return [...aggregated.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

function mapQuoteLine(args: {
  line: { productId: string; quantity: number };
  product: {
    id: string;
    slug: string;
    sku: string;
    name: string;
    imageUrl: string;
    currency: string;
    price: { toNumber: () => number };
    compareAtPrice: { toNumber: () => number } | null;
    stock: number;
  } | undefined;
}): CommerceLineQuote {
  if (!args.product) {
    return {
      productId: args.line.productId,
      slug: "",
      sku: "",
      name: "Unknown product",
      imageUrl: "",
      currency: "TRY",
      quantity: args.line.quantity,
      unitPrice: 0,
      compareAtPrice: null,
      lineTotal: 0,
      inStock: false,
      availableStock: 0,
    };
  }

  const unitPrice = args.product.price.toNumber();
  const compareAtPrice = args.product.compareAtPrice?.toNumber() ?? null;

  return {
    productId: args.product.id,
    slug: args.product.slug,
    sku: args.product.sku,
    name: args.product.name,
    imageUrl: args.product.imageUrl,
    currency: args.product.currency,
    quantity: args.line.quantity,
    unitPrice,
    compareAtPrice,
    lineTotal: unitPrice * args.line.quantity,
    inStock: args.product.stock >= args.line.quantity,
    availableStock: args.product.stock,
  };
}

async function invalidateCatalogCache() {
  await Promise.all([
    redisCache.delByPrefix("catalog:list:"),
    redisCache.delByPrefix("catalog:detail:"),
    redisCache.del("catalog:categories"),
  ]);
}

function mapOrderDetailItem(item: {
  id: string;
  productId: string | null;
  productSlug: string;
  productSku: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: { toNumber: () => number };
  compareAtPrice: { toNumber: () => number } | null;
  lineTotal: { toNumber: () => number };
  currency: string;
}): AdminOrderDetailItem {
  return {
    id: item.id,
    productId: item.productId,
    productSlug: item.productSlug,
    productSku: item.productSku,
    productName: item.productName,
    productImageUrl: item.productImageUrl,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toNumber(),
    compareAtPrice: item.compareAtPrice?.toNumber() ?? null,
    lineTotal: item.lineTotal.toNumber(),
    currency: item.currency,
  };
}

function mapOrderDetail(order: {
  id: string;
  orderNumber: string;
  status: "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: { toNumber: () => number };
  discountTotal: { toNumber: () => number };
  total: { toNumber: () => number };
  promotionCode: string | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string | null;
    productSlug: string;
    productSku: string;
    productName: string;
    productImageUrl: string;
    quantity: number;
    unitPrice: { toNumber: () => number };
    compareAtPrice: { toNumber: () => number } | null;
    lineTotal: { toNumber: () => number };
    currency: string;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus: "CONFIRMED" | "CANCELLED" | null;
    toStatus: "CONFIRMED" | "CANCELLED";
    source: "SYSTEM" | "ADMIN";
    changedByUserId: string | null;
    note: string | null;
    createdAt: Date;
  }>;
  paymentStatusHistory: Array<{
    id: string;
    fromStatus: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED" | null;
    toStatus: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
    source: "SYSTEM" | "ADMIN";
    changedByUserId: string | null;
    note: string | null;
    createdAt: Date;
  }>;
}): AdminOrderDetail {
  const statusHistory: AdminOrderStatusHistoryEntry[] = order.statusHistory.map((item) => ({
    id: item.id,
    fromStatus: item.fromStatus,
    toStatus: item.toStatus,
    source: item.source,
    changedByUserId: item.changedByUserId,
    note: item.note,
    createdAt: item.createdAt.toISOString(),
  }));

  const paymentStatusHistory: AdminPaymentStatusHistoryEntry[] = order.paymentStatusHistory.map((item) => ({
    id: item.id,
    fromStatus: item.fromStatus,
    toStatus: item.toStatus,
    source: item.source,
    changedByUserId: item.changedByUserId,
    note: item.note,
    createdAt: item.createdAt.toISOString(),
  }));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal.toNumber(),
    discountTotal: order.discountTotal.toNumber(),
    total: order.total.toNumber(),
    promotionCode: order.promotionCode,
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(mapOrderDetailItem),
    statusHistory,
    paymentStatusHistory,
  };
}

export class CommerceService {
  constructor(private readonly repository: CommerceRepository) {}

  async quote(input: CommerceQuoteInput): Promise<CommerceQuoteResult> {
    const parsed = quoteSchema.parse(input);
    const normalized = normalizeLines(parsed.lines);
    const products = await this.repository.listActiveProductsByIds(normalized.map((line) => line.productId));
    const productMap = new Map(products.map((item) => [item.id, item]));

    const lines = normalized.map((line) => mapQuoteLine({ line, product: productMap.get(line.productId) }));
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const promotion = await pricingService.evaluatePromotion({
      code: parsed.promotionCode,
      subtotal,
      currency: lines[0]?.currency ?? "TRY",
    });
    const discountTotal = promotion.discountTotal;
    const total = Math.max(0, subtotal - discountTotal);

    return {
      lines,
      subtotal,
      discountTotal,
      total,
      promotionCode: promotion.applied ? promotion.code : null,
      currency: lines[0]?.currency ?? "TRY",
      allInStock: lines.every((line) => line.inStock),
    };
  }

  async checkout(input: CommerceCheckoutInput): Promise<CommerceCheckoutResult> {
    const quote = await this.quote(input);

    if (quote.lines.length === 0) {
      throw new CommerceCheckoutError("Cart is empty", 400);
    }

    const missing = quote.lines.find((line) => !line.slug);
    if (missing) {
      throw new CommerceCheckoutError("Some products are no longer available", 409);
    }

    const outOfStock = quote.lines.find((line) => !line.inStock);
    if (outOfStock) {
      throw new CommerceCheckoutError("Insufficient stock for one or more products", 409);
    }

    const orderNumber = `ARV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let createdOrderNumber = orderNumber;

    try {
      const createdOrder = await this.repository.createOrderAndDecrementStock({
        orderNumber,
        lines: quote.lines,
        subtotal: quote.subtotal,
        discountTotal: quote.discountTotal,
        total: quote.total,
        promotionCode: quote.promotionCode,
        currency: quote.currency,
      });
      createdOrderNumber = createdOrder.orderNumber;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK")) {
        throw new CommerceCheckoutError("Insufficient stock for one or more products", 409);
      }

      throw error;
    }

    await invalidateCatalogCache();

    if (quote.promotionCode) {
      await pricingService.markPromotionUsage(quote.promotionCode);
    }

    return {
      orderNumber: createdOrderNumber,
      subtotal: quote.subtotal,
      discountTotal: quote.discountTotal,
      total: quote.total,
      promotionCode: quote.promotionCode,
      currency: quote.currency,
      lines: quote.lines,
    };
  }

  async listOrders(query: AdminOrderListQuery): Promise<AdminOrderListResult> {
    const parsed = orderListQuerySchema.parse(query);
    const [orders, total] = await Promise.all([
      this.repository.listOrders(parsed),
      this.repository.countOrders({ search: parsed.search, status: parsed.status, paymentStatus: parsed.paymentStatus }),
    ]);

    const items: AdminOrderListItem[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal.toNumber(),
      discountTotal: order.discountTotal.toNumber(),
      total: order.total.toNumber(),
      promotionCode: order.promotionCode,
      currency: order.currency,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt.toISOString(),
    }));

    return {
      items,
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }

  async getOrderSummary(): Promise<AdminOrderSummary> {
    const aggregated = await this.repository.aggregateRevenue();

    return {
      totalOrders: aggregated.aggregate._count._all,
      totalRevenue: aggregated.aggregate._sum.total?.toNumber() ?? 0,
      totalDiscount: aggregated.aggregate._sum.discountTotal?.toNumber() ?? 0,
      paidOrders: aggregated.paidOrders,
      pendingPayments: aggregated.pendingPayments,
      currency: "TRY",
    };
  }

  async getOrderById(id: string): Promise<AdminOrderDetail> {
    const parsed = orderIdSchema.parse({ id });
    const order = await this.repository.findOrderById(parsed.id);

    if (!order) {
      throw new CommerceOrderAdminError("Order not found", 404);
    }

    return mapOrderDetail(order);
  }

  async updateOrderStatus(input: AdminUpdateOrderStatusInput): Promise<AdminOrderDetail> {
    const parsed = updateOrderStatusSchema.parse(input);

    const existing = await this.repository.findOrderById(parsed.id);
    if (!existing) {
      throw new CommerceOrderAdminError("Order not found", 404);
    }

    let current = existing;

    if (parsed.status && current.status !== parsed.status) {
      current = await this.repository.updateOrderStatus({
        id: parsed.id,
        fromStatus: current.status,
        toStatus: parsed.status,
        changedByUserId: parsed.changedByUserId,
        note: parsed.note,
      });
    }

    if (parsed.paymentStatus && current.paymentStatus !== parsed.paymentStatus) {
      current = await this.repository.updateOrderPaymentStatus({
        id: parsed.id,
        fromStatus: current.paymentStatus,
        toStatus: parsed.paymentStatus,
        changedByUserId: parsed.changedByUserId,
        note: parsed.note,
      });
    }

    return mapOrderDetail(current);
  }

  async softDeleteOrder(id: string, deletedUserId: string) {
    const parsed = orderIdSchema.parse({ id });

    const existing = await this.repository.findOrderById(parsed.id);
    if (!existing) {
      throw new CommerceOrderAdminError("Order not found", 404);
    }

    await this.repository.softDeleteOrder(parsed.id, deletedUserId);
  }
}

export const commerceService = new CommerceService(new CommerceRepository());
