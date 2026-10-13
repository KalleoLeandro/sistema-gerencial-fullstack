FROM jenkins/inbound-agent:jdk21

USER root

# Instala Maven e ferramentas auxiliares
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        maven \
        curl \
        ca-certificates \
        git \
        unzip \
        xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Instala Node.js 22 LTS e npm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Retorna ao usuário não privilegiado
USER jenkins