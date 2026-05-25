# ─── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build args injetados em tempo de build (VITE_ vars são baked no bundle)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ─── Stage 2: serve com Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
# Usa o mecanismo nativo de templates do nginx Docker para substituir ${BACKEND_HOST}
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Variáveis de ambiente padrão para o Nginx/envsubst
ENV BACKEND_HOST=backend
ENV NGINX_ENVSUBST_FILTER=BACKEND_HOST

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
