import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { CartClient } from "@/ui/shop/cart-client";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);

  return (
    <>
      <CartClient
        locale={locale}
        labels={{
          title: dictionary.commerce.cartTitle,
          empty: dictionary.commerce.cartEmpty,
          quantity: dictionary.commerce.quantity,
          subtotal: dictionary.commerce.subtotal,
          discountTotal: dictionary.commerce.discountTotal,
          total: dictionary.commerce.total,
          promotionCode: dictionary.commerce.promotionCode,
          checkout: dictionary.commerce.checkout,
          continueShopping: dictionary.commerce.continueShopping,
          remove: dictionary.commerce.remove,
          stockWarning: dictionary.commerce.stockWarning,
          checkoutSuccess: dictionary.commerce.checkoutSuccess,
          checkoutFailed: dictionary.commerce.checkoutFailed,
        }}
      />
      <Footer locale={locale} dictionary={dictionary} />
    </>
  );
}
