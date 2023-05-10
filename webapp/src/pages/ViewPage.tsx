import CenteredPage from "../components/CenteredPage";
import ListedTask from "../components/ListedTask";
import { OperationStatusChange } from "../domain/operations";
import { Task, View, ViewId } from "../domain/types";
import { INIT_OPERATION_ID, Wipman } from "../domain/wipman";
import { assertNever } from "../exhaustive-match";
import PageNotFound from "./PageNotFound";
import { useEffect, useState } from "react";
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

enum ShowSpinner {
  yes = "yes",
  no = "no",
  stayAsIs = "stayAsIs",
}

function shouldShowSpinner(change: OperationStatusChange): ShowSpinner {
  console.log(`ViewPage::shouldShowSpinner::change:`, change);
  switch (change.kind) {
    case "operation.started":
      return ShowSpinner.yes;
    case "operation.ended":
      return ShowSpinner.no;
    default:
      assertNever(change, `Unsupported OperationStatusChange: ${change}`);
  }
}

interface ViewPageProps {
  wipman: Wipman;
}
function ViewPage({ wipman }: ViewPageProps) {
  const [spinnerIsVisible, setSpinnerIsVisible] = useState<boolean>(true);

  // TODO: action: ?
  const params = useParams();
  const id = params.viewId as ViewId;

  useEffect(() => {
    const subscription = wipman.operationChange$.subscribe((status) => {
      switch (shouldShowSpinner(status)) {
        case ShowSpinner.yes:
          return setSpinnerIsVisible(true);
        case ShowSpinner.no:
          return setSpinnerIsVisible(false);
        case ShowSpinner.stayAsIs:
          return;
      }
    });

    if (wipman.isOperationCompleted({ id: INIT_OPERATION_ID })) {
      setSpinnerIsVisible(false);
    }

    return subscription.unsubscribe;
  }, [wipman]);

  if (spinnerIsVisible === true) {
    return <div>LOADING VIEW</div>;
  }

  const maybeView = wipman.getView({ id });
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
