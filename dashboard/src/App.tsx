import DiagramContainer from "./components/DiagramContainer";
import { diagramConfig } from "./config/diagramConfig";
import "./diagram.css";

export default function App() {
  return <DiagramContainer config={diagramConfig} />;
}
