import {
  assertEquals,
  assertObjectMatch,
} from "std/testing/asserts.ts";

Deno.env.set("mlsn.8194987a0482c5328ada333560c90699dee647e726e142a157824fbf074e0f1a", "test_key");

const { handler } = await import("./index.ts");

const basePayload = {
  clientName: "Maria Cliente",
  clientEmail: "maria@example.com",
  loanAmount: 10000,
  installmentValue: 500,
  dueDate: "2025-12-15",
  companyName: "Empresa de Teste",
  companyEmail: "contato@empresa.com",
} as const;

const createRequest = (payload = basePayload) =>
  new Request("http://localhost/send-loan-notification", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

const withMockedFetch = async (
  mockFetch: typeof fetch,
  fn: () => Promise<void>,
) => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = mockFetch;
    await fn();
  } finally {
    globalThis.fetch = originalFetch;
  }
};

Deno.test("returns 200 when MailerSend accepts the email", async () => {
  await withMockedFetch(
    () =>
      Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 202,
          headers: {
            "Content-Type": "application/json",
            "X-Message-Id": "mock-message-id",
          },
        }),
      ),
    async () => {
      const response = await handler(createRequest());
      assertEquals(response.status, 200);
      const body = await response.json();
      assertObjectMatch(body, {
        success: true,
        provider: "MailerSend",
        messageId: "mock-message-id",
        sentTo: basePayload.clientEmail,
      });
    },
  );
});

Deno.test("returns 401 when MailerSend responds with authentication error", async () => {
  await withMockedFetch(
    () =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    async () => {
      const response = await handler(createRequest());
      assertEquals(response.status, 401);
      const body = await response.json();
      assertObjectMatch(body, {
        error: "Erro de autenticação",
      });
    },
  );
});

Deno.test("returns 422 when MailerSend reports invalid data", async () => {
  const errorPayload = { message: "invalid data" };

  await withMockedFetch(
    () =>
      Promise.resolve(
        new Response(JSON.stringify(errorPayload), {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    async () => {
      const response = await handler(createRequest());
      assertEquals(response.status, 422);
      const body = await response.json();
      assertObjectMatch(body, {
        error: "Dados inválidos",
        details: errorPayload,
      });
    },
  );
});

Deno.test("returns 429 when MailerSend rate limits the request", async () => {
  await withMockedFetch(
    () =>
      Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    async () => {
      const response = await handler(createRequest());
      assertEquals(response.status, 429);
      const body = await response.json();
      assertObjectMatch(body, {
        error: "Limite de requisições excedido",
      });
    },
  );
});
