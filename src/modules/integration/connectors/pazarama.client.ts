export type PazaramaOrderLine = {
  id?: string | number;
  lineId?: string | number;
  orderItemId?: string | number;
  productCode?: string;
  stockCode?: string;
  sellerSku?: string;
  merchantSku?: string;
  barcode?: string;
  productName?: string;
  name?: string;
  quantity?: number | string;
  price?: number | string;
  salePrice?: number | string;
  amount?: number | string;
  [key: string]: unknown;
};

export type PazaramaOrder = {
  id?: string | number;
  orderId?: string | number;
  orderCode?: string | number;
  orderNumber?: string | number;
  packageNumber?: string | number;
  status?: string;
  orderDate?: string | number;
  updatedDate?: string | number;
  lastModifiedDate?: string | number;
  customerName?: string;
  customerFullName?: string;
  customerEmail?: string;
  shippingAddress?: Record<string, unknown>;
  shipmentAddress?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  invoiceAddress?: Record<string, unknown>;
  cargoCompanyName?: string;
  cargoProviderName?: string;
  cargoTrackingNumber?: string;
  lines?: PazaramaOrderLine[];
  orderItems?: PazaramaOrderLine[];
  items?: PazaramaOrderLine[];
  [key: string]: unknown;
};

export type PazaramaOrderQuery = {
  startDate: Date;
  endDate: Date;
  pageSize?: number;
  maxPages?: number;
};

export type PazaramaCreateProductAttribute = {
  attributeId: string;
  attributeValueId: string;
};

export type PazaramaCreateProductImage = {
  imageurl: string;
};

export type PazaramaCreateProductItem = {
  Name: string;
  DisplayName: string;
  Description: string;
  brandId: string;
  Desi: number;
  Code: string;
  groupCode: string;
  StockCount: number;
  stockCode: string;
  VatRate: number;
  ListPrice: number;
  SalePrice: number;
  currencyType: "TRY";
  CategoryId: string;
  images: PazaramaCreateProductImage[];
  attributes: PazaramaCreateProductAttribute[];
  deliveries: unknown[];
};

export type PazaramaCreateProductsPayload = {
  products: PazaramaCreateProductItem[];
};

export type PazaramaUpdatePricePayload = {
  items: Array<{
    code: string;
    listPrice: number;
    salePrice: number;
  }>;
};

export type PazaramaUpdateStockPayload = {
  items: Array<{
    code: string;
    stockCount: number;
  }>;
};

export type PazaramaUpdateOrderStatusPayload = {
  orderNumber: number;
  item: {
    orderItemId: string;
    status: number;
    deliveryType?: number;
    shippingTrackingNumber?: string;
    trackingUrl?: string;
    cargoCompanyId?: string;
  };
};

export type PazaramaUpdateOrderStatusListPayload = {
  orderNumber: number;
  status: number;
};

export type PazaramaBulkStatusUpdatePayload = {
  orderNumber: number;
  orderItemIds: string[];
  updateShipmentDto: {
    cargoCompanyId: string;
    deliveryType: number;
    shipmentNumber?: string;
    shippingTrackingNumber: string;
    status: number;
    subStatus: number;
    trackingUrl?: string;
  };
};

type PazaramaAuthResponse = {
  data?: {
    accessToken?: string;
  };
  access_token?: string;
};

type PazaramaOrdersResponse =
  | PazaramaOrder[]
  | {
      data?: PazaramaOrder[] | { data?: PazaramaOrder[]; items?: PazaramaOrder[] };
      items?: PazaramaOrder[];
      totalPages?: number;
      page?: number;
      success?: boolean;
    };

type PazaramaBrandItem = {
  id?: string;
  name?: string;
};

type PazaramaBrandResponse = {
  data?: PazaramaBrandItem[];
};

type PazaramaCategoryTreeItem = {
  id?: string;
  parentCategories?: Array<{ name?: string; displayName?: string }> | null;
  name?: string;
  displayName?: string;
  leaf?: boolean;
};

type PazaramaCategoryTreeResponse = {
  data?: PazaramaCategoryTreeItem[];
};

type PazaramaCategoryAttributeValueItem = {
  id?: string | number;
  value?: string;
  name?: string;
  displayName?: string;
};

type PazaramaCategoryAttributeItem = {
  id?: string | number;
  name?: string;
  displayName?: string;
  isVariantable?: boolean;
  isRequired?: boolean;
  attributeValues?: PazaramaCategoryAttributeValueItem[];
};

type PazaramaCategoryWithAttributesResponse = {
  data?: {
    attributes?: PazaramaCategoryAttributeItem[];
  };
};

type PazaramaCreateProductResponse = {
  data?: {
    batchRequestId?: string;
    creationDate?: string;
    error?: {
      errors?: unknown[];
      message?: string | null;
    } | null;
  };
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
};

type PazaramaProductBatchResultResponse = {
  data?: {
    status?: number;
    batchRequestId?: string;
    batchResult?: unknown[];
    totalCount?: number;
    successfulCount?: number;
    failedCount?: number;
    failedProducts?: Array<{
      productName?: string;
      productCode?: string;
      errorReason?: string;
    }>;
  };
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
};

