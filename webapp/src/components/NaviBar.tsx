import Paths from "../routes";
import storage, { StorageStatus } from "../services/persist";
import {
  Alignment,
  Button,
  Intent,
  Navbar,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const SaveButtonContainer = styled.div`
  margin-right: 1rem;
`;

function SyncStatus() {
  const [status, setStatus] = useState<StorageStatus>(StorageStatus.SAVED);
  console.log(status);

  useEffect(() => {
    const subscription = storage.status$.subscribe((status) => {
      setStatus(status);
    });
    // TODO do this with all subscriptions
    return subscription.unsubscribe;
  }, []);

  function handleClick() {
    if (status === StorageStatus.DRAFT) {
      storage.save();
    }
  }

  if (status !== StorageStatus.DRAFT) {
    return (
      <SaveButtonContainer>
        <Button
          className="bp4-minimal"
          disabled={true}
          intent={Intent.NONE}
          onClick={handleClick}
        >
          {status}
        </Button>
      </SaveButtonContainer>
    );
  }

  return (
    <SaveButtonContainer>
      <Button
        icon="floppy-disk"
        disabled={false}
        intent={Intent.SUCCESS}
        onClick={handleClick}
      >
        {status}
      </Button>
    </SaveButtonContainer>
  );
}

function NavBar() {
  let navigate = useNavigate();
  const location = useLocation();

  function handleTabClick(rawPath: string): void {
    navigate(rawPath);
  }

  return (
    <Navbar>
      <Navbar.Group>
        <Navbar.Heading>wipman</Navbar.Heading>
      </Navbar.Group>

      <Navbar.Group align={Alignment.RIGHT}>
        {/*  */}
        <SyncStatus />
        <Tabs
          id="TabsExample"
          onChange={handleTabClick}
          selectedTabId={location.pathname}
        >
          <Tab id={`${Paths.root}`} title="Views" />
          <Tab id={`${Paths.tasks}`} title="Tasks" />
          <Tab id={`${Paths.settings}`} title="Settings" />
          <Tabs.Expander />
        </Tabs>
      </Navbar.Group>
    </Navbar>
  );
}

export default NavBar;
