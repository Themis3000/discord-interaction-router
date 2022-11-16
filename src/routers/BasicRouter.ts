import { Router } from "../router";
import { Route } from "../route";
import { Client, Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import { BasicRouteStore } from "../routeStores/basic";

export class BasicRouter extends Router {
  private routes: BasicRouteStore = new BasicRouteStore();

  public async addRoute(route: Route): Promise<string> {
    const prefix = `${this.prefix}${route.prefix}`;
    route.setPrefix(prefix);
    return await this.routes.storeRoute(route);
  }

  public async useBareInteractionRoute(id: string, client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean> {
    const route = await this.routes.getRoute(id);
    if (route === undefined)
      return false;
    await route.interaction(client, interaction);
    return true;
  }

  public async useInteractionRoute(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean> {
    if (!interaction.customId.startsWith(this.prefix))
      return false;
    const route = await this.routes.findRoute(interaction.customId);
    if (route === undefined)
      return false;
    await this.useBareInteractionRouteObj(route, client, interaction);
    return true;
  }

  public async removeRoute(routeId: string): Promise<void> {
    await this.routes.removeRoute(routeId);
  }

  public async useMsgRoute(client: Client, msg: Message): Promise<boolean> {
    const route = await this.routes.getMessageRoute(msg.channelId);
    if (route === undefined)
      return false;
    await route.msg(client, msg);
    return true;
  }
}
