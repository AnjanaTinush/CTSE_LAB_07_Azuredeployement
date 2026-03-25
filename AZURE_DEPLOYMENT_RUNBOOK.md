# Azure Deployment Runbook (CTSE_LAB_07_Azuredeployement)

This guide is tailored to your current project setup:

- Resource group: `microservices-rg`
- ACR: `sliitmicroregistry67890.azurecr.io`
- Container Apps: `gateway`, `user-service`
- Public URL: `https://gateway.bravecliff-0709e753.southeastasia.azurecontainerapps.io`

---

## 1) Prerequisites

- Azure CLI installed
- Docker Desktop running
- Logged in to Azure:

```powershell
az login
az account show --query "{name:name, user:user.name}" -o table
```

---

## 2) Required Environment Variables

### `gateway`

- `PORT=3000`
- `USER_SERVICE_URL=https://user-service.internal.bravecliff-0709e753.southeastasia.azurecontainerapps.io`

### `user-service`

- `PORT=3001`
- `USER_MANAGEMENT_MONGO_URI=<your mongodb uri>`
- `JWT_SECRET=<your secret>`

---

## 3) Deploy with Your Project (PowerShell examples)

Run commands from the repository root.

### 3.1 Deploy `user-service`

```powershell
docker build -t sliitmicroregistry67890.azurecr.io/user-service:v2 ./user-service
docker push sliitmicroregistry67890.azurecr.io/user-service:v2

az containerapp update `
  --name user-service `
  --resource-group microservices-rg `
  --image sliitmicroregistry67890.azurecr.io/user-service:v2 `
  --set-env-vars PORT=3001 USER_MANAGEMENT_MONGO_URI="<your mongodb uri>" JWT_SECRET="<your secret>"
```

### 3.2 Deploy `gateway`

```powershell
docker build -t sliitmicroregistry67890.azurecr.io/gateway:v8 ./gateway
docker push sliitmicroregistry67890.azurecr.io/gateway:v8

az containerapp update `
  --name gateway `
  --resource-group microservices-rg `
  --image sliitmicroregistry67890.azurecr.io/gateway:v8 `
  --set-env-vars PORT=3000 USER_SERVICE_URL=https://user-service.internal.bravecliff-0709e753.southeastasia.azurecontainerapps.io
```

---

## 4) Verify (with expected output)

### 4.1 Check revision status

```powershell
az containerapp show --name gateway --resource-group microservices-rg --query "{latest:properties.latestRevisionName,ready:properties.latestReadyRevisionName,fqdn:properties.configuration.ingress.fqdn}"
```

Expected: `latest` and `ready` should match.

### 4.2 Check health endpoint

```powershell
curl.exe -sS https://gateway.bravecliff-0709e753.southeastasia.azurecontainerapps.io/health
```

Example response:

```json
{
  "status": "OK",
  "service": "gateway",
  "userServiceTarget": "https://user-service.internal.bravecliff-0709e753.southeastasia.azurecontainerapps.io"
}
```

### 4.3 Check users endpoint

```powershell
curl.exe -sS -D - https://gateway.bravecliff-0709e753.southeastasia.azurecontainerapps.io/users
```

Expected status: `HTTP/1.1 200 OK`

Example body for this project:

```json
{
  "success": true,
  "users": [
    {
      "_id": "69c012c633592d1aeb16fc2c",
      "name": "Roy json",
      "email": "roy@gmail.com",
      "createdAt": "2026-03-22T16:03:18.390Z",
      "__v": 0
    }
  ]
}
```

---

## 5) Stop, Start, and Re-run in Azure

`az containerapp stop/start` is not supported in your CLI version.
Use one of the supported methods below.

### Option A: Restart app revision (quick restart)

```powershell
$gwRev = az containerapp show --name gateway --resource-group microservices-rg --query properties.latestRevisionName -o tsv
$usRev = az containerapp show --name user-service --resource-group microservices-rg --query properties.latestRevisionName -o tsv

az containerapp revision restart --name gateway --resource-group microservices-rg --revision $gwRev
az containerapp revision restart --name user-service --resource-group microservices-rg --revision $usRev
```

### Option B: Deactivate/Activate revision (stop/start equivalent)

```powershell
$gwRev = az containerapp show --name gateway --resource-group microservices-rg --query properties.latestRevisionName -o tsv
$usRev = az containerapp show --name user-service --resource-group microservices-rg --query properties.latestRevisionName -o tsv

az containerapp revision deactivate --name gateway --resource-group microservices-rg --revision $gwRev
az containerapp revision deactivate --name user-service --resource-group microservices-rg --revision $usRev

az containerapp revision activate --name user-service --resource-group microservices-rg --revision $usRev
az containerapp revision activate --name gateway --resource-group microservices-rg --revision $gwRev
```

### Option C: Scale to zero and back

```powershell
az containerapp update --name gateway --resource-group microservices-rg --min-replicas 0
az containerapp update --name user-service --resource-group microservices-rg --min-replicas 0

az containerapp update --name user-service --resource-group microservices-rg --min-replicas 1
az containerapp update --name gateway --resource-group microservices-rg --min-replicas 1
```

### Re-run (new revision without code change)

```powershell
$rev = az containerapp show --name gateway --resource-group microservices-rg --query properties.latestRevisionName -o tsv
az containerapp revision copy --name gateway --resource-group microservices-rg --revision $rev
```

Check available commands in your Azure CLI:

```powershell
az containerapp -h
az containerapp revision -h
```

---

## 6) Logs (Fast Debug)

```powershell
az containerapp logs show --name gateway --resource-group microservices-rg --tail 100
az containerapp logs show --name user-service --resource-group microservices-rg --tail 100
```

If `/users` fails, run these in order:

1. `curl.exe -sS https://gateway.bravecliff-0709e753.southeastasia.azurecontainerapps.io/health`
2. `az containerapp logs show --name gateway --resource-group microservices-rg --tail 100`
3. `az containerapp logs show --name user-service --resource-group microservices-rg --tail 100`
4. Check env values:

```powershell
az containerapp show --name gateway --resource-group microservices-rg --query "properties.template.containers[0].env"
```

---

## 7) Scoring (0 to 100)

Use this for lab/viva evaluation.

- **10**: Azure resources exist correctly (RG, ACR, Container Apps environment)
- **10**: Images built and pushed to ACR
- **15**: `gateway` deployed and healthy
- **15**: `user-service` deployed and healthy
- **15**: Gateway → user-service internal communication works
- **15**: MongoDB connectivity works in Azure (users returned)
- **10**: Security middleware enabled (helmet, CORS, rate limit)
- **10**: Logs and troubleshooting evidence available

### Grade bands

- **0–39**: Incomplete
- **40–59**: Partially working
- **60–79**: Mostly working
- **80–89**: Stable and complete
- **90–100**: Excellent submission quality

