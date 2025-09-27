import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from "@/pages/DashboardPage";
import { ShootersPage } from "@/pages/ShootersPage";
import { StagesPage } from "@/pages/StagesPage";
import { ScoringPage } from "@/pages/ScoringPage";
import { ResultsPage } from "@/pages/ResultsPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "shooters",
        element: <ShootersPage />,
      },
      {
        path: "stages",
        element: <StagesPage />,
      },
      {
        path: "scoring",
        element: <ScoringPage />,
      },
      {
        path: "results",
        element: <ResultsPage />,
      },
    ],
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)