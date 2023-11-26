import { useWipman } from "../..";
import CenteredPage from "../../components/CenteredPage";
import { assertNever } from "../../exhaustive-match";
import { OperationStatusChange } from "../../lib/domain/operations";
import { View, ViewId } from "../../lib/domain/types";
import { INIT_OPERATION_ID } from "../../lib/domain/wipman";
import PageNotFound from "../PageNotFound";
import { ViewDetail } from "./ViewDetail";
import { ViewTasks } from "./ViewTasks";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

interface Props {}
function ViewPage({}: Props) {
  const wipman = useWipman();

  const [spinnerIsVisible, setSpinnerIsVisible] = useState<boolean>(true);
  const [view, setView] = useState<View | undefined>();

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

    const viewSubscription = wipman.views$.subscribe(() => {
      setView(wipman.getView({ id }));
    });

    if (wipman.isOperationCompleted({ id: INIT_OPERATION_ID })) {
      setSpinnerIsVisible(false);
    }

    return () => {
      subscription.unsubscribe();
      viewSubscription.unsubscribe();
    };
  }, [wipman]);

  function handleViewUpdate({ view }: { view: View }): void {
    wipman.updateView({ view });
  }

  if (spinnerIsVisible === true) {
    return <div>LOADING VIEW</div>;
  }

  if (view === undefined) {
    console.warn(`No view found with ID: ${id}`);
    return <PageNotFound />;
  }

  return (
    <CenteredPage>
      <ViewDetail viewId={view.id} />
      <ViewTasks view={view} onViewUpdate={handleViewUpdate} />
    </CenteredPage>
  );
}

export default ViewPage;
