# uazapiGO — Endpoints utilizados no AgendaBot

> **STATUS:** Referência provisória inferida da coleção Postman v2.0 pública  
> (`https://www.postman.com/augustofcs/uazapi-v2/`)  
> Campos marcados com `[CONFIRMAR]` devem ser validados em `https://docs.uazapi.com`  
> antes de ir para produção. Nenhum endpoint foi inventado — todos são referenciados
> em fontes públicas.

---

## Autenticação

Todas as requisições requerem o token da instância no header:

```
token: <INSTANCE_TOKEN>
```

A `UAZAPI_BASE_URL` é configurada por instância (ex: `https://api.uazapi.com`  
ou self-hosted). Nunca hardcoded — lida de `process.env.UAZAPI_BASE_URL`.

---

## 1. Instâncias

### 1.1 Criar instância
```
POST {UAZAPI_BASE_URL}/instance/create   [CONFIRMAR path]
Headers: token: <GLOBAL_TOKEN>
Body: {
  "instanceName": string,
  "webhook": string          // URL do nosso webhook receiver
}
Response: {
  "instance": { "instanceName": string, "status": string },
  "hash": { "apikey": string }
}
```
> Usado em: configuração do tenant → `POST /api/instances`

---

### 1.2 Status da instância
```
GET {UAZAPI_BASE_URL}/instance/connectionState   [CONFIRMAR path]
Headers: token: <INSTANCE_TOKEN>
Response: {
  "instance": { "instanceName": string, "state": "open"|"connecting"|"close" }
}
```
> Usado em: painel de status da instância

---

### 1.3 Conectar / obter QR Code
```
GET {UAZAPI_BASE_URL}/instance/connect   [CONFIRMAR path]
Headers: token: <INSTANCE_TOKEN>
Response: {
  "pairingCode": string | null,
  "code": string,            // conteúdo do QR
  "base64": string           // QR em base64 para exibir na UI
}
```
> Usado em: tela de configuração → exibir QR para escanear

---

### 1.4 Configurar webhook
```
POST {UAZAPI_BASE_URL}/webhook/set   [CONFIRMAR path]
Headers: token: <INSTANCE_TOKEN>
Body: {
  "url": string,             // nosso endpoint: /api/webhooks/uazapi/{instanceId}
  "events": ["message", "message_status", "button_reply", "list_reply"]   [CONFIRMAR nomes]
}
Response: { "webhook": { "url": string, "events": string[] } }
```

---

## 2. Enviar Mensagens

> Base path para envio: `{UAZAPI_BASE_URL}/message/`  [CONFIRMAR]

### 2.1 Enviar texto
```
POST {UAZAPI_BASE_URL}/message/sendText   [CONFIRMAR path]
Headers: token: <INSTANCE_TOKEN>, Content-Type: application/json
Body: {
  "number": string,          // formato E.164: "5511999999999"
  "text": string             // suporta formatação WhatsApp (*bold*, _italic_)
}
Response: {
  "key": { "id": string },   // ID da mensagem (para deduplicação)
  "status": "PENDING"
}
```
> Nó: `texto`  
> Salvar `key.id` em `AgendaBot_Message.whatsapp_id`

---

### 2.2 Enviar mídia (imagem / vídeo / documento / áudio)
```
POST {UAZAPI_BASE_URL}/message/sendMedia   [CONFIRMAR path]
Headers: token: <INSTANCE_TOKEN>, Content-Type: application/json
Body: {
  "number": string,
  "mediatype": "image"|"video"|"document"|"audio",
  "media": string,           // URL pública OU base64
  "fileName": string,        // obrigatório para document
  "caption": string          // opcional para image/video
}
Response: {
  "key": { "id": string },
  "status": "PENDING"
}
```
> Nós: `imagem`, `video`, `audio`, `arquivo`

---

### 2.3 Enviar botões (menu interativo)
```
POST {UAZAPI_BASE_URL}/message/sendButtons   [CONFIRMAR path — pode ser sendButtonMessage]
Headers: token: <INSTANCE_TOKEN>, Content-Type: application/json
Body: {
  "number": string,
  "title": string,           // título da mensagem
  "description": string,     // corpo do texto
  "buttons": [
    { "buttonId": string, "buttonText": { "displayText": string } }
  ]
}
Response: { "key": { "id": string }, "status": "PENDING" }
```
> Nó: `pergunta`  
> Limite: 3 botões por mensagem (restrição WhatsApp)  
> Para mais opções → usar sendList (2.4)

