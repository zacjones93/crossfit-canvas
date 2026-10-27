// Plain module: cache tags shared by Open reads (unstable_cache) and actions (revalidateTag).

export function openEventTag({ eventId }: { eventId: string }): string {
  return `open:${eventId}`;
}
