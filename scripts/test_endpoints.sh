#!/usr/bin/env bash
set -euo pipefail

BASE=http://localhost:3000

echo "== VALIDATE (standard) =="
curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -F "file=@test_data/test_reviews_standard.csv" "$BASE/api/validate-upload" || true

echo "\n== VALIDATE (altheader) =="
curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -F "file=@test_data/test_reviews_altheader.csv" "$BASE/api/validate-upload" || true

echo "\n== MAP (altheader -> review_text) =="
curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -F "file=@test_data/test_reviews_altheader.csv" -F "mapFrom=review_text" "$BASE/api/map-upload" || true

echo "\n== PROCESS (standard) =="
curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -F 'company={"organisationName":"TestCo"}' -F "file_0=@test_data/test_reviews_standard.csv" "$BASE/api/process-upload" || true
