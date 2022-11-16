import { Route } from "./route";

export abstract class RouteStorage {
  public abstract storeRoute(route: Route): Promise<string>
  public abstract removeRoute(prefix: string): Promise<void>
  public abstract getRoute(prefix: string): Promise<Route|undefined>
  public abstract findRoute(prefix: string): Promise<Route|undefined>
  public abstract getMessageRoute(msgChannel: string): Promise<Route|undefined>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async updateRoute(route: Route): Promise<void> {return;}
}
