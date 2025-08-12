# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
# Copy source, views, and public (static assets)
COPY src ./src
COPY views ./views
COPY public ./public
# .env.example is not required at build time; omit to avoid optional copy errors
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Copy views and public (static assets)
COPY --from=build /app/views ./views
COPY --from=build /app/public ./public
# Data dir
RUN mkdir -p /app/database && addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "dist/index.js"]