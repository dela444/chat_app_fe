# chat_app_fe

## Frontend Setup

1. **Clone the Frontend Repository:**

  ```bash
    git clone https://github.com/dela444/chat_app_fe.git

    cd chat_app_fe
  ```

2. **Update `package.json`:**

Open the `package.json` file and change the `name` property from:

```json
   {
    "name": "frontend",
    "version": "0.1.0",
    "private": true,
  }
```
To:

```json
   {
    "name": "chat_app_fe",
    "version": "0.1.0",
    "private": true,
  }
```

3. **Update `package-lock.json`:**

Open the `package-lock.json` file and change the `name` property from:

```json
   {
    "name": "frontend",
    "version": "0.1.0",
    "lockfileVersion": 2,
    "requires": true,
    "packages": {
      "": {
        "name": "frontend",
```

To:

```json
   {
    "name": "chat_app_fe",
    "version": "0.1.0",
    "lockfileVersion": 2,
    "requires": true,
    "packages": {
      "": {
        "name": "chat_app_fe",
```

4. **Install Dependencies:**

 ```bash
  npm install
  ```
5. **Set Up Environment Variables:**

   Create a `.env` file in the root of the backend directory and add the following environment variables:
   
  ```bash
  REACT_APP_FRONTEND_URL = 'http://localhost:3000'
  REACT_APP_BACKEND_URL = 'http://localhost:5000'
  ```
 
6. **Start the Frontend Server:**

 ```bash
  npm start
  ```

The frontend application should now be running on http://localhost:3000.