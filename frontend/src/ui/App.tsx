import React, { useState } from "react";
import ProjectList from "./ProjectList";
import ProjectForm from "./ProjectForm";
import TaskBoard from "./TaskBoard";
import { ToastContainer } from "react-toastify";

export default function App() {
  const [orgSlug, setOrgSlug] = useState("test");

  return (
    <div className="max-w-8xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mini Project Management</h1>
        <div className="flex items-center gap-2">
          <input
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Organization Slug"
          />
        </div>
      </header>
<ToastContainer />
      <div className="grid md:grid-cols-2 gap-6">
        <section className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="font-semibold mb-3">Create Project</h2>
            <ProjectForm orgSlug={orgSlug} />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="font-semibold mb-3">Projects</h2>
            <ProjectList orgSlug={orgSlug} />
          </div>
        </section>
        <section className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-3">Tasks</h2>
          <TaskBoard orgSlug={orgSlug} />
        </section>
      </div>
    </div>
  );
}
