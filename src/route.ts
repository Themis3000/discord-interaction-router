import { Client, CommandInteraction, Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

/**
 * Base route class. If you'd like to create a new route type, it's probably a good idea to start by extending this class.
 */
export abstract class Route {
  public prefix: string;
  protected msgChannels: string[] = [];

  protected constructor(prefix = "") {
    this.prefix = prefix;
  }

  /**
   * Called by the router to set the prefix of the route during the registration process. The route should not attempt
   * to set its own prefix, this should only be handled by the router or during initialization before being added to a router
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /** Called by the router to handle an incoming interaction. */
  public async interaction(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<boolean | void> {
    await interaction.reply({content: "Not implemented."});
    return false;
  }

  /** Called by the router to handle an incoming message. */
  public async msg(client: Client, msg: Message): Promise<boolean | void> {
    await msg.reply({content: "Not implemented."});
    return false;
  }

  public addMsgChannel(msgChannel: string): void {
    this.msgChannels.push(msgChannel);
  }

  public removeMsgChannel(msgChannel: string): void {
    this.msgChannels = this.msgChannels.filter(item => item !== msgChannel);
  }

  public clearMsgChannels(): void {
    this.msgChannels = [];
  }

  public async usesMsgChannel(msgChannel: string): Promise<boolean> {
    return this.msgChannels.includes(msgChannel);
  }

  public async getMsgChannels(): Promise<string[]> {
    return this.msgChannels;
  }

  public async commandHandler(client: Client, interaction: CommandInteraction): Promise<boolean | void> {
    await interaction.reply({content: "Not implemented."});
    return false;
  }
}
