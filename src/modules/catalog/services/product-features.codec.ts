import type {
  ProductFeature,
  ProductFeatureFacet,
} from "@/modules/catalog/contracts/catalog.contract";

const FEATURES_MARKER_PREFIX = "<!--AT_FEATURES:";
const FEATURES_MARKER_REGEX = /<!--AT_FEATURES:([A-Za-z0-9+/=]+)-->\s*$/;

function normalizePart(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeToken(value: string) {
  return normalizePart(value).toLocaleLowerCase("tr-TR");
}

export function sanitizeFeatures(features: ProductFeature[]) {
  const merged = new Map<string, ProductFeature>();

  for (const feature of features) {
    const key = normalizePart(feature.key);
    const value = normalizePart(feature.value);

    if (!key || !value) {
      continue;
    }

    const mapKey = `${normalizeToken(key)}::${normalizeToken(value)}`;
    const existing = merged.get(mapKey);

    if (!existing) {
      merged.set(mapKey, {
        key,
        value,
        highlighted: Boolean(feature.highlighted),
      });
      continue;
    }

    if (feature.highlighted && !existing.highlighted) {
      merged.set(mapKey, {
        ...existing,
        highlighted: true,
      });
    }
  }

  return Array.from(merged.values());
}

export function decodeProductDescriptionWithFeatures(description: string) {
  const match = description.match(FEATURES_MARKER_REGEX);

  if (!match) {
    return {
      cleanDescription: description,
      features: [] as ProductFeature[],
    };
  }

  const encoded = match[1];
  const plainDescription = description.slice(0, match.index).trimEnd();

  try {
    const json = Buffer.from(encoded, "base64").toString("utf8");
    const parsed = JSON.parse(json) as Array<{ key?: unknown; value?: unknown; highlighted?: unknown }>;

    const features = sanitizeFeatures(
      parsed.map((item) => ({
        key: typeof item.key === "string" ? item.key : "",
        value: typeof item.value === "string" ? item.value : "",
        highlighted: item.highlighted === true,
      })),
    );

    return {
      cleanDescription: plainDescription,
      features,
    };
  } catch {
    return {
      cleanDescription: plainDescription,
      features: [] as ProductFeature[],
    };
  }
}

export function encodeProductDescriptionWithFeatures(description: string, features: ProductFeature[]) {
  const baseDescription = description.replace(FEATURES_MARKER_REGEX, "").trimEnd();
  const normalizedFeatures = sanitizeFeatures(features);

  if (normalizedFeatures.length === 0) {
    return baseDescription;
  }

  const payload = Buffer.from(JSON.stringify(normalizedFeatures), "utf8").toString("base64");
  return `${baseDescription}\n\n${FEATURES_MARKER_PREFIX}${payload}-->`;
}

export function parseFeatureFilterToken(token: string) {
  const [rawKey, rawValue] = token.split("::");
  const key = normalizePart(rawKey ?? "");
  const value = normalizePart(rawValue ?? "");

  if (!key || !value) {
    return null;
  }

  return {
    key,
    value,
    keyToken: normalizeToken(key),
    valueToken: normalizeToken(value),
  };
}

export function buildFeatureFilterTokens(features: ProductFeature[]) {
  return new Set(
    features.map((feature) => `${normalizeToken(feature.key)}::${normalizeToken(feature.value)}`),
  );
}

export function productMatchesFeatureFilters(features: ProductFeature[], tokens: string[]) {
  if (tokens.length === 0) {
    return true;
  }

  const normalized = tokens
    .map((item) => parseFeatureFilterToken(item))
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map((item) => `${item.keyToken}::${item.valueToken}`);

  if (normalized.length === 0) {
    return true;
  }

  const productTokens = buildFeatureFilterTokens(features);
  return normalized.every((token) => productTokens.has(token));
}

export function buildFeatureFacets(items: Array<{ features: ProductFeature[] }>): ProductFeatureFacet[] {
  const facets = new Map<string, Map<string, number>>();
  const keyLabels = new Map<string, string>();
  const valueLabels = new Map<string, string>();

  for (const item of items) {
    const seen = new Set<string>();

    for (const feature of item.features) {
      const keyToken = normalizeToken(feature.key);
      const valueToken = normalizeToken(feature.value);
      const optionToken = `${keyToken}::${valueToken}`;

      if (seen.has(optionToken)) {
        continue;
      }

      seen.add(optionToken);
      keyLabels.set(keyToken, normalizePart(feature.key));
      valueLabels.set(optionToken, normalizePart(feature.value));

      if (!facets.has(keyToken)) {
        facets.set(keyToken, new Map<string, number>());
      }

      const options = facets.get(keyToken);
      if (!options) {
        continue;
      }

      options.set(valueToken, (options.get(valueToken) ?? 0) + 1);
    }
  }

  return Array.from(facets.entries())
    .map(([keyToken, options]) => ({
      key: keyLabels.get(keyToken) ?? keyToken,
      options: Array.from(options.entries())
        .map(([valueToken, count]) => ({
          value: valueLabels.get(`${keyToken}::${valueToken}`) ?? valueToken,
          count,
        }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "tr-TR")),
    }))
    .sort((a, b) => a.key.localeCompare(b.key, "tr-TR"));
}

export function formatFeatureFiltersForUrl(tokens: string[]) {
  return tokens
    .map((item) => parseFeatureFilterToken(item))
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map((item) => `${item.key}::${item.value}`);
}
