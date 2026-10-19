import "./App.css";
import "./shared/about.css";
import { AuthorAttribution } from "./shared/AuthorAttribution";
import HomeScreen from "./features/HomeScreen.tsx";
import AboutScreen from "./features/AboutScreen.tsx";
import RoomScreen from "./features/room/RoomScreen.tsx";
import MessageScreen from "./features/MessageScreen.tsx";
import Navbar from "./shared/Navbar.tsx";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { SocketProvider } from "./SocketProvider.tsx";
import { PlanningPokerStoreProvider } from "./state/PlanningPokerStoreProvider.tsx";

function Layout() {
  return (
    <div className="pp-app-shell">
      <Navbar />
      <Outlet />
      <footer className="app-footer"><AuthorAttribution /></footer>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "room/:roomId", element: <RoomScreen /> },
      { path: "message/:messageType", element: <MessageScreen /> },
      { path: "about", element: <AboutScreen /> },
      { path: "*", element: <HomeScreen /> },
    ],
  },
]);

function App() {
  return (
    <PlanningPokerStoreProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </PlanningPokerStoreProvider>
  );
}

export default App;
