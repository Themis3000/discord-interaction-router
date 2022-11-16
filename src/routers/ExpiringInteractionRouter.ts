import { v4 as uuidv4 } from "uuid";
import { Client, Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import { Route } from "../route";
import { Router } from "../router";
import { ExpiringRouteStore } from "../routeStores/expiring";

/**
 * An interaction router with temporary routes that expire after a certain amount of time.
 * Good for making temporary MessageComponentInteraction listeners.
 */
export class ExpiringInteractionRouter extends Router {
  private routes: ExpiringRouteStore = new ExpiringRouteStore();

  public async addRoute(route: Route): Promise<string> {
    const prefix = `${this.prefix}_${uuidv4()}`;
    route.setPrefix(prefix);
    return await this.routes.storeRoute(route);
  }

  /**
   * Uses route if route exists
   * @returns Returns a boolean stating if an endpoint was reached/a reply was made
   */
  public async useInteractionRoute(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean> {
    if (!interaction.customId.startsWith(this.prefix)) {
      return false;
    }

    const route = await this.routes.findRoute(interaction.customId);
    if (route === undefined) {
      await ExpiringInteractionRouter.expiredInteraction(interaction);
      return true;
    }
    await this.useBareInteractionRouteObj(route, client, interaction);
    return true;
  }

  public async useBareInteractionRoute(id: string, client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean> {
    const route = await this.routes.getRoute(id);
    if (route === undefined) {
      await ExpiringInteractionRouter.expiredInteraction(interaction);
      return false;
    }
    await this.useBareInteractionRouteObj(route, client, interaction);
    return true;
  }

  public async useMsgRoute(client: Client, msg: Message): Promise<boolean> {
    if (msg.author.bot) {
      return false;
    }

    const route = await this.routes.getMessageRoute(msg.channelId);
    if (route === undefined) {
      return false;
    }
    const doDestruct = await route.msg(client, msg);
    if (doDestruct)
      await this.removeRoute(route.prefix);
    return true;
  }

  public async removeRoute(routeId: string): Promise<void> {
    await this.routes.removeRoute(routeId);
  }

  private static async expiredInteraction(interaction: MessageComponentInteraction | ModalSubmitInteraction) {
    await interaction.reply({ content: "Option expired", ephemeral: true });
  }
}
