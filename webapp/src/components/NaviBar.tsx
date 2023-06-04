import Paths from "../routes";
import { TabMenu } from "primereact/tabmenu";
import { useLocation, useNavigate } from "react-router-dom";

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

function findTabByPath({ path }: { path: string }): Tab | undefined {
  console.debug(`${findTabByPath.name}::path:`, path);

  const matched = TABS.filter((tab) => tab.path === path);

  switch (matched.length) {
    case 0:
      console.debug(`No tabs matched '${path}' path`);
      return undefined;
    case 1:
      return matched[0];
    default:
      throw new Error(
        `${matched.length} tabs matched '${path}' path:` +
          ` ${JSON.stringify(matched)}`
      );
  }
}

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = findTabByPath({ path: location.pathname });

  function handleTabChange(i: TabIndex): void {
    const tab = TABS.filter((tab) => tab.index === i)[0];

    navigate(tab.path);
  }

  return (
    <TabMenu
      model={TABS.map((tab) => ({ label: tab.name }))}
      activeIndex={activeTab?.index}
      onTabChange={(event) => handleTabChange(event.index)}
    />
  );
}

export default NavBar;
