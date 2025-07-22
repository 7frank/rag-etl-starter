FROM oven/bun:1.2.9

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* bunfig.toml ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start the server
CMD ["bun", "run", "src/server.ts"]