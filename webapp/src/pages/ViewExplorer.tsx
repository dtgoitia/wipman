import AddView from "../components/AddView";
import CenteredPage from "../components/CenteredPage";
import { View, ViewId } from "../domain/types";
import { getViewPath } from "../routes";
import viewManager from "../services/views";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SingleViewProps {
  view: View;
  onOpenView: (id: ViewId) => void;
}
function SingleView({ view, onOpenView }: SingleViewProps) {
  // TODO: add styles
  // TODO: display - view metadata
  // TODO: action - edit metadata
  // TODO: display - tasks filtered by view.tags
  return (
    <div onClick={() => onOpenView(view.id)}>
      {view.id} {view.title}
    </div>
  );
}
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

  function addView(title: string): void {
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
      <div>ViewExplorer</div>
      <ul>
        {views.map((view) => (
          <SingleView key={view.id} view={view} onOpenView={openView} />
        ))}
      </ul>
      <AddView onAdd={addView} />
    </CenteredPage>
  );
}

export default ViewExplorer;
