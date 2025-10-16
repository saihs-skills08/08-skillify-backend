FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y \
    curl \
    unzip \
    git \
    build-essential \
    ca-certificates \
    libstdc++6 \
    libgcc-s1 \
    libncursesw6 \
    libz-dev \
    libuv1 \
    openjdk-17-jdk \
    kotlin \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

RUN curl -fsSL https://bun.sh/install | bash && \
    cp /root/.bun/bin/bun /usr/local/bin/bun

RUN bun --version

WORKDIR /app

COPY . .

RUN bun install

EXPOSE 8000

CMD ["bun", "run", "start"]
