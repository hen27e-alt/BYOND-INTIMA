// A drop-in stand-in for `GoogleGenAI` from '@google/genai' that never holds a key.
// Every call goes to our own server (/api/ai/generate), which keeps the Gemini key
// as a secret and checks that the caller is signed in.
// Enums (Type, Modality...) are plain values and safe to re-export.
import { auth } from '../firebase';

export { Type, Modality } from '@google/genai';
export type { LiveServerMessage } from '@google/genai';

type Part = { text?: string; inlineData?: { mimeType: string; data: string } } & Record<string, unknown>;
type Content = { role?: string; parts: Part[] };
type GenerateParams = { model: string; contents: unknown; config?: Record<string, unknown> };

export class AiUnavailableError extends Error {}

const textOf = (candidates: any[] | undefined) =>
  (candidates?.[0]?.content?.parts ?? [])
    .map((p: Part) => p.text ?? '')
    .join('');

class Response {
  constructor(public candidates: any[] = [], private _text?: string) {}
  get text() {
    return this._text ?? textOf(this.candidates);
  }
}

const call = async (params: GenerateParams): Promise<Response> => {
  const user = auth.currentUser;
  if (!user) throw new AiUnavailableError('צריך להתחבר כדי להשתמש בכלי ה־AI.');
  const token = await user.getIdToken();
  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiUnavailableError(data.error || 'כלי ה־AI לא זמין כרגע. נסו שוב בעוד רגע.');
  return new Response(data.candidates, data.text);
};

const unsupported = (what: string) => async (..._args: any[]): Promise<any> => {
  throw new AiUnavailableError(`${what} לא זמין כרגע באתר.`);
};

const toContents = (history: Content[], message: string | Part[]) => [
  ...history,
  { role: 'user', parts: typeof message === 'string' ? [{ text: message }] : message },
];

export class GoogleGenAI {
  // The key argument is accepted and ignored, so existing call sites keep compiling.
  constructor(_opts?: { apiKey?: string }) {}

  models = {
    generateContent: (params: GenerateParams) => call(params),
    generateVideos: unsupported('יצירת וידאו'),
    generateImages: unsupported('יצירת תמונות'),
  };

  chats = {
    create: ({ model, config, history = [] }: { model: string; config?: Record<string, unknown>; history?: Content[] }) => {
      const turns: Content[] = [...history];
      return {
        sendMessage: async ({ message }: { message: string | Part[] }) => {
          const contents = toContents(turns, message);
          const res = await call({ model, contents, config });
          turns.splice(0, turns.length, ...(contents as Content[]), { role: 'model', parts: [{ text: res.text }] });
          return res;
        },
      };
    },
  };

  live = { connect: unsupported('שיחה קולית חיה') };
  operations = { getVideosOperation: unsupported('יצירת וידאו') };
}
