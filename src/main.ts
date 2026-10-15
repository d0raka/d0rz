import "./styles.css";
import { initHero } from "./hero";
import { initLiveSystem } from "./live-system";
import { statusSource } from "./status/source";
import { initDesktop } from "./desktop";

initHero();
initLiveSystem(statusSource);
initDesktop(statusSource);
statusSource.start();
