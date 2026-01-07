#!/bin/bash

echo "[*] Building Landing Page.."
cd frontend/landing && pnpm build
cd -

cd frontend/admin && pnpm build && cd -
