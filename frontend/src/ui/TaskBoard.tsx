import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GET_PROJECTS = gql`
  query GetProjects($org: String!) {
    projects(organizationSlug: $org) { id name }
  }
`;

const GET_TASKS = gql`
  query TasksByProject($org: String!, $pid: ID!) {
    tasksByProject(organizationSlug: $org, projectId: $pid) {
      id title description status assigneeEmail dueDate
      comments { id content authorEmail timestamp }
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($org: String!, $pid: ID!, $title: String!, $status: String!, $description: String, $assigneeEmail: String, $dueDate: DateTime) {
    createTask(organizationSlug: $org, projectId: $pid, title: $title, status: $status, description: $description, assigneeEmail: $assigneeEmail, dueDate: $dueDate) {
      task { id title status assigneeEmail description dueDate }
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($org: String!, $tid: ID!, $title: String, $status: String, $description: String, $assigneeEmail: String, $dueDate: DateTime) {
    updateTask(organizationSlug: $org, taskId: $tid, title: $title, description: $description, status: $status, assigneeEmail: $assigneeEmail, dueDate: $dueDate) {
      task { id title status description assigneeEmail dueDate }
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($org: String!, $tid: ID!, $content: String!, $author: String!) {
    addTaskComment(organizationSlug: $org, taskId: $tid, content: $content, authorEmail: $author) {
      comment { id content authorEmail timestamp }
    }
  }
`;

export default function TaskBoard({ orgSlug }: { orgSlug: string }) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "TODO", assigneeEmail: "", dueDate: "" });
  const [commentForm, setCommentForm] = useState({ taskId: "", content: "", authorEmail: "" });
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const projects = useQuery(GET_PROJECTS, { variables: { org: orgSlug } });
  const tasks = useQuery(GET_TASKS, { variables: { org: orgSlug, pid: projectId }, skip: !projectId });
  const [createTask] = useMutation(CREATE_TASK, { refetchQueries: ["TasksByProject"] });
  const [updateTask] = useMutation(UPDATE_TASK, { refetchQueries: ["TasksByProject"] });
  const [addComment] = useMutation(ADD_COMMENT, { refetchQueries: ["TasksByProject"] });

  const handleCreateTask = async () => {
    try {
      await createTask({ variables: { org: orgSlug, pid: projectId, ...taskForm, dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null } });
      toast.success("Task created successfully");
      setShowTaskForm(false);
      setTaskForm({ title: "", description: "", status: "TODO", assigneeEmail: "", dueDate: "" });
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleEditTask = async () => {
    try {
      await updateTask({ variables: { org: orgSlug, tid: editingTask.id, ...taskForm, dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString():null } });
      toast.success("Task updated successfully");
      setEditingTask(null);
      setShowTaskForm(false);
      setTaskForm({ title: "", description: "", status: "TODO", assigneeEmail: "", dueDate: "" });
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleAddComment = async () => {
    try {
      if (!commentForm.content || !commentForm.authorEmail) {
        toast.error("Comment content and author email are required");
        return;
      }
      if (!commentForm.taskId) {
        toast.error("No task selected for comment");
        return;
      }
      await addComment({ variables: { org: orgSlug, tid: commentForm.taskId, content: commentForm.content, author: commentForm.authorEmail } });
      toast.success("Comment added successfully");
      setShowCommentForm(false);
      setCommentForm({ taskId: "", content: "", authorEmail: "" });
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="space-y-1">
      <ToastContainer />
      <div className="flex gap-2 items-center">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={projectId ?? ""}
          onChange={(e) => setProjectId(e.target.value || null)}
        >
          <option value="">Select project</option>
          {(projects.data?.projects ?? []).map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button onClick={() => setShowTaskForm(true)} className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white">Add Task</button>
      </div>

      {!projectId ? (
        <p className="text-sm text-gray-500">Choose a project to see tasks.</p>
      ) : tasks.loading ? (
        <p className="text-sm text-gray-500">Loading tasks...</p>
      ) : tasks.error ? (
        <p className="text-sm text-red-600">Error: {tasks.error.message}</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-2">
          {["TODO", "IN_PROGRESS", "DONE"].map((col) => (
            <div key={col} className="bg-gray-50 border rounded-xl p-3">
              <div className="font-semibold text-sm mb-2">{col}</div>
              <div className="space-y-2 min-h-[80px]">
                {(tasks.data?.tasksByProject ?? []).filter((t: any) => t.status === col).map((t: any) => (
                  <div key={t.id} className="bg-white rounded-lg p-2 shadow flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">{t.title}</div>
                        <div className="text-xs text-green-500 break-all" title={t.assigneeEmail || "Unassigned"}>
                          {t.assigneeEmail || "Unassigned"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {t.description || "No description available"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Due Date: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingTask(t);
                          setTaskForm({
  ...t,
  dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : ""
});
                          setShowTaskForm(true);
                        }}
                        className="text-xs underline text-blue-600"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      {(t.comments ?? []).map((c: any) => (
                        <div key={c.id} className="text-xs text-gray-600 border-t pt-1">
                          <div className="font-medium text-red-300 break-all">{c.authorEmail}:</div> {c.content}
                          <div className="text-gray-400 text-[10px]">{new Date(c.timestamp).toLocaleString()}</div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setCommentForm({ ...commentForm, taskId: t.id });
                          setShowCommentForm(true);
                        }}
                        className="text-xs text-blue-600 underline"
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg space-y-3">
            <h3 className="text-lg font-semibold">{editingTask ? "Edit Task" : "Add Task"}</h3>
            <input
              type="text"
              placeholder="Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <textarea
              placeholder="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <select
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
            <input
              type="email"
              placeholder="Assignee Email"
              value={taskForm.assigneeEmail}
              onChange={(e) => setTaskForm({ ...taskForm, assigneeEmail: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <div className="flex items-center">
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm mx-4"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={editingTask ? handleEditTask : handleCreateTask}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg"
              >
                {editingTask ? "Update Task" : "Create Task"}
              </button>
              <button
                onClick={() => { setShowTaskForm(false); setEditingTask(null); }}
                className="px-3 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCommentForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded-lg space-y-3">
      <h3 className="text-lg font-semibold">Add Comment</h3>
      <textarea
        placeholder="Comment"
        value={commentForm.content}
        onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
        className="border rounded-lg px-3 py-2 w-full"
      />
      <input
        type="email"
        placeholder="Your Email"
        value={commentForm.authorEmail}
        onChange={(e) => setCommentForm({ ...commentForm, authorEmail: e.target.value })}
        className="border rounded-lg px-3 py-2 w-full"
      />
      <div className="flex gap-2">
        <button
          onClick={handleAddComment}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg"
        >
          Add Comment
        </button>
        <button
          onClick={() => setShowCommentForm(false)}
          className="px-3 py-2 bg-gray-300 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
