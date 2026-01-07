# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

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
│   │   ├── deviceStatus.cron.js
│   │   └── isDeviceOnline.js
│   ├── config/
│   │   └── db.js
│   ├── app.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

### Frontend dir

```
frontend/
├── src/
│   ├── components/
│   │   ├── Cards/
│   │   ├── DeviceControl/
│   │   └── Navbar/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── DeviceDetails.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   ├── auth.js
│   │   ├── device.js
│   │   └── telemetry.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── index.html
├── package.json
└── README.md
