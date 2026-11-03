
import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const emptyProject = () => ({
  id: "",
  title: "",
  category: "Film",
  videoLink: "",
  thumbnailUrl: "",
  sections: [{ heading: "About the project", content: "" }],
  credits: "",
});

function getVideoId(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1];
    }
  } catch {
    return "";
  }

  return "";
}

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function Admin() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyProject());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
const [uploading, setUploading] = useState(false);

async function uploadImages(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  setUploading(true);
  setMessage("");

  try {
    const { data: auth, error: authError } =
      await supabase.functions.invoke("imagekit-auth");

    if (authError) throw authError;
    if (!auth?.token || !auth?.signature || !auth?.expire) {
      throw new Error("ImageKit authentication failed.");
    }

    const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

    if (!publicKey) {
      throw new Error("ImageKit public key is missing from .env.");
    }

    const uploadedImages = [];

    for (const file of files) {
      const body = new FormData();

      body.append("file", file);
      body.append("fileName", file.name);
      body.append("publicKey", publicKey);
      body.append("token", auth.token);
      body.append("expire", String(auth.expire));
      body.append("signature", auth.signature);

      const response = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Image upload failed.");
      }

      uploadedImages.push({
        type: "image",
        src: result.url,
        alt: file.name,
      });
    }

    setImages((current) => [...current, ...uploadedImages]);
    setMessage(`${uploadedImages.length} image(s) uploaded successfully.`);
  } catch (error) {
    setMessage(error.message || "Could not upload images.");
  } finally {
    setUploading(false);
    event.target.value = "";
  }
} 

  async function loadProjects() {
    setLoading(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      setMessage(error.message);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

function resetForm() {
  setForm(emptyProject());
  setImages([]);
  setEditingId(null);
  setMessage("");
}

  function addSection() {
    setForm((current) => ({
      ...current,
      sections: [
        ...current.sections,
        { heading: "", content: "" },
      ],
    }));
  }

  function updateSection(index, field, value) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section, i) =>
        i === index
          ? { ...section, [field]: value }
          : section
      ),
    }));
  }

  function removeSection(index) {
    setForm((current) => ({
      ...current,
      sections: current.sections.filter((_, i) => i !== index),
    }));
  }

    function editProject(project) {
      const video = (project.media || []).find(
        (item) => item.type === "youtube"
      );
    
    const existingImages = (project.media || [])
    .filter((item) => item.type === "image" && item.src);

    const sections = (project.media || [])
      .filter((item) => item.type === "text")
      .map((item) => ({
        heading: item.heading || "",
        content: item.content || "",
      }));

    setForm({
      id: project.id,
      title: project.title,
      category: project.category,
      videoLink: video
        ? `https://www.youtube.com/watch?v=${video.videoId}`
        : "",
      thumbnailUrl: project.thumbnail_url || "",
      sections: sections.length
        ? sections
        : [{ heading: "", content: "" }],
      credits: project.credits || "",
    });
    setImages(existingImages);
    setEditingId(project.id);
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProject(event) {

    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Please enter a project title.");
      return;
    }

    setSaving(true);
    setMessage("");

    const videoId = getVideoId(form.videoLink);

    if (form.videoLink.trim() && !videoId) {
      setMessage("Please enter a valid YouTube link.");
      setSaving(false);
      return;
    }

const media = [];

// Add uploaded photographs
images.forEach((image) => {
  media.push(image);
});

if (videoId) {
      media.push({
        type: "youtube",
        videoId,
      });
    }

    form.sections.forEach((section) => {
      if (section.heading.trim() || section.content.trim()) {
        media.push({
          type: "text",
          heading: section.heading,
          content: section.content,
        });
      }
    });

    const projectData = {
      id: editingId || makeSlug(form.title),
      title: form.title.trim(),
      category: form.category.trim() || "Other",
      media,
      credits: form.credits,
      thumbnail_url: form.thumbnailUrl.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = editingId
      ? await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingId)
      : await supabase
          .from("projects")
          .insert({
            ...projectData,
            sort_order: projects.length,
          });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(editingId ? "Project updated!" : "Project added!");
      resetForm();
      await loadProjects();
    }

    setSaving(false);
  }

  async function deleteProject(project) {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Project deleted.");
      if (editingId === project.id) resetForm();
      await loadProjects();
    }
  }

  return (
    <main className="min-h-screen bg-[#111] px-6 py-12 text-white md:px-16">
      <div className="mx-auto max-w-3xl">

        <a href="/" className="font-serif text-xl italic">
          Nikhil Joseph
        </a>

        <div className="mb-10 mt-16">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Portfolio management
          </p>

          <h1 className="mt-3 font-serif text-4xl">
            Project Manager
          </h1>
        </div>

        <section className="mb-16">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-2xl">
              Your projects
            </h2>

            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-blue-300 hover:text-white"
            >
              + New project
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-neutral-400">
              Loading projects...
            </p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-neutral-400">
              No projects yet.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-white/15 p-4"
                >
                  <div>
                    <p className="font-serif text-lg">
                      {project.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {project.category}
                    </p>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <button
                      type="button"
                      onClick={() => editProject(project)}
                      className="text-blue-300 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProject(project)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={saveProject} className="space-y-8">

          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">
              {editingId ? "Edit project" : "Add a project"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-neutral-400 hover:text-white"
              >
                Cancel editing
              </button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Project title
            </label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="Enter project title"
              className="w-full border border-white/20 bg-transparent p-3 outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Category
            </label>
            <input
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              placeholder="Film, Documentary, Photography..."
              className="w-full border border-white/20 bg-transparent p-3 outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              YouTube video link
            </label>
            <input
              value={form.videoLink}
              onChange={(e) =>
                setForm({ ...form, videoLink: e.target.value })
              }
              placeholder="Paste YouTube URL"
              className="w-full border border-white/20 bg-transparent p-3 outline-none focus:border-white"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm">
              External thumbnail URL
            </label>

            <input
              type="url"
              value={form.thumbnailUrl}
              onChange={(e) =>
                setForm({ ...form, thumbnailUrl: e.target.value })
              }
              placeholder="https://example.com/your-thumbnail.jpg"
              className="w-full border border-white/20 bg-transparent p-3 outline-none focus:border-white"
            />

            <p className="text-xs leading-6 text-neutral-500">
              Optional. Paste a direct image link to use a custom
              thumbnail instead of the YouTube thumbnail or first
              project photograph.
            </p>

            {form.thumbnailUrl.trim() && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-400">
                  Thumbnail preview
                </p>

                <img
                  src={form.thumbnailUrl}
                  alt="Custom project thumbnail preview"
                  className="max-h-64 w-full border border-white/15 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, thumbnailUrl: "" })
                    }
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove custom thumbnail
                  </button>
                </div>
              )}
            </div>

            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl">
                  Text sections
                </h2>

                <button
                  type="button"
                  onClick={addSection}
                  className="text-sm text-blue-300 hover:text-white"
                >
                  + Add section
                </button>
              </div>

              {form.sections.map((section, index) => (
                <div
                  key={index}
                  className="space-y-3 border border-white/15 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-neutral-500">
                      Section {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove section ×
                    </button>
                  </div>

                  <input
                    value={section.heading}
                    onChange={(e) =>
                      updateSection(index, "heading", e.target.value)
                    }
                    placeholder="Section heading"
                    className="w-full border-b border-white/20 bg-transparent p-2 outline-none"
                  />

                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      updateSection(index, "content", e.target.value)
                    }
                    placeholder="Write your content..."
                    rows={5}
                    className="w-full resize-y bg-transparent p-2 text-sm leading-7 outline-none"
                  />
                </div>
              ))}
            </section>

            <div>
              <label className="mb-2 block text-sm">
                Credits
              </label>
              <textarea
                value={form.credits}
                onChange={(e) =>
                  setForm({ ...form, credits: e.target.value })
                }
                placeholder="Add project credits..."
                rows={4}
                className="w-full border border-white/20 bg-transparent p-3 text-sm outline-none focus:border-white"
              />
            </div>

            <div className="space-y-5 border border-dashed border-white/25 p-6">
    <div>
      <h3 className="font-serif text-xl">Project photographs</h3>
      <p className="mt-2 text-sm text-neutral-400">
        Upload one or more photographs for this project.
      </p>
    </div>

    <label className="inline-block cursor-pointer bg-white px-5 py-3 text-sm text-black transition hover:opacity-80">
      {uploading ? "Uploading..." : "+ Choose photographs"}

      <input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={uploadImages}
        className="hidden"
      />
    </label>

    {images.length > 0 && (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((image, index) => (
          <div key={`${image.src}-${index}`} className="space-y-2">
            <img
              src={image.src}
              alt={image.alt || `Project photograph ${index + 1}`}
              className="h-40 w-full border border-white/15 object-cover"
            />

            <button
              type="button"
              onClick={() =>
                setImages((current) =>
                  current.filter((_, i) => i !== index)
                )
              }
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove image ×
            </button>
          </div>
        ))}
      </div>
    )}

    <p className="text-xs text-neutral-500">
      {images.length} photograph(s) added.
    </p>
  </div>

  {message && (
    <p className="text-sm text-blue-300">{message}</p>
  )}

  <button
    type="submit"
    disabled={saving || uploading}
    className="w-full bg-white py-4 text-black transition-opacity hover:opacity-80 disabled:opacity-50"
  >
    {saving
      ? "Saving..."
      : editingId
        ? "Save changes"
        : "Save project"}
  </button>
          </form>
        </div>
      </main>
    );
  }
