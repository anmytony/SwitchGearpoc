#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Azure Deployment Script — Switchgear AI Co-Engineer
# Run once to create all resources. Re-run to update container images.
# Prerequisites: az CLI logged in, .NET 9 SDK (for EF migrations only)
# Usage: bash deploy-azure.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── CONFIG — edit these before running ────────────────────────────────────────
RESOURCE_GROUP="rg-switchgear"
LOCATION="eastus"
ACR_NAME="switchgearacr"                          # must be globally unique, lowercase
APP_ENV="switchgear-env"                          # Container Apps environment name
BACKEND_APP="switchgear-backend"
PYTHON_APP="switchgear-extraction"
FRONTEND_APP="switchgear-frontend"
SQL_SERVER="switchgear-sql"                       # must be globally unique
SQL_DB="SwitchgearDb"
SQL_ADMIN="sqladmin"
SQL_PASSWORD="SwitchgearPass123!"                 # change this

# ── Azure AI service values (copy from your existing resources) ────────────────
DI_ENDPOINT="https://doc-intelligence-switchgear.cognitiveservices.azure.com/"
DI_KEY="BYsD7uF0Ak955Qn79s9yf5MaTMmolLM2IiYFJGSZibviKFBAiv0AJQQJ99CFACYeBjFXJ3w3AAALACOGdNS8"
OPENAI_ENDPOINT="https://aesgdhfjgkl.services.ai.azure.com/openai/v1"
OPENAI_KEY="DQcbg9R2PI8swV7fjufZ5MFv2d8n2IukyMJHkTwyh6RTkCeyzqpBJQQJ99CFACYeBjFXJ3w3AAAAACOGtEIx"
OPENAI_TEXT_DEPLOY="gpt-4o-mini"
OPENAI_VISION_DEPLOY="gpt-4o"
OPENAI_EMBED_DEPLOY="text-embedding-3-small"
VISION_ENDPOINT="https://abb-switchgear-vision.cognitiveservices.azure.com/"
VISION_KEY="4SDEXTrFdQzI61TCha3kGweMVeZDMvMjUOvErCj6sZ7qiZ1ae1mHJQQJ99CFACYeBjFXJ3w3AAAFACOGK0br"
SEARCH_ENDPOINT="https://switchgear-switch.search.windows.net"
SEARCH_KEY="I7HA2zCtpUUWxm67eSHKSpxUfZbqIsYYTSU9nkaycTAzSeDHeHA4"
SEARCH_INDEX="switchgear-chunks"

echo "=== 1. Resource Group ==="
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "=== 2. Azure Container Registry ==="
az acr create --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" --sku Basic --admin-enabled true
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value -o tsv)

echo "=== 3. Azure SQL Database ==="
az sql server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$SQL_SERVER" \
  --location "$LOCATION" \
  --admin-user "$SQL_ADMIN" \
  --admin-password "$SQL_PASSWORD"

az sql server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --server "$SQL_SERVER" \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

az sql db create \
  --resource-group "$RESOURCE_GROUP" \
  --server "$SQL_SERVER" \
  --name "$SQL_DB" \
  --edition GeneralPurpose \
  --family Gen5 \
  --capacity 2 \
  --compute-model Serverless \
  --auto-pause-delay 60

SQL_CONN="Server=tcp:${SQL_SERVER}.database.windows.net,1433;Database=${SQL_DB};User ID=${SQL_ADMIN};Password=${SQL_PASSWORD};Encrypt=True;"

echo "=== 4. Build images in ACR cloud (no Docker Desktop needed) ==="
# az acr build uploads source to Azure and builds in the cloud

echo "  Building Python extraction service..."
az acr build \
  --registry "$ACR_NAME" \
  --image "extraction:latest" \
  --file extraction-service/Dockerfile \
  ./extraction-service

echo "  Building .NET backend..."
az acr build \
  --registry "$ACR_NAME" \
  --image "backend:latest" \
  --file backend/SwitchgearApi/Dockerfile \
  ./backend/SwitchgearApi

