import { serve } from "std/http/server.ts";

const mailersendApiKey = Deno.env.get("MAILERSEND_API_KEY");
if (!mailersendApiKey) {
  console.error("[ERRO] MAILERSEND_API_KEY não está configurada nas variáveis de ambiente");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface LoanNotificationRequest {
  clientName: string;
  clientEmail: string;
  loanAmount: number;
  installmentValue: number;
  dueDate: string;
  companyName: string;
  companyEmail: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (dateValue: string): boolean => {
  if (!DATE_REGEX.test(dateValue)) {
    return false;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
};

export const handler = async (req: Request): Promise<Response> => {
  console.log(`[INFO] Função send-loan-notification chamada - Método: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido. Use POST." }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }

  if (!mailersendApiKey) {
    return new Response(
      JSON.stringify({
        error: "Serviço de email não configurado. Entre em contato com o administrador.",
        details: "MAILERSEND_API_KEY não está configurada nas variáveis de ambiente",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }

  try {
    const requestBody = await req.json();

    if (!requestBody || typeof requestBody !== "object") {
      return new Response(
        JSON.stringify({ error: "Payload inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const {
      clientName,
      clientEmail,
      loanAmount,
      installmentValue,
      dueDate,
      companyName,
      companyEmail,
    }: LoanNotificationRequest = requestBody;

    console.log("[INFO] Dados recebidos:", {
      clientName,
      clientEmail,
      hasLoanAmount: typeof loanAmount === "number",
      hasInstallmentValue: typeof installmentValue === "number",
      dueDate,
      companyName,
      companyEmail,
    });

    const requiredFields = {
      clientName,
      clientEmail,
      loanAmount,
      installmentValue,
      dueDate,
      companyName,
      companyEmail,
    } as const;

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Campos obrigatórios ausentes",
          missingFields,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (!EMAIL_REGEX.test(clientEmail)) {
      return new Response(
        JSON.stringify({ error: "Formato de email do cliente inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (!EMAIL_REGEX.test(companyEmail)) {
      return new Response(
        JSON.stringify({ error: "Formato de email da empresa inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (typeof loanAmount !== "number" || loanAmount <= 0) {
      return new Response(
        JSON.stringify({ error: "Valor do empréstimo deve ser um número maior que zero" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (typeof installmentValue !== "number" || installmentValue <= 0) {
      return new Response(
        JSON.stringify({ error: "Valor da parcela deve ser um número maior que zero" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (!isValidDate(dueDate)) {
      return new Response(
        JSON.stringify({ error: "Formato de data inválido. Use o formato YYYY-MM-DD" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const formatCurrency = (value: number): string =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);

    const formatDate = (dateString: string): string =>
      new Date(dateString).toLocaleDateString("pt-BR");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Lembrete de Vencimento</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #495057; margin-top: 0;">Olá, ${clientName}!</h2>
          <p style="color: #6c757d; line-height: 1.6;">
            Este é um lembrete de que você possui uma parcela do seu empréstimo vencendo em breve.
          </p>
        </div>

        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0;">Detalhes do Pagamento</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #495057;"><strong>Valor da Parcela:</strong></td>
              <td style="padding: 8px 0; color: #495057; text-align: right;">${formatCurrency(installmentValue)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #495057;"><strong>Data de Vencimento:</strong></td>
              <td style="padding: 8px 0; color: #495057; text-align: right;">${formatDate(dueDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #495057;"><strong>Valor Total do Empréstimo:</strong></td>
              <td style="padding: 8px 0; color: #495057; text-align: right;">${formatCurrency(loanAmount)}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; margin: 0; font-weight: 500;">
            ⚠️ Lembre-se de realizar o pagamento até a data de vencimento para evitar juros adicionais.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #6c757d;">
            Em caso de dúvidas, entre em contato conosco.
          </p>
        </div>

        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; text-align: center;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            ${companyName}<br>
            Email: ${companyEmail}
          </p>
        </div>
      </div>
    `;

    console.log("[INFO] Preparando payload para MailerSend.");

    const mailersendPayload = {
      from: {
        email: companyEmail,
        name: companyName,
      },
      to: [
        {
          email: clientEmail,
          name: clientName,
        },
      ],
      subject: "Lembrete de Vencimento - Parcela do Empréstimo",
      html: emailHtml,
      text: `Olá ${clientName}! Este é um lembrete de que você possui uma parcela do seu empréstimo vencendo em ${formatDate(dueDate)}. Valor da parcela: ${formatCurrency(installmentValue)}. Valor total do empréstimo: ${formatCurrency(loanAmount)}.`,
    };

    console.log("[INFO] Enviando requisição para MailerSend API.", {
      to: clientEmail,
      from: companyEmail,
    });

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15_000);

    let emailResponse: Response;
    try {
      emailResponse = await fetch("https://api.mailersend.com/v1/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mailersendApiKey}`,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(mailersendPayload),
        signal: abortController.signal,
      });
    } catch (fetchError) {
      if (
        fetchError instanceof DOMException && fetchError.name === "AbortError"
      ) {
        throw new Error("TIMEOUT");
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}));

      if (emailResponse.status === 401) {
        return new Response(
          JSON.stringify({
            error: "Erro de autenticação",
            message: "API Key do MailerSend inválida. Entre em contato com o administrador.",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          },
        );
      }

      if (emailResponse.status === 422) {
        return new Response(
          JSON.stringify({
            error: "Dados inválidos",
            message: "Os dados fornecidos são inválidos. Verifique os emails e tente novamente.",
            details: errorData,
          }),
          {
            status: 422,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          },
        );
      }

      if (emailResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Limite de requisições excedido",
            message: "Muitas tentativas de envio. Aguarde alguns momentos e tente novamente.",
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          },
        );
      }

      throw new Error(`MailerSend API error: ${emailResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const messageId = emailResponse.headers.get("X-Message-Id");

    console.log("[INFO] Email enviado com sucesso via MailerSend.", {
      messageId,
      to: clientEmail,
      status: emailResponse.status,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de notificação enviado com sucesso",
        messageId,
        sentTo: clientEmail,
        provider: "MailerSend",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error: unknown) {
    const normalizedError =
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : "Unknown error");

    console.error("[ERRO] Falha ao enviar notificação de empréstimo:", {
      message: normalizedError.message,
      name: normalizedError.name,
      stack: normalizedError.stack?.substring(0, 500),
    });

    if (normalizedError.message === "TIMEOUT") {
      return new Response(
        JSON.stringify({
          error: "Timeout na requisição",
          message: "O serviço de email demorou muito para responder. Tente novamente.",
        }),
        {
          status: 408,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const normalizedMessage = normalizedError.message ?? "";

    if (normalizedMessage.includes("fetch") || normalizedMessage.includes("network")) {
      return new Response(
        JSON.stringify({
          error: "Erro de conexão",
          message: "Não foi possível conectar ao serviço de email. Tente novamente.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        message: "Não foi possível enviar o email de notificação. Tente novamente mais tarde.",
        details: normalizedError.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

if (import.meta.main) {
  serve(handler);
}
