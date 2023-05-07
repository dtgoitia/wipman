import { View } from "../domain/types";
import { ViewManager } from "../domain/view";

// TODO: read this from storage
const SAMPLE_VIEWS: View[] = [
  {
    id: "0000000000",
    title: "backlog",
    tags: new Set(),
  },
  {
    id: "bpsahzuhou",
    title: "hiru",
    tags: new Set(["hiru", "yld"]),
  },
  {
    id: "zhdbkgwxtf",
    title: "health-tracker",
    tags: new Set(["health-tracker"]),
  },
];

const viewManager = new ViewManager({ views: SAMPLE_VIEWS });
export default viewManager;
