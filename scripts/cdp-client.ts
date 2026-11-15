import http from "http";

export interface CDPMessage {
  id: number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

export class CDPClient {
  private ws: WebSocket;
  private messageId = 0;
  private callbacks = new Map<number, (res: any) => void>();

  private constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data.toString()) as any;
        if (msg.method === "Runtime.exceptionThrown") {
          console.error("BROWSER UNCAUGHT EXCEPTION:", JSON.stringify(msg.params, null, 2));
        }
        if (msg.method === "Runtime.consoleAPICalled" && msg.params?.type === "error") {
          console.error("BROWSER CONSOLE ERROR:", msg.params.args?.map((a: any) => a.value || a.description).join(" "));
        }
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id)!;
          this.callbacks.delete(msg.id);
          cb(msg.result || msg.error);
        }
      } catch (err) {
        console.error("Error parsing CDP message:", err);
      }
    };
  }

  static async connect(port = 9222): Promise<CDPClient> {
    const list = await new Promise<any[]>((resolve, reject) => {
      http
        .get(`http://localhost:${port}/json/list`, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(JSON.parse(data)));
        })
        .on("error", reject);
    });

    const page = list.find((t) => t.type === "page") || list[0];
    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error("No CDP page available to connect");
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    return new CDPClient(ws);
  }

  async send(method: string, params: any = {}): Promise<any> {
    const id = ++this.messageId;
    return new Promise((resolve) => {
      this.callbacks.set(id, resolve);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression: string): Promise<any> {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res?.exceptionDetails) {
      console.error("CDP Eval Exception:", res.exceptionDetails);
    }
    return res?.result?.value;
  }

  async setViewport(width: number, height: number, deviceScaleFactor = 1.0) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor,
      mobile: false,
    });
  }

  async screenshot(): Promise<Buffer> {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    return Buffer.from(res.data, "base64");
  }

  close() {
    this.ws.close();
  }
}

