import CenteredPage from "./components/CenteredPage";
import { ErrorPanel } from "./components/ErrorPanel";
// import ReloadPage from "./components/ReloadPage";
import NavBar from "./components/NaviBar";
import { BASE_URL } from "./constants";
import { Wipman, WipmanStatus } from "./lib/domain/wipman";
import PageNotFound from "./pages/PageNotFound";
import SettingsPage from "./pages/SettingsPage";
import TaskExplorer from "./pages/TaskExplorer";
import TaskPage from "./pages/TaskPage";
import ViewExplorer from "./pages/ViewExplorer";
import ViewPage from "./pages/ViewPage";
import Paths from "./routes";
import { ProgressSpinner } from "primereact/progressspinner";
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

function App({ wipman }: { wipman: Wipman }) {
  const [initializationIsComplete, setInitializationIsComplete] =
    useState(false);

  useEffect(() => {
    const subscription = wipman.status$.subscribe((status) => {
      console.log(`App.useEffect::Wipman.status$: ${status}`);
      switch (status) {
        case WipmanStatus.InitStarted:
          setInitializationIsComplete(false);
          break;
        case WipmanStatus.InitCompleted:
          setInitializationIsComplete(true);
          break;
        default:
          break;
      }
    });

    wipman
      .initialize()
      .then(() => console.log("App.useEffect.wipman.init completed"));

    return () => subscription.unsubscribe();
  }, [wipman]);

  if (initializationIsComplete === false) {
    return (
      <FullPage>
        <ErrorPanel wipman={wipman} />
        <FullPageVerticallyCentered>
          <CenteredPage>
            <ProgressSpinner />
            <SpinnerText>Loading data...</SpinnerText>
          </CenteredPage>
        </FullPageVerticallyCentered>
      </FullPage>
    );
  }

  return (
    <BrowserRouter basename={BASE_URL}>
      <FullPage>
        <ErrorPanel wipman={wipman} />
        <NavBar />
        <ScrollableSectionBellowNavBar>
          <Routes>
            <Route
              path={Paths.root}
              element={<ViewExplorer wipman={wipman} />}
            />
            <Route
              path={Paths.tasks}
              element={<TaskExplorer wipman={wipman} />}
            />
            <Route path={Paths.task} element={<TaskPage wipman={wipman} />} />
            <Route
              path={Paths.views}
              element={<ViewExplorer wipman={wipman} />}
            />
            <Route path={Paths.view} element={<ViewPage wipman={wipman} />} />
            <Route
              path={Paths.settings}
              element={<SettingsPage wipman={wipman} />}
            />
            <Route path={Paths.notFound} element={<PageNotFound />} />
          </Routes>
        </ScrollableSectionBellowNavBar>
      </FullPage>
    </BrowserRouter>
  );
}

export default App;
