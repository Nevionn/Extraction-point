import "./App.css";
import MainPage from "./pages/MainPage/MainPage";
import { ThemeProvider } from "./hooks/useTheme";

function App() {
  return (
    <ThemeProvider>
      <main className="container">
        <MainPage />
      </main>
    </ThemeProvider>
  );
}

export default App;
