import { Route } from "../route";
import { Client, Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

type InteractionCallback = (client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction) => void;
export type MessageCallback = (client: Client, msg: Message) => void;

export class CallbackRoute extends Route {
  protected readonly interactionCallback: InteractionCallback;
  private readonly messageCallback: MessageCallback;

  constructor(id: string, interactionCallback: InteractionCallback = () => undefined, messageCallback: MessageCallback = () => undefined) {
    super(id);
    this.interactionCallback = interactionCallback;
    this.messageCallback = messageCallback;
  }

  public async interaction(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean | void> {
    this.interactionCallback(client, interaction);
  }

  public async msg(client: Client, msg: Message): Promise<boolean | void> {
    this.messageCallback(client, msg);
  }
}
