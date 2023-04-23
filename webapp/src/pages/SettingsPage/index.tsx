import ReloadPageButton from "../../components/ReloadPageButton";
import { Settings } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { assertNever } from "../../exhaustive-match";
import { findVersionHash } from "../../findVersion";
import { TextField } from "./TextField";
import { Card } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 0.5rem 0;
`;

const CustomCard = styled(Card)`
  margin: 1rem;
`;

interface SettingsPageProps {
  wipman: Wipman;
}
function SettingsPage({ wipman }: SettingsPageProps) {
  const [apiUrl, setApiUrl] = useState<string | undefined>();
  const [apiToken, setApiToken] = useState<string | undefined>();

  useEffect(() => {
    const subscription = wipman.settingsManager.change$.subscribe((change) => {
      switch (change.kind) {
        case "SettingsInitialized":
          setAllSettings(wipman.settingsManager.settings);
          break;
        case "ApiUrlUpdated":
          setApiUrl(change.value);
          break;
        case "ApiTokenUpdated":
          setApiToken(change.value);
          break;
        default:
          assertNever(change, `Unsupported SettingsChange variant: ${change}`);
      }
    });

    setAllSettings(wipman.settingsManager.settings);

    return subscription.unsubscribe;
  }, [wipman]);

  function setAllSettings(settings: Settings): void {
    const { apiUrl, apiToken } = settings;
    console.log("foo");
    setApiUrl(apiUrl);
    setApiToken(apiToken);
  }

  function handleApiUrlChange(newUrl?: string): void {
    setApiUrl(newUrl);
  }

  function handleApiUrlSubmit(): void {
    if (apiUrl === undefined) return;
    wipman.settingsManager.setApiUrl(apiUrl);
  }

  function handleApiTokenChange(newToken?: string): void {
    setApiToken(newToken);
  }

  function handleApiTokenSubmit(): void {
    if (apiToken === undefined) return;
    wipman.settingsManager.setApiToken(apiToken);
  }

  return (
    <Container>
      <CustomCard>
        <TextField
          label="API URL"
          value={apiUrl}
          onChange={handleApiUrlChange}
          onSubmit={handleApiUrlSubmit}
        />
        <TextField
          label="API token"
          value={apiToken}
          onChange={handleApiTokenChange}
          onSubmit={handleApiTokenSubmit}
        />
      </CustomCard>
      <CustomCard>
        <ReloadPageButton />
        <p>version: {findVersionHash()}</p>
      </CustomCard>
    </Container>
  );
}

export default SettingsPage;
