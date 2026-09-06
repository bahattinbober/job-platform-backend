# ---------- Builder ----------
FROM node:22-slim AS builder

# Prisma ve bcrypt için gerekli sistem kütüphaneleri
RUN apt-get update -y && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Önce sadece manifest dosyaları: katman önbelleği için
COPY package*.json ./
RUN npm ci

# Kaynak kodu
COPY . .

# Sıra önemli: önce client üret, sonra derle
RUN npx prisma generate
RUN npm run build

# ---------- Runner ----------
FROM node:22-slim AS runner

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main"]