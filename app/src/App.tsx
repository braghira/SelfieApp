import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkoutContextProvider } from "./context/WorkoutContext";
// pages
import Home from "./pages/Home";
import AuthLayout from "./components/AuthLayout";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <>
      <main className="App">
        <BrowserRouter>
          <div className="pages">
            <WorkoutContextProvider>
              <Routes>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                <Route index element={<Home />}></Route>
              </Routes>
            </WorkoutContextProvider>
          </div>
        </BrowserRouter>
      </main>
    </>
  );
}

export default App;