type PazaramaListingUpdateResponse = {
  data?: string;
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
};

type PazaramaListingBatchResultResponse = {
  data?: {
    data?: Array<{
      id?: string;
      batchId?: string;
      refId?: string;
      code?: string;
      price?: {
        status?: number | null;
        operationDetail?: string | null;
        salePrice?: number | null;
        listPrice?: number | null;
      } | null;
      stock?: {
        status?: number | null;
        operationDetail?: string | null;
        stockCount?: number | null;
      } | null;
      status?: number | null;
      operationStatusText?: string | null;
      operationSourceText?: string | null;
    }>;
    totalCount?: number;
    pageIndex?: number;
    pageSize?: number;
  };
  success?: boolean;
  messageCode?: string | null;
  message?: string | null;
  userMessage?: string | null;
};

type PazaramaOrderStatusResponse = {
  data?: unknown;
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
};

function parseOrdersPayload(payload: PazaramaOrdersResponse) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      totalPages: 1,
    };
  }

  if (Array.isArray(payload.data)) {
    return {
      items: payload.data,
      totalPages: Math.max(payload.totalPages ?? 1, 1),
    };
  }

  return {
    items: payload.items ?? payload.data?.items ?? payload.data?.data ?? [],
    totalPages: Math.max(payload.totalPages ?? 1, 1),
  };
}

export class PazaramaClient {
  private readonly baseUrl: string;
  private readonly authUrl: string;
  private authToken: string | null = null;

  constructor(private readonly args: {
    apiKey: string;
    apiSecret: string;
    endpointUrl?: string | null;
    authUrl?: string | null;
  }) {
    this.baseUrl = (args.endpointUrl ?? "https://isortagimapi.pazarama.com").replace(/\/$/, "");
    this.authUrl = (args.authUrl ?? "https://isortagimgiris.pazarama.com/connect/token").replace(/\/$/, "");
  }

