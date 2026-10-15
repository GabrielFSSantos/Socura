#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
if ! command -v npx >/dev/null 2>&1; then
  echo "npx não encontrado. Carregue nvm/fnm."
  exit 1
fi
sudo env "PATH=$PATH" npx playwright install-deps chrome
npx playwright install chrome
echo "Pronto: PW_CHANNEL=chrome npm run auth -- --platform=x"
