// Stripe product and price mappings

export const STRIPE_PLANS = {
  gratis: {
    priceId: null,
    productId: null,
    credits: 3,
    name: "Grátis",
  },
  profissional: {
    priceId: "price_1ShfcZRz46kTowf6aFsUcaGs",
    productId: "prod_Tezbk3mu6lbHCw",
    credits: 80,
    name: "Profissional",
  },
  broker: {
    priceId: "price_1Shfe6Rz46kTowf6WRQswef7",
    productId: "prod_Tezd1Ml4hPet8V",
    credits: 500,
    name: "Broker",
  },
  imobiliaria: {
    priceId: "price_1ShfefRz46kTowf6qNp2zx0i",
    productId: "prod_TezdKh7hOVGdRB",
    credits: 1200,
    name: "Imobiliária",
  },
} as const;

export const STRIPE_CREDIT_PACKAGES = {
  starter: {
    priceId: "price_1Skyb4Rz46kTowf6bN5j0V3T",
    productId: "prod_TiPPFyyBQwL3hM",
    credits: 10,
    name: "Starter",
  },
  profissional: {
    priceId: "price_1SkybQRz46kTowf6Zk1S372B",
    productId: "prod_TiPQ3FV5aXiR4L",
    credits: 30,
    name: "Profissional",
  },
  empresarial: {
    priceId: "price_1SkybgRz46kTowf6VpbJ0CHq",
    productId: "prod_TiPQAXbNAP93Lo",
    credits: 100,
    name: "Empresarial",
  },
} as const;

// Helper to get plan key from product ID
export function getPlanKeyFromProductId(productId: string | null): keyof typeof STRIPE_PLANS | null {
  if (!productId) return null;
  
  for (const [key, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.productId === productId) {
      return key as keyof typeof STRIPE_PLANS;
    }
  }
  return null;
}

export type StripePlanKey = keyof typeof STRIPE_PLANS;
export type StripeCreditPackageKey = keyof typeof STRIPE_CREDIT_PACKAGES;
