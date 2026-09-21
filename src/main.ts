import "./styles.css";
import { initHero } from "./hero";
import { initLiveSystem } from "./live-system";
import { statusSource } from "./status/source";

initHero();
initLiveSystem(statusSource);
statusSource.start();
