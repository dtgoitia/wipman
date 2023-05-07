import CenteredPage from "../components/CenteredPage";
import ListedTask from "../components/ListedTask";
import { Task, View, ViewId } from "../domain/types";
import viewManager from "../services/views";
import PageNotFound from "./PageNotFound";
import { useParams } from "react-router-dom";
import styled from "styled-components";

const ViewTitle = styled.h3``;

interface ViewDetailProps {
  view: View;
}
function ViewDetail({ view }: ViewDetailProps) {
  const tasks: Task[] = [];
  return (
    <ul>
      {tasks.map((task, i) => (
        <ListedTask
          task={task}
          key={task.id}
          onOpenTaskView={() => alert("onOpenTaskView: TODO")}
          onRemoveTask={() => alert("onRemoveTask: TODO")}
        />
      ))}
    </ul>
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

  return (
    <CenteredPage>
      <ViewTitle>{view.title}</ViewTitle>
      <ViewDetail view={view} />
    </CenteredPage>
  );
}

export default ViewPage;
