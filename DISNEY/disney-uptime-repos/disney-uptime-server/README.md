Server README placeholder


js
npm install basic-auth

ts
npm install basic-auth
npm install -D @types/basic-auth


# dependencies
npm install express cors ws basic-auth
# if using TS server: npm install -D typescript ts-node @types/node @types/express @types/ws
# run server:
ADMIN_KEY='your-secret-key' node server.js
# Open:
# http://localhost:4000/        (client single-file demo)
# http://localhost:4000/admin.html   (admin)


# disney-uptime-server

Mock server for Disney ride uptime demo.

## Run locally

Install and run:
```bash
npm install
node server.js
```

```bash
docker build -t disney-uptime-server .
docker run -p 4000:4000 disney-uptime-server
```


