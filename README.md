# ChemWise — Netlify-ready Chemistry AI Tutor

## Deploy to Netlify

1. Create a GitHub repository and upload the contents of this folder.
2. In Netlify select **Add new site → Import an existing project**.
3. Connect GitHub and choose your repository.
4. Confirm the publish directory is `public`. Leave the build command blank.
   `netlify.toml` configures the function directory and `/api/chat` rewrite.
5. In Netlify open **Site configuration → Environment variables**.
6. Add `GROQ_API_KEY` and paste your Groq key as its value.
7. Save and trigger a new deploy.
8. Open your Netlify URL and test a question.

Do not put the real API key in frontend code or commit `.env` to GitHub.
Netlify uses `netlify/functions/chat.js` for API requests.

## Local use
Install Node.js, copy `.env.example` to `.env`, add your key, run `npm install`,
then `npm start` if you also have a local Express server. For Netlify function
testing locally, use Netlify CLI (`netlify dev`).
