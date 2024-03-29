import { useWipman } from "../..";
import InputText from "../../components/InputText";
import ReloadPageButton from "../../components/ReloadPageButton";
import { assertNever } from "../../exhaustive-match";
import { findVersionHash } from "../../findVersion";
import { Settings } from "../../lib/domain/types";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 0.5rem 0;
`;

const CustomCard = styled(Panel)`
  margin: 1rem;
`;

interface SettingsPageProps {}
function SettingsPage({}: SettingsPageProps) {
  const wipman = useWipman();

  const [apiUrl, setApiUrl] = useState<string | undefined>();
  const [apiToken, setApiToken] = useState<string | undefined>();

  useEffect(() => {
    const subscription = wipman.settingsManager.change$.subscribe((change) => {
      switch (change.kind) {
        case "SettingsInitialized":
          return setAllSettings(wipman.settingsManager.settings);
        case "ApiUrlUpdated":
          return setApiUrl(change.value);
        case "ApiUrlDeleted":
          return setApiUrl(undefined);
        case "ApiTokenUpdated":
          return setApiToken(change.value);
        case "ApiTokenDeleted":
          return setApiToken(undefined);
        default:
          assertNever(change, `Unsupported SettingsChange variant: ${change}`);
      }
    });

    setAllSettings(wipman.settingsManager.settings);

    return () => subscription.unsubscribe();
  }, [wipman]);

  function setAllSettings(settings: Settings): void {
    const { apiUrl, apiToken } = settings;
    setApiUrl(apiUrl);
    setApiToken(apiToken);
  }

  function handleApiUrlChange(newUrl?: string): void {
    setApiUrl(newUrl);
    wipman.settingsManager.setApiUrl(newUrl);
  }

  function handleApiTokenChange(newToken?: string): void {
    setApiToken(newToken);
    wipman.settingsManager.setApiToken(newToken);
  }

  function handlePushAllToRemote(): void {
    wipman.pushAllToRemote();
  }

  function handleDeleteTasks(): void {
    wipman.admin.deleteTasks();
    alert("Reload the app for changes to take effect");
  }

  function handleDeleteViews(): void {
    wipman.admin.deleteViews();
    alert("Reload the app for changes to take effect");
  }

  function handleRecomputeViews(): void {
    wipman.recompute();
  }

  return (
    <Container>
      <CustomCard>
        <InputText
          id="api-url"
          // label="API URL"
          value={apiUrl}
          placeholder="API URL"
          onChange={handleApiUrlChange}
        />
        <InputText
          id="api-token"
          // label="API token"
          value={apiToken}
          placeholder="API token"
          onChange={handleApiTokenChange}
        />
      </CustomCard>

      <CustomCard>
        <h3>Sync</h3>
        <Button onClick={handlePushAllToRemote}>Push all data to remote</Button>
      </CustomCard>

      <CustomCard>
        <h3>Admin</h3>
        <p>Be carefull, these commands can destroy data</p>
        <Button onClick={handleDeleteViews}>Delete Views</Button>
        <p> </p>
        <Button onClick={handleDeleteTasks}>Delete Tasks</Button>
        <p> </p>
        <Button onClick={handleRecomputeViews}>
          Recompute Tasks for all Views
        </Button>
      </CustomCard>

      <CustomCard>
        <ReloadPageButton />
        <p>version: {findVersionHash()}</p>
      </CustomCard>
    </Container>
  );
}

export default SettingsPage;
