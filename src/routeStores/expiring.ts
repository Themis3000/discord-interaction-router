import { RouteStorage } from "../routeStorage";
import * as NodeCache from "node-cache";
import { Route } from "../route";

export class ExpiringRouteStore extends RouteStorage {
  private routes: NodeCache;

  constructor(maxAge = 1200) {
    super();
    this.routes = new NodeCache({stdTTL: maxAge, useClones: false});
  }

  public async storeRoute(route: Route): Promise<string> {
    this.routes.set(route.prefix, route);
    return route.prefix;
  }

  public async removeRoute(prefix: string): Promise<void> {
    this.routes.del(prefix);
  }

  public async getRoute(prefix: string): Promise<Route|undefined> {
    const route = this.routes.get<Route>(prefix);
    if (!route)
      return undefined;
    return route;
  }

  public async findRoute(prefix: string): Promise<Route|undefined> {
    for (const key of this.routes.keys()) {
      if (prefix.startsWith(key))
        return this.routes.get<Route>(key);
    }
    return undefined;
  }

  public async getMessageRoute(msgChannel: string): Promise<Route|undefined> {
    for (const key of this.routes.keys()) {
      const route = this.routes.get<Route>(key);
      if (route === undefined)
        continue;
      if (await route.usesMsgChannel(msgChannel))
        return route;
    }
    return undefined;
  }
}
