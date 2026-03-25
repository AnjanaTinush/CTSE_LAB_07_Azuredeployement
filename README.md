# CTSE_LAB_07_Azuredeployement

## Required environment variables

### gateway
- `USER_SERVICE_URL=http://user-service:3001`

### user-service
- `USER_MANAGEMENT_MONGO_URI=<your_mongodb_connection_string>`
- `JWT_SECRET=<your_secret>`
- `PORT=3001`

## Azure Container Apps notes

- Keep `gateway` and `user-service` in the same Container Apps environment.
- In `gateway`, use `USER_SERVICE_URL=http://user-service:3001` first.
- If your environment requires FQDN resolution, set `USER_SERVICE_URL` to the internal FQDN.

## Quick test order

1. `https://<gateway-url>/health`
2. `https://<gateway-url>/users`
3. If `/users` fails, test `https://<user-service-url>/health` and check Container App logs.