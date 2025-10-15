FROM oven/bun:latest

RUN apt-get update && apt-get install -y \
    libstdc++6 \
    libgcc-s1 \
  libncursesw6 \
    libz-dev \
    libuv1 \
    build-essential \
    openjdk-17-jdk \
    kotlin \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

WORKDIR /app

COPY . .

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "start"]