echo "  Building Angular frontend..."
az acr build \
  --registry "$ACR_NAME" \
  --image "frontend:latest" \
  --file frontend/switchgear-ui/Dockerfile \
  ./frontend/switchgear-ui

echo "=== 5. Container Apps Environment ==="
az containerapp env create \
  --name "$APP_ENV" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION"

echo "=== 6. Deploy Python Extraction Service ==="
az containerapp create \
  --name "$PYTHON_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$APP_ENV" \
  --image "${ACR_LOGIN_SERVER}/extraction:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-username "$ACR_NAME" \
  --registry-password "$ACR_PASSWORD" \
  --target-port 8000 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 1.0 --memory 2.0Gi \
  --env-vars \
    AZURE_DI_ENDPOINT="$DI_ENDPOINT" \
    AZURE_DI_API_KEY="$DI_KEY" \
    AZURE_OPENAI_ENDPOINT="$OPENAI_ENDPOINT" \
    AZURE_OPENAI_API_KEY="$OPENAI_KEY" \
    AZURE_OPENAI_TEXT_DEPLOYMENT="$OPENAI_TEXT_DEPLOY" \
    AZURE_OPENAI_VISION_DEPLOYMENT="$OPENAI_VISION_DEPLOY" \
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT="$OPENAI_EMBED_DEPLOY" \
    AZURE_VISION_ENDPOINT="$VISION_ENDPOINT" \
    AZURE_VISION_API_KEY="$VISION_KEY" \
    AZURE_SEARCH_ENDPOINT="$SEARCH_ENDPOINT" \
    AZURE_SEARCH_API_KEY="$SEARCH_KEY" \
    AZURE_SEARCH_INDEX_NAME="$SEARCH_INDEX" \
    PORT=8000 \
    LOG_LEVEL=info

PYTHON_FQDN=$(az containerapp show \
  --name "$PYTHON_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn -o tsv)
PYTHON_URL="https://${PYTHON_FQDN}"

echo "=== 7. Deploy .NET Backend ==="
az containerapp create \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$APP_ENV" \
  --image "${ACR_LOGIN_SERVER}/backend:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-username "$ACR_NAME" \
  --registry-password "$ACR_PASSWORD" \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 1.0 --memory 2.0Gi \
  --env-vars \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__DefaultConnection="$SQL_CONN" \
    AzureDocumentIntelligence__Endpoint="$DI_ENDPOINT" \
    AzureDocumentIntelligence__ApiKey="$DI_KEY" \
    AzureOpenAI__Endpoint="$OPENAI_ENDPOINT" \
    AzureOpenAI__ApiKey="$OPENAI_KEY" \
    AzureOpenAI__DeploymentName="$OPENAI_TEXT_DEPLOY" \
    AzureOpenAI__VisionDeploymentName="$OPENAI_VISION_DEPLOY" \
    PythonExtraction__BaseUrl="$PYTHON_URL"

BACKEND_FQDN=$(az containerapp show \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn -o tsv)
BACKEND_URL="https://${BACKEND_FQDN}"

echo "=== 8. Deploy Angular Frontend ==="
az containerapp create \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$APP_ENV" \
  --image "${ACR_LOGIN_SERVER}/frontend:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-username "$ACR_NAME" \
  --registry-password "$ACR_PASSWORD" \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 2 \
  --cpu 0.5 --memory 1.0Gi \
  --env-vars BACKEND_URL="$BACKEND_URL"

FRONTEND_FQDN=$(az containerapp show \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "=== 9. Run EF Core database migrations ==="
dotnet tool install --global dotnet-ef 2>/dev/null || true
cd backend/SwitchgearApi
dotnet ef database update --connection "$SQL_CONN"
cd ../..

echo ""
echo "══════════════════════════════════════════"
echo " DEPLOYMENT COMPLETE"
echo "══════════════════════════════════════════"
echo " App URL:  https://${FRONTEND_FQDN}"
echo " Backend:  ${BACKEND_URL}"
echo " Python:   ${PYTHON_URL}  (internal only)"
echo "══════════════════════════════════════════"
