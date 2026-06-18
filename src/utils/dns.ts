// DNS lookups MUST use DNS-over-HTTPS — the Node `dns` module does not exist on
// the Cloudflare Workers runtime. See CLAUDE.md critical constraint #1.
export interface DNSRecord {
  name: string;
  type: string;
  data: string;
}

export async function queryDNS(domain: string, recordType: string = 'TXT'): Promise<DNSRecord[]> {
  try {
    const url = new URL('https://cloudflare-dns.com/dns-query');
    url.searchParams.set('name', domain);
    url.searchParams.set('type', recordType);

    const response = await fetch(url.toString(), {
      headers: {
        accept: 'application/dns-json',
      },
    });

    if (!response.ok) {
      console.error(`DNS query failed for ${domain} (${recordType}): ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Extract Answer section
    if (!data.Answer || !Array.isArray(data.Answer)) {
      return [];
    }

    return data.Answer.map((record: any) => ({
      name: record.name,
      type: record.type,
      data: typeof record.data === 'string' ? record.data.replace(/^"|"$/g, '') : record.data,
    }));
  } catch (error) {
    console.error(`DNS query error for ${domain} (${recordType}):`, error);
    return [];
  }
}

export function filterRecordsByType(records: DNSRecord[], type: string): string[] {
  return records
    .filter((r) => r.type === 1 && r.data) // type 1 = TXT in DNS-JSON format
    .map((r) => r.data);
}
