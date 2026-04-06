import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Upload from "@/pages/Upload";
import Graph from "@/pages/Graph";
import Analytics from "@/pages/Analytics";
import Templates from "@/pages/Templates";
import ApiKeys from "@/pages/ApiKeys";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/graph" element={<Graph />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/api-keys" element={<ApiKeys />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
