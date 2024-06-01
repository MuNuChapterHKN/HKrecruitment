# Use Node.js 20
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/
COPY api/package.json api/
COPY shared/package.json shared/

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install pnpm 8
RUN npm install -g pnpm@8

# Install dependencies
RUN pnpm install

# Copy all files to the container
COPY . .

# Check formatting
RUN pnpm run format-check

# Build the app
RUN pnpm run build

# Expose the port
EXPOSE 5173

ENV PORT 5173
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Start the app
CMD ["pnpm", "dev:web"]

