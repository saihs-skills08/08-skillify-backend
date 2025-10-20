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
    openjdk-21-jdk \
    kotlin \
    fonts-noto-cjk \
    locales \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN locale-gen zh_TW.UTF-8
RUN update-locale LC_ALL=zh_TW.UTF-8 LANG=zh_TW.UTF-8

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH
ENV LANG=zh_TW.UTF-8
ENV LC_ALL=zh_TW.UTF-8

RUN curl -fsSL https://bun.sh/install | bash && \
    cp /root/.bun/bin/bun /usr/local/bin/bun

RUN bun --version

WORKDIR /app

COPY . .

RUN bun install

EXPOSE 8000

CMD ["bun", "run", "start"]
