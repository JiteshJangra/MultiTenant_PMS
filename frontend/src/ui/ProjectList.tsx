import React from "react";
import { gql, useQuery } from "@apollo/client";

const GET_PROJECTS = gql`
  query GetProjects($org: String!) {
    projects(organizationSlug: $org) {
      id
      name
      description
      status
      taskCount
      completedTasks
      dueDate
    }
  }
`;

export default function ProjectList({ orgSlug }: { orgSlug: string }) {
    const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
        variables: { org: orgSlug }
    });

    if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
    if (error) return <p className="text-sm text-red-600">Error: {error.message}</p>;

    return (
        <div className="space-y-3">
            {(data?.projects ?? []).map((p: any) => (
                <div key={p.id} className="border rounded-xl p-3 hover:shadow transition">
                    <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.description}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{p.status}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        Tasks: {p.completedTasks}/{p.taskCount}
                    </div>
                    <div className="text-xs text-green-500">
                        Due Date: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "No due date"}
                    </div>
                </div>
            ))}
            <button onClick={() => refetch()} className="text-xs underline">Refresh</button>
        </div>
    );
}
