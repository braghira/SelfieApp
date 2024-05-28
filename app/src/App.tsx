import { createBrowserRouter, RouterProvider } from "react-router-dom";
// pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoutes from "./lib/ProtectedRoutes";
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <Home />
      </ProtectedRoutes>
    ),
    errorElement: <ErrorPage />,
  },
  { path: "/login", element: <Login /> },
  { path: "signup", element: <Signup /> },
]);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
