import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CREATE_ORG = gql`
  mutation CreateOrg($name: String!, $slug: String!, $email: String!) {
    createOrganization(name: $name, slug: $slug, contactEmail: $email) {
      organization { id name slug }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $slug: String!,
    $name: String!,
    $status: String!,
    $description: String,
    $dueDate: Date
  ) {
    createProject(
      organizationSlug: $slug,
      name: $name,
      status: $status,
      description: $description,
      dueDate: $dueDate
    ) {
      project { id name status description dueDate }
    }
  }
`;

export default function ProjectForm({ orgSlug }: { orgSlug: string }) {
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); 

  const [createOrg, { loading: creatingOrg }] = useMutation(CREATE_ORG);
  const [createProject, { loading: creatingProject }] = useMutation(CREATE_PROJECT, {
    variables: { slug: orgSlug, name, status, description, dueDate }, 
  });

  const handleCreateOrg = async () => {
    try {
      await createOrg({ variables: { name: orgName, slug: orgSlug, email: orgEmail } });
      toast.success("Organization created!");
    } catch (error) {
      toast.error("Failed to create organization.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject();
      setName("");
      setDescription("");
      setDueDate(""); 
      toast.success("Project created!");
    } catch (error) {
      toast.error("Failed to create project.");
    }
  };

  return (
    <div className="space-y-4">      
      <div className="flex gap-2">
        <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-1/3" placeholder="Org Name" />
        <input value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-1/3" placeholder="Contact Email" />
        <button onClick={handleCreateOrg} disabled={creatingOrg} className="px-3 py-2 text-sm rounded-lg bg-black hover:bg-gray-600 text-white">
          {creatingOrg ? "Creating..." : "Create Org"}
        </button>
      </div>

      <form onSubmit={handleCreateProject} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-full" placeholder="Project name" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-full" placeholder="Description" />
        <div className="flex items-center gap-2">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm mr-5"
          />
        {/* </div>
        <div className="flex items-center gap-2"> */}
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ON_HOLD">ON_HOLD</option>
          </select>
          <button type="submit" disabled={creatingProject} className="px-5 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white">
            {creatingProject ? "Saving..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
