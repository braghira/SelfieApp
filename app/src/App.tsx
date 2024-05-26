import { BrowserRouter, Routes, Route } from "react-router-dom";
// pages
import Home from "./pages/Home";
import AuthLayout from "./components/AuthLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <>
      <main className="App">
        <BrowserRouter>
          <div className="pages">
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
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
