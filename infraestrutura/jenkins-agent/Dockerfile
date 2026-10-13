
FROM jenkins/inbound-agent:jdk21

USER root

# Ferramentas de desenvolvimento
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        maven \
        curl \
        ca-certificates \
        git \
        unzip \
        xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Node.js 22 + npm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Instala OpenJDK 27 para compilação
ARG JDK27_URL=https://download.java.net/java/GA/jdk27/55ce5470a6294008af0057ff4626d0e5/35/GPL/openjdk-27_linux-x64_bin.tar.gz

RUN mkdir -p /opt/jdks/jdk-27 && \
    curl -fSL "$JDK27_URL" -o /tmp/jdk27.tar.gz && \
    tar -xzf /tmp/jdk27.tar.gz \
        -C /opt/jdks/jdk-27 \
        --strip-components=1 && \
    rm /tmp/jdk27.tar.gz && \
    /opt/jdks/jdk-27/bin/java -version

# Configuração do JDK para os builds
ENV JDK27_HOME=/opt/jdks/jdk-27

USER jenkins
