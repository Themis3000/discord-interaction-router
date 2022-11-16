import { RouteStorage } from "../routeStorage";
import { Route } from "../route";

export class BasicRouteStore extends RouteStorage {
  private routes: Record<string, Route> = {};

  public async storeRoute(route: Route): Promise<string> {
    this.routes[route.prefix] = route;
    return route.prefix;
  }

  public async removeRoute(prefix: string): Promise<void> {
    delete this.routes[prefix];
  }

  public async getRoute(prefix: string): Promise<Route|undefined> {
    const route = this.routes[prefix];
    if (!route)
      return undefined;
    return route;
  }

  public async findRoute(prefix: string): Promise<Route|undefined> {
    for (const key of Object.keys(this.routes)) {
      if (prefix.startsWith(key))
        return this.routes[key];
    }
    return undefined;
  }

  public async getMessageRoute(msgChannel: string): Promise<Route|undefined> {
    for (const [, route] of Object.entries(this.routes)) {
      if (await route.usesMsgChannel(msgChannel))
        return route;
    }
    return undefined;
  }
}
