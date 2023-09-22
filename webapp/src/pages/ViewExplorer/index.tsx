import AddView from "../../components/AddView";
import CenteredPage from "../../components/CenteredPage";
import { View, ViewId, ViewTitle } from "../../lib/domain/types";
import { Wipman } from "../../lib/domain/wipman";
import { getViewPath } from "../../routes";
import { ViewSummary } from "./ViewSummary";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Toolbar = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
  gap: 1rem;
`;

interface Props {
  wipman: Wipman;
}

function ViewExplorer({ wipman }: Props) {
  const navigate = useNavigate();
  const [views, setViews] = useState<View[]>([]);

  useEffect(() => {
    const subscription = wipman.views$.subscribe((views) => {
      const unsortedViews: View[] = [...views.values()];
      setViews(unsortedViews);
    });
    return () => subscription.unsubscribe();
  }, [wipman]);

  function openView(id: ViewId): void {
    navigate(getViewPath(id));
  }

  function addView(title: ViewTitle): void {
    wipman.addView({ title });
  }

  if (views.length === 0) {
    return (
      <CenteredPage>
        <div>No views here</div>
        <AddView onAdd={addView} />
      </CenteredPage>
    );
  }

  return (
    <CenteredPage>
      <Toolbar>
        <AddView onAdd={addView} />
      </Toolbar>

      <ul>
        {views.map((view) => (
          <ViewSummary
            key={view.id}
            wipman={wipman}
            view={view}
            onClick={() => openView(view.id)}
          />
        ))}
      </ul>
    </CenteredPage>
  );
}

export default ViewExplorer;
