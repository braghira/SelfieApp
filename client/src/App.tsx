import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
// pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthLayout from "./layouts/AuthLayout";
import WelcomePage from "./pages/WelcomePage";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoutes from "./lib/ProtectedRoutes";
import ErrorPage from "./pages/ErrorPage";

// Per come è impostata la nostra app tutte le route devono stare dentro ad una route che fa da
// padre a tutte le altre senza aggiungere layout o path
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorPage />}>
      <Route path="/" element={<WelcomePage />} />
      {/* il layout wrappa tutte le route figlie, quindi basta mettere qui l'autenticazione */}
      <Route
        element={
          <ProtectedRoutes>
            <DashboardLayout />
          </ProtectedRoutes>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/pomodoro" element={<Home />} />
        <Route path="/calendar" element={<Home />} />
        <Route path="/notes" element={<Home />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Route>
  )
);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
