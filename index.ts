interface TerminalCommand {
  name: string;
  handler: (args: string[]) => string;
  description: string;
}

interface CommandResult {
  type: 'success' | 'error' | 'warning' | 'empty';
  content: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  reset(): void;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface SessionData {
  connected_at: string;
  message_count: number;
  ip: string;
}

interface ServerResponse {
  status: 'ok' | 'error';
  message?: string;
  data?: Record<string, unknown>;
  session_id?: string;
}

type AlignmentType = 'left' | 'right' | 'center';

interface ColumnFormatter {
  input: string[];
  justification: AlignmentType;
  delimiter: string;
  maxWidths: number[];
  formatText(): string;
}

interface WebSocketPayload {
  command: string;
  args: string[];
}

interface ProjectEntry {
  name: string;
  desc: string;
  stars: number;
}

interface BootMessage {
  text: string;
  delay: number;
  status: 'pending' | 'ok' | 'failed';
}

interface TerminalState {
  history: string[];
  historyIndex: number;
  isMatrixActive: boolean;
  connected: boolean;
  sessionId: string | null;
}

type CommandHandler = (args: string[], state: TerminalState) => Promise<string> | string;

interface CommandRegistry {
  register(name: string, handler: CommandHandler, description: string): void;
  execute(rawInput: string, state: TerminalState): Promise<CommandResult>;
  getCommands(): Array<{ name: string; description: string }>;
}

declare global {
  interface Window {
    TerminalState: TerminalState;
    activeSession: SessionData | null;
  }
}

export type {
  TerminalCommand,
  CommandResult,
  Particle,
  SessionData,
  ServerResponse,
  AlignmentType,
  ColumnFormatter,
  WebSocketPayload,
  ProjectEntry,
  BootMessage,
  TerminalState,
  CommandHandler,
  CommandRegistry,
};
