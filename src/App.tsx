import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Upload from "@/pages/Upload";
import Graph from "@/pages/Graph";
import Analytics from "@/pages/Analytics";
import Templates from "@/pages/Templates";
import ApiKeys from "@/pages/ApiKeys";
import Settings from "@/pages/Settings";
import Shipments from "@/pages/Shipments";
import ScheduleCalendar from "@/pages/ScheduleCalendar";
import DocumentPreview from "@/pages/DocumentPreview";
import Designer from "@/pages/Designer";
import SendRules from "@/pages/SendRules";
import BatchGenerate from "@/pages/BatchGenerate";
import ProcessingDetail from "@/pages/ProcessingDetail";
import DocumentTypes from "@/pages/DocumentTypes";
import ProcessProfiles from "@/pages/ProcessProfiles";
import Workflows from "@/pages/Workflows";
import Postprocessing from "@/pages/Postprocessing";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/graph" element={<ProtectedRoute><Graph /></ProtectedRoute>} />
      <Route path="/shipments" element={<ProtectedRoute><Shipments /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><ScheduleCalendar /></ProtectedRoute>} />
      <Route path="/preview" element={<ProtectedRoute><DocumentPreview /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/designer" element={<ProtectedRoute><Designer /></ProtectedRoute>} />
      <Route path="/send-rules" element={<ProtectedRoute><SendRules /></ProtectedRoute>} />
      <Route path="/batch" element={<ProtectedRoute><BatchGenerate /></ProtectedRoute>} />
      <Route path="/processing" element={<ProtectedRoute><ProcessingDetail /></ProtectedRoute>} />
      <Route path="/postprocessing" element={<ProtectedRoute><Postprocessing /></ProtectedRoute>} />
      <Route path="/document-types" element={<ProtectedRoute><DocumentTypes /></ProtectedRoute>} />
      <Route path="/process-profiles" element={<ProtectedRoute><ProcessProfiles /></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
      <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
}
