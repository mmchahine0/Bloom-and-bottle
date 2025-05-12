import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();
class RedisClient {
  private static instance: RedisClient;
  private client: ReturnType<typeof createClient>;
  private readonly DEFAULT_EXPIRATION = 3600; // 1 hour in seconds

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });

    this.client.on("error", (error: unknown) => {
      console.error("Redis Client Error:", error);
    });

    this.client.on("connect", () => {
      console.log("Redis Client Connected");
    });

    this.connect();
  }

  private async connect() {
    await this.client.connect();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async set(
    key: string,
    value: any,
    expiration = this.DEFAULT_EXPIRATION
  ): Promise<void> {
    await this.client.set(key, JSON.stringify(value), {
      EX: expiration,
    });
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async clearCache(): Promise<void> {
    await this.client.flushAll();
  }

  public getPerfumeCacheKey = (query: any): string => {
    const keyParts = [
      query.type || "",
      query.brand || "",
      query.category || "",
      query.minPrice || "",
      query.maxPrice || "",
      query.available || "",
      query.sort || "",
      query.featured || "",
      query.limitedEdition || "",
      query.comingSoon || "",
      query.minRating || "",
      query.page || 1,
      query.limit || 12,
    ];

    return `perfumes:${keyParts.join(":")}`;
  };

  // Helper method to generate cache key for admin users table
  public generateAdminUsersCacheKey(page: number, limit: number): string {
    return `admin:users:${page}:${limit}`;
  }

  // Helper method to generate cache key for content
  public generateContentCacheKey(section?: string): string {
    return section ? `content:${section}` : "content:all";
  }
}

export default RedisClient.getInstance();
