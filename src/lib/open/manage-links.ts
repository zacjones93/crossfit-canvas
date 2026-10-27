// Plain module: URLs into the coach workspace (shared by the workspace's sign-in redirect and public pages).

export function manageHref(slug: string): string {
  return `/open/${slug}/manage`;
}

/** Sign-in page that returns to the event's coach workspace. */
export function manageSignInHref(slug: string): string {
  return `/sign-in?redirect=${encodeURIComponent(manageHref(slug))}`;
}
