import ReloadPageButton from "../components/ReloadPageButton";
import { findVersionHash } from "../findVersion";
import styled from "styled-components";

const Container = styled.div`
  padding: 0.5rem 0;
`;

function SettingsPage() {
  return (
    <Container>
      <h1>Settings page</h1>
      <ReloadPageButton />
      <p>{findVersionHash()}</p>
    </Container>
  );
}

export default SettingsPage;
