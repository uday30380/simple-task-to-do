# Run and deploy your AI Studio app

This is a modern task management and AI assistant app with a beautiful, intuitive interface.

## Features

- ✅ **Smart Task Management**: Create, organize, and track tasks with priorities, categories, and due dates
- 🤖 **AI Chat Assistant**: Powered by Google Gemini, get help with anything you need
- 🎯 **Advanced Filtering**: Filter tasks by status, category, priority, and search
- 📱 **Mobile-Friendly**: Responsive design that works beautifully on all devices
- 🌙 **Dark Mode**: Eye-friendly dark theme
- 🗣️ **Voice Input**: Add tasks or chat with AI using voice commands

## Run Locally

**Prerequisites:** Node.js (version 16 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your Gemini API Key:**
   - Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a `.env.local` file in the root directory
   - Add your API key:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173/`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Using the AI Chat

1. Click on the "AI Chat" button in the bottom navigation
2. Type your message or use voice input
3. Press Enter or click the send button
4. The AI assistant will respond to your queries

**Note:** Make sure you have set up your Gemini API key in `.env.local` for the AI chat to work.

## Tech Stack

- React 18
- TypeScript
- Vite
- Google Generative AI (Gemini)
- Tailwind CSS
