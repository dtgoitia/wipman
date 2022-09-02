import "./App.css";
import NavBar from "./components/NaviBar";
import { BASE_URL } from "./constants";
import storage from "./localStorage";
// import ReloadPage from "./components/ReloadPage";
import PageNotFound from "./pages/PageNotFound";
import TaskExplorer from "./pages/TaskExplorer";
import TaskPage from "./pages/TaskPage";
import ViewExplorer from "./pages/ViewExplorer";
import ViewPage from "./pages/ViewPage";
import Paths from "./routes";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import styled from "styled-components";

const navBarHeight = "50px";
const ScrollableSectionBellowNavBar = styled.div`
  height: calc(100vh - ${navBarHeight});
  overflow-y: scroll;
`;

const FullPage = styled.div`
  height: 100vh;
`;

function App() {
  return (
    <BrowserRouter basename={BASE_URL}>
      <FullPage>
        <NavBar />
        <ScrollableSectionBellowNavBar>
          <Routes>
            <Route path={Paths.root} element={<ViewExplorer />} />
            <Route path={Paths.tasks} element={<TaskExplorer />} />
            <Route path={Paths.task} element={<TaskPage />} />
            {/* https://reactrouter.com/en/v6.3.0/getting-started/overview#configuring-routes */}
            <Route path={Paths.views} element={<ViewExplorer />} />
            <Route path={Paths.view} element={<ViewPage />} />
            {/* <Route path={Paths.settings} element={<SettingsPage />} /> */}
            <Route path={Paths.notFound} element={<PageNotFound />} />
          </Routes>
        </ScrollableSectionBellowNavBar>
      </FullPage>
    </BrowserRouter>
  );
}

export default App;
