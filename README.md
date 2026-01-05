
### My root dir
```
smart-iot/
├── backend/
├── frontend/
└── README.md
```


### Dependencies
```
npm install express mongoose dotenv cors jsonwebtoken bcrypt node-cron
npm install --save-dev nodemon
```
### Backend dir structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── device.controller.js
│   │   └── telemetry.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── device.model.js
│   │   └── telemetry.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── device.routes.js
│   │   └── telemetry.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── deviceAuth.middleware.js
│   │   └── error.middleware.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── isDeviceOnline.js
│   ├── config/
│   │   └── db.js
│   ├── app.js
│   └── index.js
├── .env
├── package.json
└── README.md
```