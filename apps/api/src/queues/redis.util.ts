export function redisConnectionFromUrl(redisUrl?: string) {
  const raw = (redisUrl || 'redis://127.0.0.1:6379').trim();
  const url = new URL(raw);
  return {
    host: url.hostname || '127.0.0.1',
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    maxRetriesPerRequest: null as null,
  };
}
