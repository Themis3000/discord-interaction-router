import { Route } from "../route";
import { RouteStorage } from "../routeStorage";
import { createClient, RedisClientType } from "redis";

interface Store {
  route: Route,
  type: string
}

interface JsonStore {
  route: unknown,
  type: string
}

/**
 * Stores a route in redis. This is great for sharding capabilities.
 * Do however note:
 *  - Routes fed in are serialized and stored as a json string. Any data stored in the route that isn't JSON serializable will come out "funky"
 *  - Any route type added must first be registered with addRouteType. Duplicate class names will cause issues.
 *  - The constructor is bypassed when deserialized. Any setup done in the constructor will not be run during the deserialization process.
 *  - All routes will have ~~ appended to the end. This is used to separate the id of the route from any data. Do not add a ~ to the custom id or remove it.
 *  - As of now, 1 message channel is limited to 1 associated route.
 */
export class RedisRouteStore extends RouteStorage {
  private routeTypes: Record<string, typeof Route> = {};
  private client: RedisClientType;

  constructor(redisUrl?: string) {
    super();
    if (redisUrl) {
      this.client = createClient({ url: redisUrl });
    } else {
      this.client = createClient();
    }
  }

  public async startRedis(): Promise<void> {
    this.client.on('error', (err: unknown) => console.log("Redis client error", err));
    await this.client.connect();
  }

  public addRouteType(routeType: typeof Route): void {
    this.routeTypes[routeType.name] = routeType;
  }

  public async storeRoute(route: Route, lifetime = 900): Promise<string> {
    if (!route.prefix.endsWith("~~"))
      route.setPrefix(route.prefix + "~~");
    const data: Store = {route: route, type: route.constructor.name};
    await this.client.setEx(`route_${route.prefix}`, lifetime, JSON.stringify(data));
    const msgChannel = await route.getMsgChannels();
    if (msgChannel.length > 0)
      await this.client.setEx(`msgPointer_${msgChannel[0]}`, lifetime, route.prefix);
    return route.prefix;
  }

  public async removeRoute(prefix: string): Promise<void> {
    await this.client.del(`route_${prefix}`);
  }

  public async getRoute(prefix: string): Promise<Route|undefined> {
    const json = await this.client.get(`route_${prefix}`);
    if (json === null)
      return undefined;
    const obj: JsonStore = JSON.parse(json);
    if (!(obj.type in this.routeTypes)) {
      throw new Error(`Route type ${obj.type} is not a registered route type.`);
    }
    const constructor = this.routeTypes[obj.type];
    return Object.assign(Object.create(constructor.prototype), obj.route);
  }

  public async findRoute(prefix: string): Promise<Route|undefined> {
    const id = prefix.split("~~")[0] + "~~";
    return this.getRoute(id);
  }

  public async getMessageRoute(msgChannel: string): Promise<Route|undefined> {
    const id = await this.client.get(`msgPointer_${msgChannel}`);
    if (id === null)
      return undefined;
    const route = await this.getRoute(id);
    // If route no longer exists, clean up dangling pointer
    if (route === undefined) {
      await this.client.del(`msgPointer_${msgChannel}`);
      return undefined;
    }
    return route;
  }

  public async updateRoute(route: Route, lifetime = 900): Promise<void> {
    await this.storeRoute(route, lifetime);
  }
}
