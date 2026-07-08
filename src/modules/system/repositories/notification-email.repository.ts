type SendNotificationEmailInput = {
  to: string;
  subject: string;
  text: string;
};

type SendNotificationEmailOptions = {
  requireLiveTransport?: boolean;
};

type ResendConfig = {
  apiKey: string;
  from: string;
};

type WebhookConfig = {
  url: string;
  secret?: string;
};

function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_EMAIL_FROM;

  if (!apiKey || !from) {
    return null;
  }

  return { apiKey, from };
}

function getWebhookConfig(): WebhookConfig | null {
  const url = process.env.NOTIFICATION_EMAIL_WEBHOOK_URL;
  if (!url) {
    return null;
  }

  return {
    url,
    secret: process.env.NOTIFICATION_EMAIL_WEBHOOK_SECRET,
  };
}

export class NotificationEmailRepository {
  private readonly resendConfig = getResendConfig();
  private readonly webhookConfig = getWebhookConfig();

  private async sendWithResend(input: SendNotificationEmailInput) {
    if (!this.resendConfig) {
      return false;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.resendConfig.apiKey}`,
      },
      body: JSON.stringify({
        from: this.resendConfig.from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`RESEND_SEND_FAILED:${response.status}:${body}`);
    }

    return true;
  }

  private async sendWithWebhook(input: SendNotificationEmailInput) {
    if (!this.webhookConfig) {
      return false;
    }

    const response = await fetch(this.webhookConfig.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.webhookConfig.secret ? { "x-webhook-secret": this.webhookConfig.secret } : {}),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`EMAIL_WEBHOOK_SEND_FAILED:${response.status}:${body}`);
    }

    return true;
  }

  hasLiveTransport() {
    return Boolean(this.resendConfig || this.webhookConfig);
  }

  async send(input: SendNotificationEmailInput, options?: SendNotificationEmailOptions) {
    const strict = options?.requireLiveTransport === true;

    if (strict && !this.hasLiveTransport()) {
      throw new Error("EMAIL_TRANSPORT_NOT_CONFIGURED");
    }

    const sentByResend = await this.sendWithResend(input);
    if (sentByResend) {
      return;
    }

    const sentByWebhook = await this.sendWithWebhook(input);
    if (sentByWebhook) {
      return;
    }

    if (strict) {
      throw new Error("EMAIL_TRANSPORT_NOT_CONFIGURED");
    }

    console.info("NOTIFICATION_EMAIL_FALLBACK", {
      to: input.to,
      subject: input.subject,
    });
  }
}