  private async getAccessToken() {
    if (this.authToken) {
      return this.authToken;
    }

    const token = Buffer.from(`${this.args.apiKey}:${this.args.apiSecret}`, "utf8").toString("base64");
    const response = await fetch(this.authUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "merchantgatewayapi.fullaccess",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_AUTH_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    const payload = await response.json().catch(() => ({})) as PazaramaAuthResponse;
    const accessToken = payload.data?.accessToken ?? payload.access_token ?? null;

    if (!accessToken) {
      throw new Error("PAZARAMA_AUTH_TOKEN_MISSING");
    }

    this.authToken = accessToken;
    return accessToken;
  }

  private async buildHeaders() {
    const accessToken = await this.getAccessToken();
    return {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    };
  }

  async getOrders(query: PazaramaOrderQuery) {
    const pageSize = Math.min(Math.max(query.pageSize ?? 100, 1), 100);
    const maxPages = Math.min(Math.max(query.maxPages ?? 20, 1), 100);
    const items: PazaramaOrder[] = [];
    let totalPages = 1;

    for (let page = 1; page <= totalPages && page <= maxPages; page += 1) {
      const response = await fetch(`${this.baseUrl}/order/getOrdersForApi`, {
        method: "POST",
        headers: {
          ...(await this.buildHeaders()),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          StartDate: query.startDate.toISOString(),
          EndDate: query.endDate.toISOString(),
          Page: String(page),
          Size: String(pageSize),
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`PAZARAMA_GET_ORDERS_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
      }

      const payload = await response.json().catch(() => []) as PazaramaOrdersResponse;
      const parsed = parseOrdersPayload(payload);
      items.push(...parsed.items);
      totalPages = parsed.totalPages;

      if (parsed.items.length < pageSize && parsed.totalPages === 1) {
        break;
      }
    }

    return items;
  }

  async testConnection() {
    await this.getOrders({
      startDate: new Date(Date.now() - 60 * 60 * 1000),
      endDate: new Date(),
      pageSize: 1,
      maxPages: 1,
    });
  }

  async searchBrands(name: string) {
    const query = name.trim();

    if (query.length < 2) {
      return [];
    }

    const url = new URL(`${this.baseUrl}/brand/getBrands`);
    url.searchParams.set("Page", "1");
    url.searchParams.set("Size", "100000");
    url.searchParams.set("name", query);

    const response = await fetch(url, {
      method: "GET",
      headers: await this.buildHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_SEARCH_BRANDS_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    const payload = await response.json().catch(() => ({})) as PazaramaBrandResponse;
    return (payload.data ?? [])
      .filter((item): item is Required<Pick<PazaramaBrandItem, "id" | "name">> => Boolean(item.id && item.name))
      .map((item) => ({
        id: item.id,
        name: item.name,
      }))
      .slice(0, 50);
  }

  async searchCategories(name: string) {
    const query = name.trim().toLocaleLowerCase("tr-TR");

    if (query.length < 2) {
      return [];
    }

    const response = await fetch(`${this.baseUrl}/category/getCategoryTree`, {
      method: "GET",
      headers: await this.buildHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_SEARCH_CATEGORIES_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    const payload = await response.json().catch(() => ({})) as PazaramaCategoryTreeResponse;
    return (payload.data ?? [])
      .filter((item) => item.id && (item.displayName || item.name) && item.leaf)
      .map((item) => {
        const pathParts = [
          ...(item.parentCategories ?? []).map((parent) => parent.displayName ?? parent.name).filter((value): value is string => Boolean(value)),
          item.displayName ?? item.name ?? "",
        ].filter(Boolean);

        return {
          id: item.id!,
          name: item.displayName ?? item.name ?? "",
          path: pathParts.join(" > "),
          leaf: Boolean(item.leaf),
        };
      })
      .filter((item) => item.path.toLocaleLowerCase("tr-TR").includes(query) || item.name.toLocaleLowerCase("tr-TR").includes(query))
      .slice(0, 50);
  }

  async getCategoryAttributes(categoryId: string) {
    const url = new URL(`${this.baseUrl}/category/getCategoryWithAttributes`);
    url.searchParams.set("Id", categoryId);

    const response = await fetch(url, {
      method: "GET",
      headers: await this.buildHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_CATEGORY_ATTRIBUTES_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    const payload = await response.json().catch(() => ({})) as PazaramaCategoryWithAttributesResponse;
    return (payload.data?.attributes ?? [])
      .filter((item) => item.id && (item.displayName || item.name))
      .map((item) => ({
        id: String(item.id),
        name: item.displayName ?? item.name ?? "",
        required: Boolean(item.isRequired),
        variantable: Boolean(item.isVariantable),
        values: (item.attributeValues ?? [])
          .filter((value) => value.id && (value.displayName || value.name || value.value))
          .map((value) => ({
            id: String(value.id),
            name: value.displayName ?? value.name ?? value.value ?? "",
          })),
      }));
  }

  async createProducts(payload: PazaramaCreateProductsPayload) {
    const response = await fetch(`${this.baseUrl}/product/create`, {
      method: "POST",
      headers: {
        ...(await this.buildHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_CREATE_PRODUCTS_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    return await response.json().catch(() => ({})) as PazaramaCreateProductResponse;
  }

  async getProductBatchResult(batchRequestId: string) {
    const url = new URL(`${this.baseUrl}/product/getProductBatchResult`);
    url.searchParams.set("BatchRequestId", batchRequestId);

    const response = await fetch(url, {
      method: "GET",
      headers: await this.buildHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_PRODUCT_BATCH_RESULT_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    return await response.json().catch(() => ({})) as PazaramaProductBatchResultResponse;
  }

  async updatePrices(payload: PazaramaUpdatePricePayload) {
    const response = await fetch(`${this.baseUrl}/product/updatePrice-v2`, {
      method: "POST",
      headers: {
        ...(await this.buildHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_UPDATE_PRICES_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    return await response.json().catch(() => ({})) as PazaramaListingUpdateResponse;
  }

  async updateStocks(payload: PazaramaUpdateStockPayload) {
    const response = await fetch(`${this.baseUrl}/product/updateStock-v2`, {
      method: "POST",
      headers: {
        ...(await this.buildHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_UPDATE_STOCKS_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    return await response.json().catch(() => ({})) as PazaramaListingUpdateResponse;
  }

  async getListingBatchResult(dataId: string) {
    const url = new URL(`${this.baseUrl}/listing-state/batch-id/${encodeURIComponent(dataId)}/lake-projections`);
    url.searchParams.set("page", "1");
    url.searchParams.set("pageSize", "3000");

    const response = await fetch(url, {
      method: "GET",
      headers: await this.buildHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_LISTING_BATCH_RESULT_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    return await response.json().catch(() => ({})) as PazaramaListingBatchResultResponse;
  }

  async updateOrderStatus(payload: PazaramaUpdateOrderStatusPayload) {
    const response = await fetch(`${this.baseUrl}/order/updateOrderStatus`, {
      method: "PUT",
      headers: {
        ...(await this.buildHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_UPDATE_ORDER_STATUS_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    return await response.json().catch(() => ({})) as PazaramaOrderStatusResponse;
  }

  async updateOrderStatusList(payload: PazaramaUpdateOrderStatusListPayload) {
    const response = await fetch(`${this.baseUrl}/order/updateOrderStatusList`, {
      method: "PUT",
      headers: {
        ...(await this.buildHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_UPDATE_ORDER_STATUS_LIST_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    return await response.json().catch(() => ({})) as PazaramaOrderStatusResponse;
  }

  async bulkUpdateOrderStatus(payload: PazaramaBulkStatusUpdatePayload) {
    const response = await fetch(`${this.baseUrl}/order/api/bulk-status-update`, {
      method: "POST",
      headers: {
        ...(await this.buildHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`PAZARAMA_BULK_STATUS_UPDATE_FAILED:${response.status}:${errorBody.slice(0, 240)}`);
    }

    return await response.json().catch(() => ({})) as PazaramaOrderStatusResponse;
  }
}
