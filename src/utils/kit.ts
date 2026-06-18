// Kit (formerly ConvertKit) API v4 client.
// Auth is the `X-Kit-Api-Key` header. The key comes from the Cloudflare env
// binding (locals.runtime.env.KIT_API_KEY) — never process.env, never the repo.
const KIT_API = 'https://api.kit.com/v4';

async function kitFetch(path: string, key: string, options: RequestInit = {}) {
  return fetch(`${KIT_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': key,
      ...(options.headers ?? {}),
    },
  });
}

// Kit v4 applies tags by ID, but the rest of the app refers to them by name.
// Resolve name -> id at runtime so no IDs need to be hardcoded. Any tag name
// that doesn't exist in the account yet is simply absent from the map (skipped).
async function fetchTagMap(key: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const res = await kitFetch('/tags', key);
    if (!res.ok) {
      console.error(`[KIT] Failed to fetch tags (${res.status}):`, await res.text());
      return map;
    }
    const data = (await res.json()) as { tags: { id: number; name: string }[] };
    for (const tag of data.tags) {
      map.set(tag.name, tag.id);
    }
    console.log(`[KIT] Loaded ${map.size} tags from account`);
  } catch (err) {
    console.error('[KIT] Error fetching tag list:', err);
  }
  return map;
}

/**
 * Upsert a subscriber and apply the given tags (by name).
 *
 * Never throws on a Kit-side problem — returns { success: false } instead — so
 * callers can treat the whole thing as best-effort and always show the report.
 * With no apiKey (e.g. local dev without the binding set) it no-ops as a stub.
 */
export interface SubscriberOptions {
  firstName?: string;
  fields?: Record<string, string>;
}

export async function addSubscriberToKit(
  email: string,
  tags: string[],
  apiKey?: string,
  opts?: SubscriberOptions,
): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) {
    console.log(`[STUB] Would add ${email} to Kit with tags: ${tags.join(', ')}`);
    return { success: true };
  }

  const key = apiKey;
  console.log(`[KIT] Adding ${email}, tags: ${tags.join(', ')}`);

  // Step 1: create/update subscriber (POST /v4/subscribers is an upsert).
  let subscriberEmail: string;
  const payload: Record<string, unknown> = { email_address: email };
  if (opts?.firstName) payload.first_name = opts.firstName;
  if (opts?.fields && Object.keys(opts.fields).length > 0) payload.fields = opts.fields;
  try {
    let res = await kitFetch('/subscribers', key, { method: 'POST', body: JSON.stringify(payload) });

    // Custom fields must already exist in the account or Kit rejects the call.
    // If that happens, retry without fields so the lead + tags still land.
    if (!res.ok && payload.fields) {
      console.error(`[KIT] Subscriber create with fields failed (${res.status}); retrying without custom fields`);
      delete payload.fields;
      res = await kitFetch('/subscribers', key, { method: 'POST', body: JSON.stringify(payload) });
    }

    const body = await res.text();
    if (!res.ok) {
      console.error(`[KIT] Subscriber creation failed (${res.status}):`, body);
      return { success: false, error: `Kit subscriber error: ${res.status}` };
    }
    const data = JSON.parse(body) as { subscriber: { id: number; email_address: string } };
    subscriberEmail = data.subscriber.email_address;
    console.log(`[KIT] Subscriber created/updated: id=${data.subscriber.id} email=${subscriberEmail}`);
  } catch (err) {
    console.error('[KIT] Subscriber creation threw:', err);
    return { success: false, error: 'Failed to create Kit subscriber' };
  }

  if (tags.length === 0) return { success: true };

  // Step 2: resolve tag names -> ids
  const tagMap = await fetchTagMap(key);

  // Step 3: apply each tag (POST /v4/tags/{id}/subscribers). Missing tags are
  // skipped, and any single tag failure is logged but does not fail the upsert.
  await Promise.all(
    tags.map(async (tagName) => {
      const tagId = tagMap.get(tagName);
      if (!tagId) {
        console.log(`[KIT] Tag not found in account, skipping: "${tagName}"`);
        return;
      }
      try {
        const res = await kitFetch(`/tags/${tagId}/subscribers`, key, {
          method: 'POST',
          body: JSON.stringify({ email_address: subscriberEmail }),
        });
        const body = await res.text();
        if (!res.ok) {
          console.error(`[KIT] Tag "${tagName}" (${tagId}) failed (${res.status}):`, body);
        } else {
          console.log(`[KIT] Tag "${tagName}" applied successfully`);
        }
      } catch (err) {
        console.error(`[KIT] Tag "${tagName}" threw:`, err);
      }
    }),
  );

  return { success: true };
}
