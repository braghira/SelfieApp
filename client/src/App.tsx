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
import WelcomePage from "./pages/WelcomePage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import ErrorPage from "./pages/ErrorPage";
import LoadingPage from "./pages/LoadingPage";
import Calendar from "./pages/Calendar";
import Notes from "./pages/Notes";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import Pomodoro from "./pages/Pomodoro";
import Account from "./pages/Account";
import TakeASelfie from "./pages/TakeASelfie";
// layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import SettingsLayout from "./layouts/SettingsLayout";

// Per come è impostata la nostra app tutte le route devono stare dentro ad una route che fa da
// padre a tutte le altre senza aggiungere layout o path
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<LoadingPage />} errorElement={<ErrorPage />}>
      <Route path="/" element={<WelcomePage />} />
      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardLayout />}>
          {/* App Views */}
          <Route path="/home" element={<Home />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/editor/:id?" element={<Editor />} />

          {/* Settings Pages */}
          <Route path="/settings" element={<SettingsLayout />}>
            <Route path="/settings/profile" element={<Profile />} />
            <Route path="/settings/account" element={<Account />} />
            <Route path="/settings/takeaselfie" element={<TakeASelfie />} />
          </Route>
        </Route>
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
