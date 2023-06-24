import Paths from "../routes";
import { MegaMenu } from "primereact/megamenu";
import { MenuItem } from "primereact/menuitem";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

type TabIndex = number;
interface Tab {
  name: string;
  path: Paths;
  index: TabIndex;
}

const TABS: Tab[] = [
  { name: "Views", path: Paths.views },
  { name: "Tasks", path: Paths.tasks },
  { name: "Settings", path: Paths.settings },
].map((item, index) => ({ ...item, index }));

function findTabByPath({ path }: { path: string }): TabIndex | undefined {
  console.debug(`${findTabByPath.name}::path:`, path);

  const matched = TABS.filter((tab) => tab.path === path);

  switch (matched.length) {
    case 0:
      console.debug(`No tabs matched '${path}' path`);
      return undefined;
    case 1:
      return matched[0].index;
    default:
      throw new Error(
        `${matched.length} tabs matched '${path}' path:` +
          ` ${JSON.stringify(matched)}`
      );
  }
}

const Container = styled.div`
  display: flex;
`;

const Header = styled.div`
  display: flex;
  width: 5rem;

  justify-content: center;
`;

const Menu = styled.div`
  flex-basis: auto;
  flex-grow: 1;
`;

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = findTabByPath({ path: location.pathname });

  function isActive(tab: Tab): boolean {
    return tab.index === activeTab;
  }

  const items: MenuItem[] = TABS.map((tab) => ({
    label: tab.name,
    style: isActive(tab)
      ? {
          fontWeight: 1000,
          borderBottom: "2px solid rgba(255,255,255,0.5)",
        }
      : undefined,
    command: () => navigate(tab.path),
  }));

  return (
    <Container>
      <Menu>
        <MegaMenu
          model={items}
          breakpoint={`400px`}
          end={<Header onClick={() => navigate(Paths.root)}>wipman</Header>}
        />
      </Menu>
    </Container>
  );
}

export default NavBar;
