# Sharp.AI

**Look Sharp. Feel Unstoppable.**

Sharp.AI (formerly StyleScout) is an AI-powered master barber application. It utilizes advanced computer vision and generative AI to analyze facial features and recommend the best hairstyles and grooming tips tailored to your unique face shape.

![Sharp.AI Screenshot](https://via.placeholder.com/800x400?text=Sharp.AI+Interface)

## Features

- **Biometric Face Analysis**: Instantly identifies face shape (Oval, Square, Round, Diamond, etc.) and analyzes key features like jawline and forehead.
- **Personalized Recommendations**: tailored lists of hairstyles and facial hair types that mathematically balance your features.
- **Style Playground**: Visualize any recommended style directly on your uploaded photo using Generative AI.
- **Curated Look Combinations**: Expertly paired hair and beard combinations for a cohesive look.
- **Flexible Modes**:
  - **Complete Makeover**: Full hair and beard analysis.
  - **Hairstyle Only**: Focuses strictly on the hair.
  - **Facial Hair Only**: Focuses strictly on beard and stubble.
- **Privacy Focused**: Images are processed for analysis and generation but are not permanently stored on our servers.

## Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.5 (Flash & Pro Vision) via `@google/genai` SDK
- **Icons**: Lucide React
- **Build Tooling**: Vite

## Prerequisites

Before running the project, ensure you have the following installed:

1.  **Node.js** (v18.0.0 or higher)
2.  **npm** or **yarn**
3.  A valid **Google Gemini API Key**. You can get one for free at [Google AI Studio](https://aistudio.google.com/).

## Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/your-username/Sharp-AI.git
    cd Sharp-AI
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**

    Create a file named `.env` in the root directory of the project. Add your API key:

    ```env
    # .env
    API_KEY=your_google_gemini_api_key_here
    ```

    *Note: The application expects `process.env.API_KEY` to be available. If you are using Vite, you may need to configure `vite.config.ts` to define this variable or use a plugin like `vite-plugin-env-compatible`.*

4.  **Run the Development Server**

    ```bash
    npm run dev
    ```

5.  **Launch the App**

    Open your browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).

## Project Structure

```text
Sharp-AI/
├── components/         # UI Components (ImageUploader, ResultCard, etc.)
├── services/          # API integrations (Gemini service)
├── types.ts           # TypeScript interfaces
├── App.tsx            # Main application logic
├── index.html         # Entry HTML
└── index.tsx          # React DOM entry point
```

## Troubleshooting

-   **API Errors**: If analysis fails, check your `.env` file to ensure the API key is correct and has credits/quota available.
-   **Image Upload Issues**: Ensure images are JPG or PNG and under 5MB.
-   **Build Errors**: If using a fresh Vite install, ensure you have installed the specific dependencies: `@google/genai`, `lucide-react`, and `react-dom`.

## License

Distributed under the MIT License. See `LICENSE` for more information.
