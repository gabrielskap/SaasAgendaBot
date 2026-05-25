export interface UazapiWebhookChat {
  id: string
  name: string
  owner: string
  phone: string
  wa_chatid: string
  wa_chatlid: string
  wa_contactName: string
  wa_isGroup: boolean
  wa_isBlocked: boolean
  wa_lastMessageTextVote: string
  wa_lastMessageType: string
  wa_lastMsgTimestamp: number
  wa_unreadCount: number
  chatbot_disableUntil: number
  chatbot_agentResetMemoryAt: number
  chatbot_lastTriggerAt: number
  chatbot_lastTrigger_id: string
  lead_name: string
  lead_fullName: string
  lead_email: string
  lead_isTicketOpen: boolean
  [key: string]: unknown
}

export interface UazapiWebhookMessage {
  messageid: string
  id: string
  chatid: string
  chatlid: string
  content: string
  text: string
  type: string
  messageType: string
  mediaType: string
  fromMe: boolean
  isGroup: boolean
  groupName: string
  owner: string
  sender: string
  senderName: string
  sender_pn: string
  sender_lid: string
  messageTimestamp: number
  buttonOrListid: string
  quoted: string
  reaction: string
  vote: string
  wasSentByApi: boolean
  source: string
  status: string
  pinned: boolean
  edited: string
  track_id: string
  track_source: string
  convertOptions: string
  [key: string]: unknown
}

export interface UazapiWebhookPayload {
  BaseUrl: string
  EventType: string
  chat: UazapiWebhookChat
  chatSource: string
  instanceName: string
  message: UazapiWebhookMessage
  owner: string
  token: string
}
