import { View, ViewId } from "../domain/types";
import viewManager from "../services/views";
import PageNotFound from "./PageNotFound";
import { useParams } from "react-router-dom";

interface ViewDetailProps {
  view: View;
}
function ViewDetail({ view }: ViewDetailProps) {
  return (
    <div>
      View detail. ID: {view.id} -- Title: {view.title}
    </div>
  );
}

function ViewPage() {
  const params = useParams();
  const id = params.viewId as ViewId;

  const maybeView = viewManager.getView(id);
  if (maybeView === undefined) {
    console.warn(`No view found with ID: ${id}`);
    return <PageNotFound />;
  }

  const view = maybeView;

  return <ViewDetail view={view} />;
}

export default ViewPage;
