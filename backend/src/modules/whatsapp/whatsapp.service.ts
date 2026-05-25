import { env } from '../../config/env'

export interface WaButton {
  id: string
  text: string
}

export class WhatsappService {
  private readonly baseUrl = env.UAZAPI_BASE_URL
  private readonly token = env.UAZAPI_TOKEN_INSTANCE

  async sendText(chatId: string, text: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/message/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token: this.token },
      body: JSON.stringify({ chatid: chatId, text }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`UAZAPI sendText failed [${res.status}]: ${body}`)
    }
  }

  async sendButtons(chatId: string, text: string, buttons: string[]): Promise<void> {
    const payload = {
      chatid: chatId,
      text,
      buttons: buttons.map((label, i) => ({ id: String(i + 1), text: label })),
    }

    const res = await fetch(`${this.baseUrl}/message/buttons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token: this.token },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      // Fallback: send as numbered list in plain text
      const numbered = buttons.map((b, i) => `${i + 1}. ${b}`).join('\n')
      await this.sendText(chatId, `${text}\n\n${numbered}`)
    }
  }

  async sendList(chatId: string, title: string, body: string, items: string[]): Promise<void> {
    const payload = {
      chatid: chatId,
      title,
      body,
      sections: [
        {
          title: 'Opções',
          rows: items.map((label, i) => ({ rowId: String(i + 1), title: label })),
        },
      ],
    }

    const res = await fetch(`${this.baseUrl}/message/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token: this.token },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      await this.sendButtons(chatId, `${title}\n${body}`, items)
    }
  }
}
