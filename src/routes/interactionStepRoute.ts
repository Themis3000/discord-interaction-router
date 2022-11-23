import { Client, CommandInteraction, Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import { Route } from "../route";

/**
 * The Interaction step router is a disposable object used for the control flow of a set of actions needed.
 * This will also persist data between actions.
 * This is useful for when you need multiple inputs from a user.
 */
export abstract class InteractionStepBase extends Route {
  protected data: record<string, any> = {};
  protected step = 0;
  protected stepsTotal = 0;
  protected branch = "default";

  abstract getInteractionSteps(): InteractionSteps;

  constructor() {
    super();
  }

  public getSteps(): Step[] {
    const stepBranches = this.getInteractionSteps().stepBranches;
    if (!(this.branch in stepBranches))
      return [];
    return this.getInteractionSteps().stepBranches[this.branch];
  }

  public getCommandHandler(): CommandHandler | undefined {
    return this.getInteractionSteps().commandHandler;
  }

  /** Use this to run the command handler defined in a interaction steps file. */
  async commandHandler(client: Client, interaction: CommandInteraction): Promise<void> {
    const commandHandler = this.getCommandHandler();
    if (commandHandler === undefined)
      return;
    const nextId = this.getThisId();
    const context = new CommandContext(client, interaction, this.data, nextId);
    await commandHandler(context);
  }

  async interaction(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction, stepNumOffset = 0): Promise<boolean | void> {
    const re = /_([0-9]{1,2})(?:_([0-9]))?$/;
    const regexMatch = re.exec(interaction.customId);
    const stepInteractedStr = regexMatch?.[1];
    const optionSelectedStr = regexMatch?.[2];
    // First likely won't be labeled as step 0, so unlabeled is inferred as 0.
    const stepInteracted = (stepInteractedStr ? parseInt(stepInteractedStr) : 0) + stepNumOffset;
    const optionSelected = optionSelectedStr ? parseInt(optionSelectedStr) : undefined;
    // Incorrect step was interacted with.
    if (stepInteracted !== this.stepsTotal) {
      console.log(stepInteracted, this.stepsTotal);
      await this.interactionExpired(client, interaction);
      return;
    }
    const nextId = this.getNextId();
    const context = new StepContext(client, interaction, this.data, nextId, optionSelected);
    const stepResult = await this.getSteps()[this.step](context);
    const instructions = await this.processStepResult(stepResult);
    if (instructions.destroy)
      return true;
    if (instructions.runNext) {
      await this.interaction(client, interaction, 1);
    }
  }

  /** Gets the interaction id for the next step */
  getNextId(): string {
    return `${this.prefix}_${this.stepsTotal+1}`
  }

  /** Gets the interaction id for the current step */
  getThisId(): string {
    return `${this.prefix}_${this.stepsTotal}`
  }

  public async msg(client: Client, msg: Message): Promise<boolean | void> {
    const nextId = this.getNextId();
    const context = new StepContext(client, msg, this.data, nextId);
    const stepResult = await this.getSteps()[this.step](context);
    const instructions = await this.processStepResult(stepResult);
    if (instructions.destroy)
      return true;
    if (instructions.runNext)
      await this.msg(client, msg);
  }

  private async processStepResult(result: StepResult): Promise<{ destroy: boolean, runNext: boolean }> {
    if (result.setMsgChannel !== undefined) {
      this.clearMsgChannels();
      this.addMsgChannel(result.setMsgChannel);
    }
    if (!result.success)
      return {destroy: false, runNext: false};
    this.step += 1;
    this.stepsTotal += 1;
    if (result.setBranch !== undefined) {
      this.step = 0;
      this.branch = result.setBranch;
    }
    if (this.step >= this.getSteps().length) {
      return {destroy: true, runNext: false};
    }
    if (result.passToNext) {
      return {destroy: false, runNext: true};
    }
    return {destroy: false, runNext: false};
  }

  async interactionExpired(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction): Promise<void> {
    await interaction.reply({ content: "Option expired", ephemeral: true });
  }
}

export function createRouteCls(name: string, interactionSteps: InteractionSteps): new () => InteractionStepBase {
  return ({[name] : class extends InteractionStepBase {
      getInteractionSteps(): InteractionSteps {
        return interactionSteps;
      }
    }})[name];
}

export type Step = (context: StepContext) => Promise<StepResult>;
export type CommandHandler = (context: CommandContext) => Promise<StepResult>;

export interface InteractionSteps {
  commandHandler?: CommandHandler,
  stepBranches: {
    [key: string]: Step[],
    default: Step[]
  }
}

abstract class BaseContext {
  public readonly client: Client;
  public readonly data: record<string, any>;
  public readonly nextId: string;
  public readonly interaction: unknown;

  protected constructor(client: Client, data: record<string, any>, nextId: string) {
    this.client = client;
    this.data = data;
    this.nextId = nextId;
  }

  /**
   * Returns the next id with a persisting piece of data (the option number) attached to it. The next step can check
   * the passed option number with context.optionSelected. This is useful for getting which button was pressed in the
   * event where there's multiple buttons.
   *
   * @param option Option number to pass (must be 0-9)
   */
  public getNextIdWithOption(option: number): string {
    if (!(option >= 0 && 9 >= option))
      throw new RangeError(`${option} out of range 0-9. This method only supports single digit positive integers`);
    return `${this.nextId}_${option}`;
  }
}

export class StepContext extends BaseContext {
  public readonly interaction: MessageComponentInteraction | ModalSubmitInteraction | Message;
  public readonly optionSelected?: number

  constructor(client: Client, interaction: MessageComponentInteraction | ModalSubmitInteraction | Message, data: record<string, any>, nextId: string, optionSelected?: number) {
    super(client, data, nextId);
    this.interaction = interaction;
    this.optionSelected = optionSelected;
  }
}

export class CommandContext extends BaseContext {
  public readonly interaction: CommandInteraction;

  constructor(client: Client, interaction: CommandInteraction, data: record<string, any>, nextId: string) {
    super(client, data, nextId);
    this.interaction = interaction
  }
}

export interface StepResult {
  /** Communicates if the step has been completed successfully. If success is false, it will not advance the step. If it's true, it will. */
  success: boolean,
  /** If true, skips the rest of the current step and passes the interaction value to the next instead. */
  passToNext?: boolean,
  /** Sets the message channel the router is listening for messages from. */
  setMsgChannel?: string
  /** Sets the current branch. */
  setBranch?: string
}
