import { useState } from "react";
import { HomePage } from "./pages/HomePage";
import { CollectionPage } from "./pages/CollectionPage";
import { BalatroBackground } from "./components/BalatroBackground";
import "./App.css";

export type Page = "home" | "collection";

export default function App() {
  const [page, setPage] = useState<Page>("home");

  return (
    <>
      <BalatroBackground />
      <div className="app">
        {page === "home" ? (
          <HomePage onNavigate={setPage} />
        ) : (
          <CollectionPage onNavigate={setPage} />
        )}
      </div>
    </>
  );
}