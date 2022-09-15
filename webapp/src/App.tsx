import "./App.css";
import CenteredPage from "./components/CenteredPage";
import NavBar from "./components/NaviBar";
import { BASE_URL } from "./constants";
// import ReloadPage from "./components/ReloadPage";
import PageNotFound from "./pages/PageNotFound";
import TaskExplorer from "./pages/TaskExplorer";
import TaskPage from "./pages/TaskPage";
import ViewExplorer from "./pages/ViewExplorer";
import ViewPage from "./pages/ViewPage";
import Paths from "./routes";
import {
  taskInitializationService,
  TaskInitializationStatus,
} from "./services/tasks";
import { Spinner, SpinnerSize } from "@blueprintjs/core";
import { useEffect, useState } from "react";
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

const FullPageVerticallyCentered = styled(FullPage)`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
`;

const SpinnerText = styled.p`
  margin: 1rem;
  font-size: large;
`;

function App() {
  const [initializationIsComplete, setInitializationIsComplete] =
    useState(false);

  useEffect(() => {
    const subscription = taskInitializationService.status$.subscribe(
      (status) => {
        if (status === TaskInitializationStatus.loadCompleted) {
          setInitializationIsComplete(true);
        }
      }
    );

    taskInitializationService.initialize();

    return subscription.unsubscribe;
  }, []);

  if (initializationIsComplete === false) {
    return (
      <FullPage>
        <FullPageVerticallyCentered>
          <CenteredPage>
            <Spinner />
            <SpinnerText>Loading data...</SpinnerText>
          </CenteredPage>
        </FullPageVerticallyCentered>
      </FullPage>
    );
  }

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
