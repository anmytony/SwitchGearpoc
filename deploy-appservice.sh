#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Azure App Service Deployment — NO DOCKER required
# Frontend  → Azure Static Web Apps (free)
# Backend   → Azure App Service Linux (.NET 9)
# Python    → Azure App Service Linux (Python 3.11)
# Database  → Azure SQL (serverless)
#
# Prerequisites:
#   az CLI logged in  (az login)
#   .NET 9 SDK        (dotnet --version)
#   Node 20 + npm     (node --version)
#   dotnet-ef tool    (installed automatically below)
#
# Usage:  bash deploy-appservice.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── CONFIG — change before running ───────────────────────────────────────────
RESOURCE_GROUP="RG-cs-PCS-AZ-CR-10119"
LOCATION="eastus"
APP_PLAN="switchgear-plan"          # shared Linux App Service plan
BACKEND_APP="switchgear-api"        # must be globally unique → <name>.azurewebsites.net
PYTHON_APP="switchgear-extraction"  # must be globally unique
STATIC_APP="switchgear-ui"          # must be globally unique
SQL_SERVER="switchgear-sql"         # must be globally unique
SQL_DB="SwitchgearDb"
SQL_ADMIN="sqladmin"
SQL_PASSWORD="SwitchgearPass123!"   # change this

# Azure AI values (already deployed — copy from .env)
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

SQL_CONN="Server=tcp:${SQL_SERVER}.database.windows.net,1433;Database=${SQL_DB};User ID=${SQL_ADMIN};Password=${SQL_PASSWORD};Encrypt=True;"

# ─────────────────────────────────────────────────────────────────────────────
echo "=== 1. Resource Group ==="
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# ─────────────────────────────────────────────────────────────────────────────
echo "=== 2. Azure SQL Database ==="
az sql server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$SQL_SERVER" --location "$LOCATION" \
  --admin-user "$SQL_ADMIN" --admin-password "$SQL_PASSWORD"

az sql server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" --server "$SQL_SERVER" \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

az sql db create \
  --resource-group "$RESOURCE_GROUP" --server "$SQL_SERVER" \
  --name "$SQL_DB" \
  --edition GeneralPurpose --family Gen5 --capacity 2 \
  --compute-model Serverless --auto-pause-delay 60

# ─────────────────────────────────────────────────────────────────────────────
echo "=== 3. App Service Plan (Windows B1, shared by backend + Python) ==="
az appservice plan create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_PLAN" \
  --sku B1

# ─────────────────────────────────────────────────────────────────────────────
echo "=== 4. Python Extraction Service ==="
az webapp create \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$APP_PLAN" \
  --name "$PYTHON_APP" \
  --runtime "python:3.11"

# Windows: gunicorn is Unix-only — use uvicorn directly
az webapp config set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$PYTHON_APP" \
  --startup-file "python -m uvicorn main:app --host 0.0.0.0 --port 8000"

az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$PYTHON_APP" \
  --settings \
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
    SCM_DO_BUILD_DURING_DEPLOYMENT=true

echo "  Packaging and deploying Python service..."
cd extraction-service
zip -r ../extraction.zip . --exclude "*.pyc" --exclude "__pycache__/*" --exclude ".env"
cd ..
az webapp deploy \
  --resource-group "$RESOURCE_GROUP" \
  --name "$PYTHON_APP" \
  --src-path extraction.zip \
  --type zip
rm extraction.zip

PYTHON_URL="https://${PYTHON_APP}.azurewebsites.net"

# ─────────────────────────────────────────────────────────────────────────────
echo "=== 5. .NET Backend ==="
az webapp create \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$APP_PLAN" \
  --name "$BACKEND_APP" \
  --runtime "dotnet:9"

az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$BACKEND_APP" \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    "ConnectionStrings__DefaultConnection=$SQL_CONN" \
    AzureDocumentIntelligence__Endpoint="$DI_ENDPOINT" \
    AzureDocumentIntelligence__ApiKey="$DI_KEY" \
    AzureOpenAI__Endpoint="$OPENAI_ENDPOINT" \
    AzureOpenAI__ApiKey="$OPENAI_KEY" \
    AzureOpenAI__DeploymentName="$OPENAI_TEXT_DEPLOY" \
    AzureOpenAI__VisionDeploymentName="$OPENAI_VISION_DEPLOY" \
    PythonExtraction__BaseUrl="$PYTHON_URL"
# Cors__AllowedOrigins will be updated after the Static Web App is created (step 6)

echo "  Building and publishing .NET backend..."
cd backend/SwitchgearApi
dotnet publish -c Release -o ./publish
cd publish
zip -r ../../../backend.zip .
cd ../../..
az webapp deploy \
  --resource-group "$RESOURCE_GROUP" \
  --name "$BACKEND_APP" \
  --src-path backend.zip \
  --type zip
rm backend.zip
rm -rf backend/SwitchgearApi/publish

BACKEND_URL="https://${BACKEND_APP}.azurewebsites.net"

# ─────────────────────────────────────────────────────────────────────────────
echo "=== 6. Angular Frontend (Static Web Apps) ==="
az staticwebapp create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$STATIC_APP" \
  --location "$LOCATION" \
  --sku Free

STATIC_URL="https://$(az staticwebapp show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$STATIC_APP" \
  --query defaultHostname -o tsv)"

# Update backend CORS to allow the Static Web App domain
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$BACKEND_APP" \
  --settings Cors__AllowedOrigins="$STATIC_URL"

# Inject backend URL into Angular environment before building
sed -i "s|apiBaseUrl: ''|apiBaseUrl: '${BACKEND_URL}'|g" \
  frontend/switchgear-ui/src/environments/environment.prod.ts

echo "  Building Angular app..."
cd frontend/switchgear-ui
npm ci --prefer-offline
npx ng build --configuration production
cd ../..

# Create staticwebapp.config.json so Angular routing works (single-page app fallback)
cat > frontend/switchgear-ui/dist/switchgear-ui/browser/staticwebapp.config.json << 'EOF'
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{css,js,ico,png,jpg,svg,woff2}"]
  }
}
EOF

# Deploy built output to Static Web Apps
DEPLOY_TOKEN=$(az staticwebapp secrets list \
  --resource-group "$RESOURCE_GROUP" \
  --name "$STATIC_APP" \
  --query properties.apiKey -o tsv)

npx @azure/static-web-apps-cli deploy \
  frontend/switchgear-ui/dist/switchgear-ui/browser \
  --deployment-token "$DEPLOY_TOKEN" \
  --env production

# Restore environment.prod.ts to avoid committing the URL
sed -i "s|apiBaseUrl: '${BACKEND_URL}'|apiBaseUrl: ''|g" \
  frontend/switchgear-ui/src/environments/environment.prod.ts

# ─────────────────────────────────────────────────────────────────────────────
echo "=== 7. EF Core database migrations ==="
dotnet tool install --global dotnet-ef 2>/dev/null || true
cd backend/SwitchgearApi
dotnet ef database update --connection "$SQL_CONN"
cd ../..

echo ""
echo "══════════════════════════════════════════════════════"
echo " DEPLOYMENT COMPLETE"
echo "══════════════════════════════════════════════════════"
echo " App URL:   $STATIC_URL"
echo " Backend:   $BACKEND_URL"
echo " Python:    $PYTHON_URL"
echo "══════════════════════════════════════════════════════"
echo ""
echo " On code updates, re-run only what changed:"
echo "   Backend:  dotnet publish + az webapp deploy"
echo "   Python:   zip + az webapp deploy"
echo "   Frontend: ng build + swa deploy"
echo "══════════════════════════════════════════════════════"
