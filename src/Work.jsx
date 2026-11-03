
import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const FRAGMENTS_ALBUM =
  "https://archive.org/details/samatar-fragments-of-a-faded-past-2026/SAMATAR_01.crossedthebridgepastanothashallowhole.wav";

export default function Work() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setProjects(data || []);
        setActiveProjectId((current) => {
          if (
            current &&
            data.some((project) => project.id === current)
          ) {
            return current;
          }

          return data[0]?.id || null;
        });
      }

      setLoading(false);
    }

    loadProjects();
  }, []);

  const activeProject = projects.find(
    (project) => project.id === activeProjectId
  );

  const isAboutPage = activeProjectId === "about";

  const categories = [
    ...new Set(projects.map((project) => project.category)),
  ];

  const media = activeProject?.media || [];

  const video = media.find((item) => item.type === "youtube");

  const titleLink =
    activeProject?.id === "fragments"
      ? FRAGMENTS_ALBUM
      : video
        ? `https://www.youtube.com/watch?v=${video.videoId}`
        : null;

  return (
    <main className="min-h-screen bg-white text-[#171717]">

      {/* SITE NAME */}
      <a
        href="/"
        className="fixed left-6 top-6 z-30 font-serif text-xl italic text-blue-700 md:left-10"
      >
        Nikhil Joseph
      </a>

      {/* LEFT SIDEBAR */}
      <aside className="fixed bottom-0 left-0 top-20 z-20 w-56 overflow-y-auto px-6 pb-8 pt-5 md:w-[280px] md:px-10">

        <p className="mb-5 font-serif text-xs italic text-neutral-400">
          Selected work
        </p>

        <nav
          aria-label="Project navigation"
          className="space-y-6"
        >
          {categories.map((category) => (
            <div key={category}>

              <p className="mb-2 font-serif text-xs italic text-neutral-400">
                {category}
              </p>

              <div className="flex flex-col items-start gap-1.5">
                {projects
                  .filter(
                    (project) => project.category === category
                  )
                  .map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setActiveProjectId(project.id);

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className={`text-left font-serif text-sm italic transition-colors ${
                        activeProjectId === project.id
                          ? "text-neutral-400"
                          : "text-blue-700 hover:text-blue-400"
                      }`}
                    >
                      {project.title}
                    </button>
                  ))}
              </div>

            </div>
          ))}
        </nav>

        {/* ABOUT / CONTACT NAVIGATION */}
        <div className="mt-7 flex flex-col gap-1 font-serif text-sm italic">
          <button
            type="button"
            onClick={() => {
              setActiveProjectId("about");

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className={`text-left transition-colors ${
              isAboutPage
                ? "text-neutral-400"
                : "text-blue-700 hover:text-blue-400"
            }`}
          >
            About / Contact
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <section className="ml-[230px] min-h-screen px-4 pb-20 pt-[70px] md:ml-[280px] md:px-8">

        {loading ? (

          <p className="font-serif italic text-neutral-400">
            Loading projects...
          </p>

        ) : error ? (

          <p className="font-serif italic text-red-500">
            Could not load projects: {error}
          </p>

        ) : isAboutPage ? (

          /* ABOUT / CONTACT PAGE */

          <article className="mx-auto w-full max-w-[680px]">

            <header className="mb-10">
              <h1 className="font-serif text-3xl italic text-blue-700 md:text-4xl">
                About
              </h1>
            </header>

            <div className="max-w-[540px] space-y-6 text-sm leading-8 text-neutral-600 md:text-base">

              <p>
                I am a media maker based in Melbourne, currently
                completing a Master of Media at RMIT University.
                My creative practice is driven by an interest in
                fiction and non-fiction storytelling, community
                narratives, and the ways media can help us
                understand people's experiences.
              </p>

              <p>
                Working across editing, camera, and lighting,
                I am interested in how images and sound shape a
                story and create connections between audiences
                and the people on screen. I am proficient in
                Adobe Premiere Pro and other Adobe Creative
                Suite applications, and I enjoy contributing
                to different stages of the production process.
              </p>

              <p>
                My interests extend across documentary film,
                television, social content, audio, journalism,
                and games. As I continue developing my practice,
                I am particularly interested in non-fiction
                filmmaking and community-based storytelling.
              </p>

            </div>

            {/* CONTACT */}
            <div className="mt-12 border-t border-neutral-200 pt-8">

              <h2 className="mb-5 font-serif text-2xl italic text-blue-700">
                Contact
              </h2>

              <a
                href="mailto:"
                className="font-serif text-lg italic text-blue-700 transition-colors hover:text-blue-400"
              >
                Email ↗
              </a>

            </div>

          </article>

        ) : activeProject ? (

          /* PROJECT PAGE */

          <article className="mx-auto w-full max-w-[680px]">

            {/* PROJECT TITLE */}
            <header className="mb-10">

              {titleLink ? (
                <a
                  href={titleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-serif text-2xl italic text-blue-700 transition-opacity hover:opacity-50 md:text-3xl"
                >
                  {activeProject.title}
                </a>
              ) : (
                <h1 className="font-serif text-2xl italic text-blue-700 md:text-3xl">
                  {activeProject.title}
                </h1>
              )}

            </header>

            {/* PROJECT MEDIA */}
            <div className="flex flex-col items-center gap-8 md:gap-12">

              {media
                .filter(
                  (item) =>
                    item.type === "youtube" ||
                    (item.type === "image" && item.src)
                )
                .map((item, index) => (

                  <div
                    key={`${activeProject.id}-${index}`}
                    className="w-full"
                  >

                    {/* YOUTUBE VIDEO */}
                    {item.type === "youtube" && (
                      <div className="mx-auto aspect-video w-full max-w-[540px] bg-neutral-100">

                        <iframe
                          className="h-full w-full"
                          src={`https://www.youtube.com/embed/${item.videoId}`}
                          title={activeProject.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />

                      </div>
                    )}

                    {/* PHOTOGRAPH */}
                    {item.type === "image" && (
                      <img
                        src={item.src}
                        alt={item.alt || activeProject.title}
                        loading="lazy"
                        className="mx-auto block h-auto w-full max-w-[540px] object-contain"
                      />
                    )}

                  </div>

                ))}

            </div>

            {/* PROJECT TEXT */}
            <div className="mx-auto mt-16 w-full max-w-[540px] space-y-8 border-t border-neutral-200 pt-8">

              {media
                .filter((item) => item.type === "text")
                .map((item, index) => (

                  <div key={index}>

                    {item.heading && (
                      <h2 className="mb-3 font-serif text-lg italic text-blue-700">
                        {item.heading}
                      </h2>
                    )}

                    <p className="text-sm leading-7 text-neutral-600">
                      {item.content}
                    </p>

                  </div>

                ))}

              {activeProject.credits && (
                <p className="font-serif text-xs italic leading-6 text-neutral-400">
                  {activeProject.credits}
                </p>
              )}

            </div>

          </article>

        ) : (

          <p className="font-serif italic text-neutral-500">
            No projects available yet.
          </p>

        )}

      </section>

    </main>
  );
}
