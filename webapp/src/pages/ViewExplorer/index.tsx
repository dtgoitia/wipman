import AddView from "../../components/AddView";
import CenteredPage from "../../components/CenteredPage";
import { View, ViewId, ViewTitle } from "../../domain/types";
import { getViewPath } from "../../routes";
import viewManager from "../../services/views";
import { ViewSummary } from "./ViewSummary";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ViewExplorer() {
  const navigate = useNavigate();
  const [views, setViews] = useState<View[]>([]);
  // TODO: action: remove view

  useEffect(() => {
    const subscription = viewManager.views$.subscribe((views) => {
      const unsortedViews: View[] = [...views];
      setViews(unsortedViews);
    });
    return subscription.unsubscribe;
  }, []);

  function openView(id: ViewId) {
    navigate(getViewPath(id));
  }

  function addView(title: ViewTitle): void {
    viewManager.addView({ title });
  }

  if (viewManager.views.length === 0) {
    return (
      <CenteredPage>
        <div>No views here</div>
        <AddView onAdd={addView} />
      </CenteredPage>
    );
  }

  return (
    <CenteredPage>
      <ul>
        {views.map((view) => (
          <ViewSummary key={view.id} view={view} onOpenView={openView} />
        ))}
      </ul>
      <AddView onAdd={addView} />
    </CenteredPage>
  );
}

export default ViewExplorer;