---

### 2.4 Enviar lista
```
POST {UAZAPI_BASE_URL}/message/sendList   [CONFIRMAR path]
Headers: token: <INSTANCE_TOKEN>, Content-Type: application/json
Body: {
  "number": string,
  "title": string,
  "description": string,
  "buttonText": string,      // texto do botão que abre a lista
  "sections": [
    {
      "title": string,
      "rows": [
        { "rowId": string, "title": string, "description": string }
      ]
    }
  ]
}
Response: { "key": { "id": string }, "status": "PENDING" }
```
> Nó: `cards` (lista de serviços, por exemplo)

---

## 3. Webhook Receiver

> Nosso endpoint que a uazapiGO chama: `POST /api/webhooks/uazapi/{instanceId}`

### 3.1 Evento: mensagem recebida
```json
{
  "event": "message",           // [CONFIRMAR nome exato do evento]
  "instance": "instanceName",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "MSGID..."
    },
    "message": {
      "conversation": "texto da mensagem"
    },
    "messageTimestamp": 1234567890,
    "pushName": "Nome do Contato"
  }
}
```

### 3.2 Evento: resposta de botão
```json
{
  "event": "button_reply",      // [CONFIRMAR nome exato]
  "instance": "instanceName",
  "data": {
    "key": { "remoteJid": "...", "fromMe": false, "id": "..." },
    "message": {
      "buttonsResponseMessage": {
        "selectedButtonId": "btn_1",
        "selectedDisplayText": "Opção A"
      }
    }
  }
}
```

### 3.3 Evento: resposta de lista
```json
{
  "event": "list_reply",        // [CONFIRMAR nome exato]
  "instance": "instanceName",
  "data": {
    "key": { "remoteJid": "...", "fromMe": false, "id": "..." },
    "message": {
      "listResponseMessage": {
        "singleSelectReply": { "selectedRowId": "row_1" },
        "title": "Opção selecionada"
      }
    }
  }
}
```

### 3.4 Evento: status de mensagem
```json
{
  "event": "message_status",    // [CONFIRMAR nome exato]
  "instance": "instanceName",
  "data": {
    "key": { "id": "MSGID...", "remoteJid": "..." },
    "status": "DELIVERY_ACK"|"READ"|"PLAYED"   // [CONFIRMAR valores]
  }
}
```

---

## 4. Mapeamento nó → endpoint

| Nó Flow Builder | Endpoint uazapiGO | Status |
|---|---|---|
| `inicio` | (sem envio — apenas dispara o fluxo) | interno |
| `texto` | `POST /message/sendText` | a implementar |
| `pergunta` | `POST /message/sendButtons` (≤3 opções) ou `sendList` (>3) | a implementar |
| `imagem` | `POST /message/sendMedia` (mediatype: image) | a implementar |
| `audio` | `POST /message/sendMedia` (mediatype: audio) | a implementar |
| `video` | `POST /message/sendMedia` (mediatype: video) | a implementar |
| `arquivo` | `POST /message/sendMedia` (mediatype: document) | a implementar |
| `cards` | `POST /message/sendList` | a implementar |
| `delay` | `setTimeout` interno + nenhuma chamada de API | interno |
| `condicao` | nenhuma chamada de API — avaliação interna | interno |
| `variavel` | nenhuma chamada de API — escrita em session.variables | interno |
| `pular` | nenhuma chamada de API — transição interna | interno |
| `return_node` | nenhuma chamada de API — reset de currentNodeId | interno |
| `input_texto`, `numero`, `email`, `telefone`, `data_input`, `time_input` | aguarda evento `message` do webhook | receptor |

---

## 5. Validação HMAC

`[CONFIRMAR]` — A uazapiGO v2 pode suportar assinatura HMAC no header  
`x-uazapi-signature` ou similar. Se confirmado, o webhook receiver deve:

```typescript
const sig = req.headers['x-uazapi-signature'];
const expected = crypto
  .createHmac('sha256', instance.webhook_secret)
  .update(rawBody)
  .digest('hex');
if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
  throw new Error('Invalid signature');
}
```

O campo `webhook_secret` está disponível em `AgendaBot_UazapiInstance.webhook_secret`.

---

## Referências

- Coleção Postman v2.0 (pública): https://www.postman.com/augustofcs/uazapi-v2/
- Documentação oficial (SPA — requer browser): https://docs.uazapi.com
- n8n integration package: `n8n-nodes-n8ntools-uazapi` (operações inferidas)
