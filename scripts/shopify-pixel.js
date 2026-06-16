function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
}

const BASE_URL = "https://campaign.focasedu.in";

async function sendShopifyEvent(path, eventType, event) {
  await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trackingId: getCookie("wati_phone"),
      phone: getCookie("wati_phone"),
      name: getCookie("wati_name"),
      eventType,
      data: event.data,
      pageUrl: event.context?.document?.location?.href,
      createdAt: new Date().toISOString()
    })
  });
}

analytics.subscribe("product_viewed", (event) => {
  sendShopifyEvent("/shopify-events/product-viewed", "product_viewed", event);
});

analytics.subscribe("product_added_to_cart", (event) => {
  sendShopifyEvent("/shopify-events/product-added-to-cart", "product_added_to_cart", event);
});

analytics.subscribe("product_removed_from_cart", (event) => {
  sendShopifyEvent("/shopify-events/product-removed-from-cart", "product_removed_from_cart", event);
});

analytics.subscribe("checkout_started", (event) => {
  sendShopifyEvent("/shopify-events/checkout-started", "checkout_started", event);
});

analytics.subscribe("checkout_completed", (event) => {
  sendShopifyEvent("/shopify-events/checkout-completed", "checkout_completed", event);
});
