import { useAuth } from "./hooks/useAuth";
import LoginPage from "./components/LoginPage";
import PreferencesDisplay from "./components/PreferencesDisplay";

function App() {
  const { isLoading, session, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <main>
      <div className="bg-white border-b border-gray-300 px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="font-black text-2xl">Bluesky Preferences Helper</h1>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </div>
      <PreferencesDisplay session={session} />
    </main>
  );
}

export default App;
