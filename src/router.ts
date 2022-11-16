import { Route } from "./route";
import { Client, Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

export abstract class Router {
  public prefix: string;

  constructor(prefix = "") {
    this.prefix = prefix;
  }

  public setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /**
   * Adds a route to the router. The router may choose to override the route's specified customId.
   * @returns Returns a string containing the set customId of the route.
   */
  public abstract addRoute(route: Route): Promise<string>

  /**
   * Uses route if route exists for interaction
   * @returns Returns a boolean stating if an endpoint was reached/a reply was made
   */
  public abstract useInteractionRoute(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean>

  /**
   * Uses interaction route by exact id instead of searching by prefix.
   * @returns Returns a boolean stating if an endpoint was reached/a reply was made
   */
  public abstract useBareInteractionRoute(id: string, client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean>

  /**
   * Uses route object instead of internally fetching route
   */
  protected async useBareInteractionRouteObj(route: Route, client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<void> {
    const doDestruct = await route.interaction(client, interaction);
    if (doDestruct) {
      await this.removeRoute(route.prefix);
    }
  }

  /**
   * Removes route
   */
  public abstract removeRoute(routeId: string): Promise<void>

  /**
   * Uses route if route exists for message
   * @returns Returns a boolean stating if an endpoint was reached/a reply was made
   */
  public abstract useMsgRoute(client: Client, msg: Message): Promise<boolean>
}
