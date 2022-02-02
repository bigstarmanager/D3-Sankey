import "./styles.css";
import { Sankey } from "./Sankey";
import SampleData from "./Sankey/giantRoute_1.json";

const displayData = JSON.stringify(SampleData, null, 2);

export default function App() {
  return (
    <div className="App">
      <h1>AAVE-DAI</h1>
      <h2>Giant Path</h2>

      <hr />

      <Sankey />

      <hr />

      <details>
        <summary>data</summary>
        <pre>{displayData}</pre>
      </details>
    </div>
  );
}
