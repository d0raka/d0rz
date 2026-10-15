import "./styles.css";
import { initHero } from "./hero";
import { statusSource } from "./status/source";
import { initDesktop } from "./desktop";

initHero();
initDesktop(statusSource);
statusSource.start();
