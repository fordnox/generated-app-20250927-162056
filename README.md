# Apex Scorer

A minimalist, real-time scoring application for IPSC-style sport shooting events.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fordnox/generated-app-20250927-162056)

Apex Scorer is a visually stunning, minimalist web application designed for real-time scoring of IPSC (International Practical Shooting Confederation) sport shooting events. It empowers club organizers and range officers to seamlessly manage competitions. The application features modules for competitor registration (Shooter Management), course of fire definition (Stage Management), and a highly intuitive interface for live score entry.

## Key Features

-   **Real-time Scoring:** Instantly calculate IPSC Hit Factors and overall match standings.
-   **Shooter Management:** Full CRUD functionality to add, view, edit, and delete competitors.
-   **Stage Management:** Easily define and manage all courses of fire for a match.
-   **Intuitive Score Entry:** A fast and simple interface designed for range officers on tablets and mobile devices.
-   **Live Leaderboard:** A dynamic results view that updates in real-time as scores are submitted.
-   **Responsive by Design:** Flawless user experience across desktops, tablets, and mobile phones.

## Technology Stack

-   **Frontend:**
    -   [React](https://react.dev/)
    -   [Vite](https://vitejs.dev/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [shadcn/ui](https://ui.shadcn.com/)
    -   [Framer Motion](https://www.framer.com/motion/)
    -   [Zustand](https://zustand-demo.pmnd.rs/) for state management
-   **Backend:**
    -   [Cloudflare Workers](https://workers.cloudflare.com/)
    -   [Hono](https://hono.dev/)
-   **Database:**
    -   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd apex_scorer
    ```

2.  **Install dependencies:**
    This project uses `bun` for package management.
    ```bash
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite development server for the frontend and the Wrangler development server for the backend, all concurrently.
    ```bash
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.

## Project Structure

-   `src/`: Contains the React frontend application source code.
    -   `pages/`: Top-level page components and application layout.
    -   `components/`: Reusable UI components, including shadcn/ui elements.
    -   `lib/`: Utility functions and API client.
-   `worker/`: Contains the Cloudflare Worker backend code using Hono.
    -   `index.ts`: The entry point for the worker.
    -   `user-routes.ts`: API route definitions.
    -   `entities.ts`: Durable Object entity definitions.
-   `shared/`: Contains TypeScript types and interfaces shared between the frontend and backend.

## Development

-   **Running the dev server:** `bun run dev`
-   **Linting:** `bun run lint`
-   **Building for production:** `bun run build`

The frontend communicates with the backend via a RESTful API exposed under the `/api` path. All API logic is handled by the Hono application in the `worker/` directory.

## Deployment

This application is designed to be deployed to Cloudflare's global network.

1.  **Login to Wrangler:**
    If you haven't already, authenticate the Wrangler CLI with your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script. This will build the frontend application and deploy both the static assets and the worker to Cloudflare.
    ```bash
    bun run deploy
    ```

Wrangler will provide you with the URL of your deployed application upon successful completion.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fordnox/generated-app-20250927-162056)

## License

This project is licensed under the MIT License.