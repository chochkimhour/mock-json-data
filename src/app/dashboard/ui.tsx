"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Copy,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Moon,
  Plus,
  Sun,
  Trash2,
  Upload,
  Braces,
  X,
} from "lucide-react";
type Project = {
  id: string;
  publicId: string;
  owner: { apiKey: string | null };
  slug: string | null;
  name: string;
  description: string | null;
  visibility: string;
  updatedAt: string;
  expiresAt: string | null;
  _count: { endpoints: number; logs: number };
};
type Endpoint = {
  id: string;
  name: string;
  method: string;
  path: string;
  statusCode: number;
  responseBody: unknown;
};
const methodStyle: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-300",
  POST: "bg-sky-500/15 text-sky-300",
  PUT: "bg-amber-500/15 text-amber-300",
  PATCH: "bg-violet-500/15 text-violet-300",
  DELETE: "bg-red-500/15 text-red-300",
};
function resourceName(path: string) {
  return path.split("/").filter(Boolean)[0]?.replace(/[-_]/g, " ") ?? "root";
}
export default function Dashboard({ displayName }: { displayName: string }) {
  const [projects, setProjects] = useState<Project[]>([]),
    [apiKey, setApiKey] = useState<string | null>(null),
    [name, setName] = useState(""),
    [projectSearch, setProjectSearch] = useState(""),
    [selected, setSelected] = useState<Project | null>(null),
    [endpoints, setEndpoints] = useState<Endpoint[]>([]),
    [resource, setResource] = useState<string | null>(null),
    [method, setMethod] = useState<string | null>(null),
    [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null),
    [message, setMessage] = useState(""),
    [theme, setTheme] = useState<"dark" | "light">("dark"),
    [scrolled, setScrolled] = useState(false),
    [deleteTarget, setDeleteTarget] = useState<Project | null>(null),
    [endpointDeleteTarget, setEndpointDeleteTarget] = useState<Endpoint | null>(
      null,
    ),
    [confirmApiKeyDelete, setConfirmApiKeyDelete] = useState(false),
    [showApiKey, setShowApiKey] = useState(false),
    [showTop, setShowTop] = useState(false);
  const responseRef = useRef<HTMLTextAreaElement>(null);
  const jsonFileRef = useRef<HTMLInputElement>(null);
  const load = async () => {
    const response = await fetch("/api/projects");
    const data = await response.json();
    setProjects(data);
    if (data[0]?.owner?.apiKey) setApiKey(data[0].owner.apiKey);
  };
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setShowTop(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);
  useEffect(() => {
    const next =
      window.localStorage.getItem("mock-json-theme") === "light"
        ? "light"
        : "dark";
    setTheme(next);
    document.body.classList.toggle("light", next === "light");
  }, []);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.classList.toggle("light", next === "light");
    window.localStorage.setItem("mock-json-theme", next);
  }
  useEffect(() => {
    if (!selected) {
      setEndpoints([]);
      setSelectedEndpoint(null);
      return;
    }
    fetch("/api/projects/" + selected.id + "/endpoints")
      .then((response) => response.json())
      .then((data) => setEndpoints(Array.isArray(data) ? data : []));
  }, [selected]);
  async function create() {
    if (!name.trim()) return;
    const r = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, visibility: "PUBLIC" }),
    });
    if (r.ok) {
      setName("");
      void load();
      setMessage("Project created.");
    }
  }
  async function endpoint(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    let responseBody;
    try {
      responseBody = JSON.parse(String(f.get("responseBody")));
    } catch {
      setMessage("Response must be valid JSON.");
      return;
    }
    const r = await fetch(`/api/projects/${selected.id}/endpoints`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpointId: selectedEndpoint?.id,
        name: f.get("endpointName"),
        method: f.get("method"),
        path: f.get("path"),
        statusCode: 200,
        responseBody,
        responseHeaders: {},
        delayMs: 0,
        enabled: true,
        mode: "STATIC",
      }),
    });
    if (!r.ok) {
      setMessage((await r.json()).error);
      return;
    }
    const saved = await r.json();
    setEndpoints((current) =>
      selectedEndpoint
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [...current, saved].sort((a, b) => a.path.localeCompare(b.path)),
    );
    setResource(resourceName(saved.path));
    setMethod(saved.method);
    setSelectedEndpoint(saved);
    setMessage(selectedEndpoint ? "Endpoint updated." : "Endpoint added.");
    form.reset();
  }
  async function deleteProject() {
    if (
      !selected ||
      !window.confirm(`Delete ${selected.name} and all its endpoints?`)
    )
      return;
    const response = await fetch(`/api/projects/${selected.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setSelected(null);
      setMessage("Project deleted.");
      void load();
    } else setMessage("Could not delete this project.");
  }
  async function deleteEndpoint() {
    if (!selected || !endpointDeleteTarget) return;
    const response = await fetch(
      "/api/projects/" + selected.id + "/endpoints/" + endpointDeleteTarget.id,
      { method: "DELETE" },
    );
    if (response.ok) {
      setEndpoints((items) =>
        items.filter((item) => item.id !== endpointDeleteTarget.id),
      );
      setSelectedEndpoint(null);
      setEndpointDeleteTarget(null);
      setMessage("Endpoint deleted.");
    }
  }
  async function copyUrl(url: string) {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith("/api/")) {
      parsed.pathname =
        "/api" +
        (parsed.pathname.startsWith("/")
          ? parsed.pathname
          : "/" + parsed.pathname);
    }
    await navigator.clipboard.writeText(parsed.toString());
    setMessage("Endpoint URL copied.");
  }
  const resources = Array.from(
    new Set(endpoints.map((item) => resourceName(item.path))),
  );
  const getEndpoints = endpoints.filter((item) => item.method === "GET");
  const visibleEndpoints = resource
    ? getEndpoints.filter((item) => resourceName(item.path) === resource)
    : getEndpoints;
  const filteredEndpoints = method
    ? visibleEndpoints.filter((item) => item.method === method)
    : visibleEndpoints;
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(projectSearch.trim().toLowerCase()),
  );
  return (
    <>
      <main className="dashboard-frame relative mx-auto flex min-h-screen w-full max-w-5xl flex-col border-x border-zinc-700/60 px-4 pb-2 pt-24 sm:px-8 sm:pb-3 sm:pt-24">
        <header
          className={
            "fixed left-1/2 top-3 z-50 flex w-[calc(100%-1.5rem)] max-w-[60rem] -translate-x-1/2 items-center justify-between gap-2 rounded-2xl border border-indigo-300/40 bg-zinc-900/45 px-3 shadow-xl shadow-black/20 transition-all duration-300 sm:top-4 sm:w-[calc(100%-4rem)] sm:px-5 " +
            (scrolled
              ? "bg-zinc-900/35 py-2 backdrop-blur-2xl shadow-2xl"
              : "py-2.5 backdrop-blur-lg sm:py-3")
          }
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 place-items-center overflow-hidden rounded-lg bg-white">
              <img
                src="/mock-json-logo.svg"
                alt="Mock JSON Data"
                className="size-8 object-contain"
              />
            </span>
            <span
              title={displayName}
              className="max-w-[7rem] truncate text-sm font-semibold text-zinc-200 sm:max-w-[14rem]"
            >
              {displayName}
            </span>
          </div>
          <span
            title="Mock JSON Data"
            className="group absolute left-1/2 hidden -translate-x-1/2 cursor-pointer text-sm tracking-tight transition-colors hover:text-indigo-300 sm:block sm:text-xl"
          >
            <span>
              <b>Mock JSON Data</b>
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="border border-zinc-700 p-2"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() =>
                fetch("/api/auth/logout", { method: "POST" }).then(
                  () => (location.href = "/"),
                )
              }
              className="border border-zinc-700 px-2.5 py-2 text-xs hover:border-red-400 hover:bg-red-500/10 hover:text-red-300 sm:px-3 sm:text-sm"
            >
              Log out
            </button>
          </div>
        </header>
        <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-stretch">
          <section className="lg:sticky lg:top-24 lg:self-start lg:min-h-full lg:border-r lg:border-zinc-700/60 lg:pr-6">
            <p className="muted text-xs font-semibold uppercase tracking-[0.18em]">
              Workspace
            </p>
            <div className="border-b-2 border-zinc-700 pb-4">
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Your APIs
              </h1>
              <p className="muted mt-2 text-xs">
                Collections, resources, and routes
              </p>
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 p-2.5 text-xs leading-5 text-amber-200">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-amber-400/15 text-amber-300">
                  <Info size={12} aria-hidden="true" />
                </span>
                <p>
                  <span className="font-semibold text-amber-300">Note</span>
                  <span className="mx-1 text-amber-500/60">·</span>APIs are
                  automatically deleted 30 days after creation.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Your API key
              </p>
              <p className="muted mt-1 text-xs">
                Use this key for all your mock APIs.
              </p>
              <div className="mt-2 min-w-0 max-w-full overflow-hidden">
                <code className="block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-amber-100">
                  {apiKey
                    ? showApiKey
                      ? apiKey
                      : "*".repeat(apiKey.length)
                    : "No API key"}
                </code>
              </div>
              <div className="mt-2 flex flex-nowrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 border border-amber-500/40 px-2 py-1 text-xs"
                  onClick={async () => {
                    const response = await fetch("/api/auth/api-key", {
                      method: "POST",
                    });
                    if (!response.ok) {
                      const body = await response.json().catch(() => null);
                      setMessage(body?.error ?? "Could not generate API key.");
                      return;
                    }
                    const generated = await response.json();
                    setApiKey(generated.apiKey);
                    await load();
                    setMessage("API key generated.");
                  }}
                >
                  <KeyRound size={13} />
                  Generate
                </button>
                <button
                  type="button"
                  title={showApiKey ? "Hide API key" : "Show API key"}
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                  disabled={!apiKey}
                  className="inline-flex h-7 w-7 min-w-7 max-w-7 shrink-0 items-center justify-center border border-amber-500/40 p-0"
                  onClick={() => setShowApiKey((value) => !value)}
                >
                  {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  type="button"
                  title="Copy API key"
                  aria-label="Copy API key"
                  disabled={!apiKey}
                  className="inline-flex size-7 items-center justify-center border border-amber-500/40"
                  onClick={() =>
                    apiKey &&
                    navigator.clipboard
                      .writeText(apiKey)
                      .then(() => setMessage("API key copied."))
                  }
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  title="Delete API key"
                  aria-label="Delete API key"
                  disabled={!apiKey}
                  className="inline-flex size-7 items-center justify-center border border-red-500/40 text-red-300"
                  onClick={() => setConfirmApiKeyDelete(true)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex w-full max-w-md items-center gap-2">
              <input
                className="min-w-0 flex-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter API name"
              />
              <button
                className="btn inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap"
                onClick={create}
              >
                <Plus size={15} aria-hidden="true" />
                Create
              </button>
            </div>
            {projects.length > 0 && (
              <input
                value={projectSearch}
                onChange={(event) => setProjectSearch(event.target.value)}
                placeholder="Search projects"
                aria-label="Search projects"
                className="mt-3 w-full"
              />
            )}
            <div className="thin-scrollbar project-list-scroll -my-2 mt-5 grid max-h-[620px] gap-3 overflow-y-auto px-1 py-2">
              {projects.length === 0 && (
                <div className="panel p-5">
                  <b>No APIs yet.</b>
                  <p className="muted mt-1 text-sm">
                    Create an API, then add users, products, or orders.
                  </p>
                </div>
              )}
              {projects.length > 0 && filteredProjects.length === 0 && (
                <div className="panel p-5 text-center">
                  <b>No projects found.</b>
                  <p className="muted mt-1 text-sm">
                    Try a different project name.
                  </p>
                </div>
              )}
              {filteredProjects.map((p) => (
                <div
                  className={
                    "panel project-card flex items-center gap-3 p-3 hover:border-orange-500 " +
                    (selected?.id === p.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "")
                  }
                  key={p.id}
                >
                  <button
                    onClick={() => {
                      setSelected(p);
                      setResource(null);
                      setMethod(null);
                      setSelectedEndpoint(null);
                    }}
                    className="min-w-0 flex-1 text-left focus:outline-none focus:ring-0"
                  >
                    <b>{p.name}</b>
                    <p className="muted mt-1 text-sm">
                      {p._count.endpoints} endpoints ·{" "}
                      {p.visibility.toLowerCase()}
                    </p>
                    <p className="muted mt-1 text-[11px]">
                      Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    type="button"
                    title={"Delete " + p.name}
                    aria-label={"Delete " + p.name}
                    onClick={() => {
                      setDeleteTarget(p);
                    }}
                    className="shrink-0 rounded p-2 text-zinc-500 hover:bg-red-950 hover:text-red-300"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="panel relative min-h-0 min-w-0 p-4 sm:min-h-[620px] sm:p-8">
            {selected ? (
              <>
                <p className="muted text-xs font-semibold uppercase tracking-wider">
                  Mock API
                </p>
                <h2 className="mt-1 break-words text-2xl font-bold">
                  {selected.name}
                </h2>
                <div className="mt-4 rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    Your API endpoint URL
                  </p>
                  <div className="mt-2 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <code className="min-w-0 flex-1 break-all text-sm text-indigo-100">
                      {location.origin}/api/{selected.slug ?? selected.publicId}
                      {selectedEndpoint?.path ?? ""}
                    </code>
                    <button
                      type="button"
                      className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400 sm:w-auto"
                      onClick={() =>
                        copyUrl(
                          location.origin +
                            "/api/" +
                            (selected.slug ?? selected.publicId) +
                            (selectedEndpoint?.path ?? ""),
                        )
                      }
                    >
                      <Copy size={15} aria-hidden="true" />
                      Copy
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="hidden"
                    onClick={() =>
                      copyUrl(
                        `${location.origin}/${selected.slug ?? `m/${selected.publicId}`}/users`,
                      )
                    }
                  >
                    <img src="/json-svg.svg" alt="" className="size-4" />
                    Copy
                  </button>
                </div>
                <div className="mt-6 grid gap-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">Resources & endpoints</h3>
                        <p className="muted mt-1 text-sm">
                          Endpoints are grouped by their first URL segment.
                        </p>
                      </div>
                      <span className="muted text-sm">
                        {endpoints.length} endpoint
                        {endpoints.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setResource(null)}
                        className={
                          "border px-3 py-1.5 text-sm " +
                          (!resource
                            ? "border-indigo-400 bg-indigo-500/15 text-indigo-200"
                            : "border-zinc-700")
                        }
                      >
                        All
                      </button>
                      {resources.map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setResource(item)}
                          className={
                            "border px-3 py-1.5 text-sm capitalize " +
                            (resource === item
                              ? "border-indigo-400 bg-indigo-500/15 text-indigo-200"
                              : "border-zinc-700")
                          }
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="muted self-center text-xs font-semibold uppercase tracking-wider">
                        Method
                      </span>
                      {["GET"].map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() =>
                            setMethod(method === item ? null : item)
                          }
                          className={
                            "rounded border px-3 py-1.5 text-xs font-bold " +
                            (method === item
                              ? "border-indigo-400 bg-indigo-500/15 text-indigo-200"
                              : methodStyle[item])
                          }
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800">
                      {filteredEndpoints.length ? (
                        filteredEndpoints.map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setSelectedEndpoint(item)}
                            className={
                              "flex w-full items-center gap-3 border-b border-zinc-800 px-4 py-3 text-left last:border-0 hover:bg-zinc-800/50 " +
                              (selectedEndpoint?.id === item.id
                                ? "bg-indigo-500/10"
                                : "")
                            }
                          >
                            <span
                              className={
                                "rounded px-2 py-1 text-xs font-bold " +
                                (methodStyle[item.method] ?? "bg-zinc-700")
                              }
                            >
                              {item.method}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-mono text-sm">
                                {item.path}
                              </p>
                              <p className="muted truncate text-xs">
                                {item.name}
                              </p>
                            </div>
                            <span className="muted text-xs">
                              {item.statusCode}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="muted px-4 py-10 text-center text-sm">
                          No matching endpoints yet. Add a route below.
                        </div>
                      )}
                    </div>
                    {selectedEndpoint && (
                      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              "rounded px-2 py-1 text-xs font-bold " +
                              (methodStyle[selectedEndpoint.method] ??
                                "bg-zinc-700")
                            }
                          >
                            {selectedEndpoint.method}
                          </span>
                          <code className="min-w-0 break-all text-sm">
                            {selectedEndpoint.path}
                          </code>
                          <span className="muted ml-auto text-xs">
                            Status {selectedEndpoint.statusCode}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="muted text-xs font-semibold uppercase tracking-wider">
                            Response data
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setEndpointDeleteTarget(selectedEndpoint)
                            }
                            title="Delete endpoint"
                            aria-label="Delete endpoint"
                            className="inline-flex items-center gap-1.5 rounded border border-red-900/70 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-950"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                        <pre className="thin-scrollbar mt-2 max-h-72 overflow-auto rounded bg-zinc-950 p-3 text-xs text-zinc-300">
                          {JSON.stringify(
                            selectedEndpoint.responseBody,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                  <form
                    onSubmit={endpoint}
                    className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4"
                  >
                    <div>
                      <h3 className="font-semibold">Add GET endpoint</h3>
                      <p className="muted mt-1 text-sm">
                        Use <code>/users</code> for a collection or{" "}
                        <code>/users/:id</code> for one item.
                      </p>
                    </div>
                    <input
                      name="endpointName"
                      placeholder="Endpoint name, e.g. List users"
                      defaultValue={selectedEndpoint?.name ?? ""}
                      required
                    />
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="method" value="GET" />
                      <span className="inline-flex w-full items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 sm:w-auto">
                        GET
                      </span>
                      <input
                        className="min-w-0 flex-1"
                        name="path"
                        defaultValue={selectedEndpoint?.path ?? ""}
                        placeholder="/users"
                        required
                      />
                    </div>
                    <textarea
                      ref={responseRef}
                      name="responseBody"
                      className="thin-scrollbar min-h-44 font-mono"
                      defaultValue={JSON.stringify(
                        {
                          status: 200,
                          success: true,
                          message: "Request successful",
                          data: {},
                          timestamp: "{{datetime}}",
                        },
                        null,
                        2,
                      )}
                    />
                    <div className="flex flex-nowrap gap-1 sm:gap-2">
                      <input
                        ref={jsonFileRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (!file || !responseRef.current) return;
                          if (file.size > 2_000_000) {
                            setMessage("JSON file must be smaller than 2 MB.");
                            return;
                          }
                          try {
                            const parsed = JSON.parse(await file.text());
                            responseRef.current.value = JSON.stringify(
                              parsed,
                              null,
                              2,
                            );
                            setMessage("JSON imported.");
                          } catch {
                            setMessage("The selected file is not valid JSON.");
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="order-2 inline-flex min-w-0 flex-1 items-center justify-center gap-1 border border-zinc-700 px-1.5 py-2 text-[11px] whitespace-nowrap sm:gap-1.5 sm:px-3 sm:text-sm"
                        onClick={() => jsonFileRef.current?.click()}
                      >
                        <Upload size={15} aria-hidden="true" />
                        Import JSON
                      </button>
                      <button
                        type="button"
                        className="order-1 inline-flex min-w-0 flex-1 items-center justify-center gap-1 border border-zinc-700 px-1.5 py-2 text-[11px] whitespace-nowrap sm:gap-1.5 sm:px-3 sm:text-sm"
                        onClick={() => {
                          const example = {
                            status: 200,
                            success: true,
                            message: "Request successful",
                            data: {},
                            timestamp: "{{datetime}}",
                          };
                          const url = URL.createObjectURL(
                            new Blob([JSON.stringify(example, null, 2)], {
                              type: "application/json",
                            }),
                          );
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = "mock-api-example.json";
                          link.click();
                          URL.revokeObjectURL(url);
                          setMessage("Example JSON downloaded.");
                        }}
                      >
                        <Download size={15} aria-hidden="true" />
                        Download JSON
                      </button>
                      <button
                        type="button"
                        className="order-3 inline-flex min-w-0 flex-1 items-center justify-center gap-1 border border-zinc-700 px-1.5 py-2 text-[11px] whitespace-nowrap sm:gap-1.5 sm:px-3 sm:text-sm"
                        onClick={() => {
                          if (!responseRef.current) return;
                          try {
                            responseRef.current.value = JSON.stringify(
                              JSON.parse(responseRef.current.value),
                              null,
                              2,
                            );
                            setMessage("JSON formatted.");
                          } catch {
                            setMessage(
                              "Response must be valid JSON before formatting.",
                            );
                          }
                        }}
                      >
                        <Braces size={15} aria-hidden="true" />
                        Format JSON
                      </button>
                    </div>
                    <button className="btn">
                      {selectedEndpoint ? "Update endpoint" : "Add endpoint"}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="muted flex min-h-[520px] w-full items-center justify-center py-20 text-center">
                <div className="mx-auto translate-y-8 rounded-2xl border border-dashed border-indigo-400/30 bg-indigo-500/5 px-8 py-10 text-center">
                  Select a project to create and test endpoints.
                </div>
              </div>
            )}
            {message && typeof document !== "undefined"
              ? createPortal(
                  <div
                    className="fixed bottom-5 right-4 top-auto z-50 w-auto max-w-[calc(100%-2rem)] sm:bottom-6 sm:right-6 sm:max-w-sm"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="dashboard-toast flex w-fit max-w-full items-start gap-3 rounded-xl border border-emerald-400/30 bg-zinc-900/95 px-4 py-3 text-sm text-emerald-200 shadow-2xl shadow-black/30 backdrop-blur-xl">
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-emerald-400"
                        size={18}
                        aria-hidden="true"
                      />
                      <p className="min-w-0 max-w-[calc(100vw-8rem)] flex-1 break-words leading-5">
                        {message}
                      </p>
                      <button
                        type="button"
                        onClick={() => setMessage("")}
                        className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-emerald-300/70 hover:bg-emerald-400/10 hover:text-emerald-200"
                        aria-label="Dismiss notification"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>,
                  document.body,
                )
              : null}
          </section>
        </div>
        <footer className="mt-auto flex items-center justify-center border-t border-zinc-800 pb-2 pt-3 text-center text-xs text-zinc-500">
          <span>
            Copyright © 2026&nbsp;&nbsp;·&nbsp;&nbsp;All rights
            reserved&nbsp;&nbsp;·&nbsp;&nbsp;V1.0.0
          </span>
        </footer>
      </main>
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Scroll to top"
          aria-label="Scroll to top"
          className="fixed bottom-4 right-4 z-50 rounded-lg border border-indigo-300/30 bg-zinc-900/90 p-2 font-mono text-[11px] uppercase tracking-widest text-zinc-300 shadow-lg backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:text-indigo-300 sm:bottom-6 sm:right-6 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
        >
          ↑<span className="ml-1">Top</span>
        </button>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-5 backdrop-blur-sm">
          <div className="danger-modal w-full max-w-sm rounded-2xl border border-red-400/30 bg-zinc-900 p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-300">
              Delete API
            </p>
            <h2 className="mt-2 text-xl font-bold">
              Delete {deleteTarget.name}?
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              This permanently removes the API and all of its endpoints. This
              action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="border border-zinc-700 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const response = await fetch(
                    "/api/projects/" + deleteTarget.id,
                    { method: "DELETE" },
                  );
                  if (response.ok) {
                    if (selected?.id === deleteTarget.id) setSelected(null);
                    setDeleteTarget(null);
                    setMessage("API deleted.");
                    void load();
                  }
                }}
                className="border border-red-500/60 bg-red-500/15 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
      {endpointDeleteTarget && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-5 backdrop-blur-sm">
          <div className="danger-modal w-full max-w-sm rounded-2xl border border-red-400/30 bg-zinc-900 p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-300">
              Delete endpoint
            </p>
            <h2 className="mt-2 break-words text-xl font-bold">
              Delete {endpointDeleteTarget.method} {endpointDeleteTarget.path}?
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              This permanently removes this endpoint and its response data. This
              action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEndpointDeleteTarget(null)}
                className="border border-zinc-700 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteEndpoint}
                className="border border-red-500/60 bg-red-500/15 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmApiKeyDelete && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-5 backdrop-blur-sm">
          <div className="danger-modal w-full max-w-sm rounded-2xl border border-red-400/30 bg-zinc-900 p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-300">
              Delete API key
            </p>
            <h2 className="mt-2 text-xl font-bold">Delete your API key?</h2>
            <p className="muted mt-2 text-sm leading-6">
              All your mock API requests will stop working until you generate a
              new key.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmApiKeyDelete(false)}
                className="border border-zinc-700 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const response = await fetch("/api/auth/api-key", {
                    method: "DELETE",
                  });
                  setConfirmApiKeyDelete(false);
                  setApiKey(null);
                  if (!response.ok) {
                    setMessage("Could not delete API key.");
                    return;
                  }
                  await load();
                  setMessage("API key deleted.");
                }}
                className="border border-red-500/60 bg-red-500/15 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
