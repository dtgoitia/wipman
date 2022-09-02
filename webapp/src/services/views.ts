import { View } from "../domain/types";
import { ViewManager } from "../domain/view";

// TODO: read this from storage
const SAMPLE_VIEWS: View[] = [
  {
    id: "cccc",
    title: "HIRU related tasks",
    tags: new Set(["hiru"]),
  },
  {
    id: "ddd",
    title: "View with no tasks",
    tags: new Set(["nonexistenttag"]),
  },
];

const viewManager = new ViewManager({ views: SAMPLE_VIEWS });
export default viewManager;
