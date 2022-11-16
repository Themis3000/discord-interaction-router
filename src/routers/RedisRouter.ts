import { Client, CommandInteraction, Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import { Route } from "../route";
import { RedisRouteStore } from "../routeStores/redis";
import { Router } from "../router";
import { v4 as uuidv4 } from "uuid";

interface InteractionOption {
  interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
  client: Client
}

export class RedisRouter extends Router {
  private routes: RedisRouteStore = new RedisRouteStore();

  constructor(prefix = "", redisUrl?: string) {
    super(prefix);
    this.routes = new RedisRouteStore(redisUrl);
  }

  public async startRedis(): Promise<void> {
    await this.routes.startRedis();
  }

  public async addRoute(route: Route, useInteraction?: InteractionOption): Promise<string> {
    const prefix = `${this.prefix}_${uuidv4()}~~`;
    route.setPrefix(prefix);

    // Uses interaction before storing route if requested.
    if (useInteraction) {
      let doDestruct;
      if (useInteraction.interaction instanceof CommandInteraction) {
        doDestruct = await route.commandHandler(useInteraction.client, useInteraction.interaction);
      } else {
        doDestruct = await route.interaction(useInteraction.client, useInteraction.interaction);
      }
      if (doDestruct)
        return "";
    }

    return await this.routes.storeRoute(route);
  }

  public addRouteType(type: typeof Route): void {
    this.routes.addRouteType(type);
  }

  public async removeRoute(routeId: string): Promise<void> {
    await this.routes.removeRoute(routeId);
  }

  public async useInteractionRoute(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean> {
    if (!interaction.customId.startsWith(this.prefix))
      return false;

    const route = await this.routes.findRoute(interaction.customId);
    if (route === undefined) {
      await RedisRouter.expiredInteraction(interaction);
      return true;
    }
    await this.useBareInteractionRouteObj(route, client, interaction);
    return true;
  }

  public async useBareInteractionRoute(id: string, client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean> {
    const route = await this.routes.getRoute(id);
    if (route === undefined) {
      await RedisRouter.expiredInteraction(interaction);
      return true;
    }
    await this.useBareInteractionRouteObj(route, client, interaction);
    return true;
  }

  protected async useBareInteractionRouteObj(route: Route, client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<void> {
    const doDestruct = await route.interaction(client, interaction);
    if (doDestruct) {
      await this.removeRoute(route.prefix);
      return;
    }
    await this.routes.updateRoute(route);
  }

  public async useMsgRoute(client: Client, msg: Message): Promise<boolean> {
    const route = await this.routes.getMessageRoute(msg.channelId);
    if (route === undefined)
      return false;
    const doDestruct = await route.msg(client, msg);
    if (doDestruct) {
      await this.removeRoute(route.prefix);
      return true;
    }
    await this.routes.updateRoute(route);
    return true;
  }

  private static async expiredInteraction(interaction: MessageComponentInteraction | ModalSubmitInteraction) {
    await interaction.reply({ content: "Option expired", ephemeral: true });
  }
}
