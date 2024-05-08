import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route index element={<Home />}></Route>
            </Routes>
          </div>
        </BrowserRouter>
      </main>
    </>
  );
}

export default App;
