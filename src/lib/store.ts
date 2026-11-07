import "server-only";

/**
 * Whether customers can sign up, fill a cart and place orders. Off unless STORE_OPEN is "true",
 * so a new deployment stays admin-only until the shop is ready to launch.
 */
export function storeOpen() {
  return process.env.STORE_OPEN === "true";
}
