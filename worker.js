/* Skynet UI Worker — serves the static site and an experimental MCP server.
 *
 * MCP endpoint: POST https://skynetui.com/mcp  (streamable-HTTP, stateless,
 * JSON responses). Tools let AI agents pull the framework reference and
 * example pages directly:
 *   - get_reference: the full llms-full.txt (components, themes, utilities,
 *     Tailwind conversion guide)
 *   - get_example: a complete example page (dashboard | chat | auth)
 * Add to Claude Code with:  claude mcp add --transport http skynet-ui https://skynetui.com/mcp
 */

const PROTOCOL_VERSION = "2025-03-26";
const SERVER_INFO = { name: "skynet-ui", version: "3.1.0" };

const TOOLS = [
  {
    name: "get_reference",
    description:
      "Get the complete Skynet UI reference (llms-full.txt): every component, all 9 themes, " +
      "the utility classes including the Tailwind-compat layer, the JS API, and the " +
      "Tailwind-to-Skynet conversion guide. Read this before writing Skynet UI markup.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "search_reference",
    description:
      "Search the Skynet UI reference by keyword and get only the matching sections " +
      "(component docs, utility groups, conversion rules). Cheaper than get_reference " +
      "when you need one component or topic.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords, e.g. 'modal', 'chat', 'tailwind convert'" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_theme_css",
    description:
      "Get the CSS variable block for one built-in theme (dark, light, midnight, paper, " +
      "forest, dusk, sky, rose, contrast) — useful as a starting point for a custom theme.",
    inputSchema: {
      type: "object",
      properties: {
        theme: {
          type: "string",
          enum: ["dark", "light", "midnight", "paper", "forest", "dusk", "sky", "rose", "contrast"],
        },
      },
      required: ["theme"],
    },
  },
  {
    name: "get_example",
    description:
      "Get a complete, working example page built with Skynet UI as HTML. " +
      "Useful as a few-shot reference for building similar pages.",
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "string",
          enum: ["dashboard", "chat", "auth"],
          description: "Which example page to fetch",
        },
      },
      required: ["page"],
    },
  },
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function rpcResult(id, result) {
  return json({ jsonrpc: "2.0", id, result });
}

function rpcError(id, code, message) {
  return json({ jsonrpc: "2.0", id: id === undefined ? null : id, error: { code, message } });
}

async function readAsset(env, origin, path) {
  const res = await env.ASSETS.fetch(new Request(origin + path));
  if (!res.ok) throw new Error("asset not found: " + path);
  return res.text();
}

async function handleMcp(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method === "GET") {
    return json(
      {
        name: SERVER_INFO.name,
        description: "Skynet UI MCP server. POST JSON-RPC here (streamable HTTP transport).",
        docs: "https://skynetui.com/llms.txt",
      },
      200
    );
  }
  if (request.method !== "POST") return rpcError(null, -32600, "POST required");

  let msg;
  try {
    msg = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  if (Array.isArray(msg)) return rpcError(null, -32600, "Batch requests not supported");

  const { id, method, params } = msg || {};

  // Notifications get an empty 202
  if (id === undefined && typeof method === "string") {
    return new Response(null, { status: 202, headers: CORS });
  }

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {}, resources: {} },
        serverInfo: SERVER_INFO,
      });

    case "ping":
      return rpcResult(id, {});

    case "tools/list":
      return rpcResult(id, { tools: TOOLS });

    case "resources/list":
      return rpcResult(id, {
        resources: [
          { uri: "skynetui://llms-full.txt", name: "Skynet UI full reference", mimeType: "text/plain",
            description: "The complete framework reference (components, themes, utilities, conversion guide)" },
          { uri: "skynetui://examples/dashboard", name: "Example: ops dashboard", mimeType: "text/html" },
          { uri: "skynetui://examples/chat", name: "Example: AI chat", mimeType: "text/html" },
          { uri: "skynetui://examples/auth", name: "Example: auth page", mimeType: "text/html" },
        ],
      });

    case "resources/read": {
      const uri = params && params.uri;
      const origin2 = new URL(request.url).origin;
      try {
        let path = null, mime = "text/plain";
        if (uri === "skynetui://llms-full.txt") path = "/llms-full.txt";
        if (uri === "skynetui://llms.txt") path = "/llms.txt";
        const exm = /^skynetui:\/\/examples\/(dashboard|chat|auth)$/.exec(uri || "");
        if (exm) { path = "/examples/" + exm[1] + ".html"; mime = "text/html"; }
        if (!path) return rpcError(id, -32602, "Unknown resource: " + uri);
        const text = await readAsset(env, origin2, path);
        return rpcResult(id, { contents: [{ uri, mimeType: mime, text }] });
      } catch (err) {
        return rpcError(id, -32603, "Read failed: " + err.message);
      }
    }

    case "tools/call": {
      const origin = new URL(request.url).origin;
      const toolName = params && params.name;
      const args = (params && params.arguments) || {};
      try {
        if (toolName === "get_reference") {
          const text = await readAsset(env, origin, "/llms-full.txt");
          return rpcResult(id, { content: [{ type: "text", text }] });
        }
        if (toolName === "search_reference") {
          const ref = await readAsset(env, origin, "/llms-full.txt");
          const terms = String(args.query || "").toLowerCase().split(/\s+/).filter(Boolean);
          if (!terms.length) {
            return rpcResult(id, { content: [{ type: "text", text: "Provide a query." }], isError: true });
          }
          /* split on ## / ### headings, score sections by term hits */
          const sections = ref.split(/\n(?=##+ )/);
          const scored = sections
            .map((sec) => {
              const low = sec.toLowerCase();
              let score = 0;
              for (const t of terms) {
                const first = low.split("\n", 1)[0];
                if (first.includes(t)) score += 5;
                score += low.split(t).length - 1;
              }
              return { sec, score };
            })
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);
          const text = scored.length
            ? scored.map((x) => x.sec.trim()).join("\n\n---\n\n")
            : "No sections matched. Try get_reference for the full document.";
          return rpcResult(id, { content: [{ type: "text", text }] });
        }
        if (toolName === "get_theme_css") {
          const css = await readAsset(env, origin, "/skynet-ui.css");
          let text;
          if (args.theme === "dark") {
            const m = /:root \{[\s\S]*?\n\}/.exec(css);
            text = m ? m[0] : "not found";
          } else {
            const re = new RegExp('\\[data-theme="' + args.theme + '"\\] \\{[\\s\\S]*?\\n\\}');
            const m = re.exec(css);
            text = m ? m[0] : "Theme not found: " + args.theme;
          }
          return rpcResult(id, { content: [{ type: "text", text }] });
        }
        if (toolName === "get_example") {
          const pages = ["dashboard", "chat", "auth"];
          if (!pages.includes(args.page)) {
            return rpcResult(id, {
              content: [{ type: "text", text: "Unknown page. Available: " + pages.join(", ") }],
              isError: true,
            });
          }
          const text = await readAsset(env, origin, "/examples/" + args.page + ".html");
          return rpcResult(id, { content: [{ type: "text", text }] });
        }
        return rpcError(id, -32602, "Unknown tool: " + toolName);
      } catch (err) {
        return rpcResult(id, {
          content: [{ type: "text", text: "Error: " + err.message }],
          isError: true,
        });
      }
    }

    default:
      return rpcError(id, -32601, "Method not found: " + method);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") return handleMcp(request, env);
    return env.ASSETS.fetch(request);
  },
};
