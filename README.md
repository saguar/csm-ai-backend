# CSM AI Backend

This backend uses the Gemini API to analyze release updates, license adoption data and Proactive Monitoring alerts.

## Usage

Install dependencies and start the server:

```bash
npm install
npm start
```

By default the application listens on port `3000`. You can verify it is running by hitting the health endpoint:

```bash
curl http://localhost:3000/
```

It should respond with:

```json
{"status":"ok"}
```

## Setting up `GEMINI_API_KEY`

A valid API key is required for the Gemini API calls. You can provide it in two ways:

### Locally with `.env`

1. Create a `.env` file in the project root.
2. Add the following line, replacing `your_key` with your actual Gemini API key:

```
GEMINI_API_KEY=your_key
```

The server uses `dotenv` to load this variable when it starts.

### On Heroku

When deploying to Heroku, set the key as a config variable:

```
heroku config:set GEMINI_API_KEY=your_key
```

Heroku will make the variable available to the application at runtime.

Once the variable is set, the application can call the Gemini API.

## Configuring CORS

The allowed origin for CORS requests can be customized using the `CORS_ORIGIN` environment variable. If not provided, all origins are allowed (`"*"`).

Example `.env` entry:

```env
CORS_ORIGIN=http://example.com
```

Set this variable to the URL of your frontend when deploying to production.
