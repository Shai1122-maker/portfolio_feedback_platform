import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { PortfolioList } from "./components/PortfolioList";
import { UploadPortfolio } from "./components/UploadPortfolio";
import { PortfolioDetail } from "./components/PortfolioDetail";
import { MyPortfolios } from "./components/MyPortfolios";
import { useState, useEffect } from "react";

export default function App() {
  const [currentView, setCurrentView] = useState<"browse" | "upload" | "my-portfolios" | "detail">("browse");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 
              className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700"
              onClick={() => setCurrentView("browse")}
            >
              PortfolioHub
            </h1>
            <Authenticated>
              <nav className="flex gap-6">
                <button
                  onClick={() => setCurrentView("browse")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "browse" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Browse
                </button>
                <button
                  onClick={() => setCurrentView("upload")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "upload" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setCurrentView("my-portfolios")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "my-portfolios" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  My Portfolios
                </button>
              </nav>
            </Authenticated>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1">
        <Content 
          currentView={currentView}
          selectedPortfolioId={selectedPortfolioId}
          onViewPortfolio={(id) => {
            setSelectedPortfolioId(id);
            setCurrentView("detail");
          }}
          onBackToBrowse={() => setCurrentView("browse")}
        />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ 
  currentView, 
  selectedPortfolioId, 
  onViewPortfolio, 
  onBackToBrowse 
}: {
  currentView: string;
  selectedPortfolioId: string | null;
  onViewPortfolio: (id: string) => void;
  onBackToBrowse: () => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to PortfolioHub</h1>
            <p className="text-xl text-gray-600">
              Share your creative work and get valuable feedback from the community
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentView === "browse" && (
          <PortfolioList onViewPortfolio={onViewPortfolio} />
        )}
        {currentView === "upload" && (
          <UploadPortfolio onSuccess={onBackToBrowse} />
        )}
        {currentView === "my-portfolios" && (
          <MyPortfolios onViewPortfolio={onViewPortfolio} />
        )}
        {currentView === "detail" && selectedPortfolioId && (
          <PortfolioDetail 
            portfolioId={selectedPortfolioId} 
            onBack={onBackToBrowse}
          />
        )}
      </Authenticated>
    </div>
  );
}
