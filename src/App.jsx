import Work from "./Work";
import Admin from "./Admin.jsx";
import { supabase } from "./supabase.js";
import { useEffect, useRef, useState } from "react";
import {
  X,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";

function PhotoMontage({ images, musicUrl }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [images.length]);

  const playMusic = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
    } catch {
      // Some browsers require a direct click before allowing audio playback.
      setIsPlaying(false);
    }
  };

  const pauseMusic = () => {
    audioRef.current?.pause();
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      await playMusic();
    } else {
      pauseMusic();
    }
  };

  const previousImage = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div
      className="relative flex h-[55vh] min-h-[360px] w-full items-center justify-center overflow-hidden bg-black md:h-[70vh]"
      onMouseEnter={playMusic}
      onMouseLeave={pauseMusic}
    >
      <audio
        ref={audioRef}
        src={musicUrl}
        preload="none"
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {images.map((image, index) => (
        <img
          key={image}
          src={image}
          alt={`Fragments of a Faded Past photograph ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-contain transition-all duration-[2000ms] ease-in-out ${
            activeIndex === index
              ? "scale-105 opacity-100"
              : "scale-100 opacity-0"
          }`}
        />
      ))}

      <button
        type="button"
        onClick={previousImage}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/50 p-3 text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
        aria-label="Previous photograph"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        onClick={nextImage}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/50 p-3 text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
        aria-label="Next photograph"
      >
        <ChevronRight size={24} />
      </button>

      <button
        type="button"
        onClick={toggleMusic}
        className="absolute right-5 top-5 z-20 flex items-center gap-2 border border-white/30 bg-black/60 px-4 py-2 text-xs tracking-widest text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
        aria-label={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
      >
        {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        {isPlaying ? "SOUND ON" : "SOUND OFF"}
      </button>

      <div className="absolute bottom-5 left-6 z-20 text-xs tracking-[0.25em] text-white/70">
        {String(activeIndex + 1).padStart(2, "0")} /{" "}
        {String(images.length).padStart(2, "0")}
      </div>
    </div>
  );
}


function HomePage() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Could not load projects:", error.message);
      } else {
        const formattedProjects = (data || []).map((project) => {
          const media = project.media || [];

          const video = media.find(
            (item) => item.type === "youtube"
          );

          const images = media
            .filter((item) => item.type === "image" && item.src)
            .map((item) => item.src);

          return {
            ...project,
            type: video ? "youtube" : images.length ? "slideshow" : "image",
            videoId: video?.videoId,
            thumbnail: project.thumbnail_url ||
            (video
            ? `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`
             : images[0] || ""),
            images,
            musicUrl:
              project.id === "fragments"
                ? "https://archive.org/download/samatar-fragments-of-a-faded-past-2026/SAMATAR_01.crossedthebridgepastanothashallowhole.wav"
                : project.musicUrl || "",
          };
        });

        setProjects(formattedProjects);
      }

      setProjectsLoading(false);
    }

    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedProject(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]);

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      {/* NAVIGATION */}
      
      {/* NAVIGATION */}
      <nav className="relative z-40 flex items-center justify-between border-b border-white/10 px-6 py-6 md:px-12">
        <a
          href="/"
          className="text-xl font-semibold tracking-[0.2em]"
        >
          NIKHIL JOSEPH
        </a>

        <div className="flex items-center gap-5 md:gap-10">
          <a
            href="/"
            className="text-xs tracking-[0.2em] text-white/80 transition hover:text-white/50"
          >
            HOME
          </a>

          <a
            href="/work"
            className="text-xs tracking-[0.2em] text-white/80 transition hover:text-white/50"
          >
            WORK
          </a>

          <a
            href="#contact"
            className="text-xs tracking-[0.2em] text-white/80 transition hover:text-white/50"
          >
            CONTACT
          </a>
        </div>
      </nav>

      {/* HERO VIDEO */}
      <section className="relative flex h-[85vh] min-h-[550px] w-full items-center justify-center overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 px-6 text-center">
          <p className="mb-6 text-xs tracking-[0.4em] text-white/70">
            FILMMAKER · PHOTOGRAPHER · CREATIVE
          </p>
          <h1 className="text-5xl font-light tracking-wide md:text-8xl">
            NIKHIL JOSEPH
          </h1>
          <p className="mt-6 text-xs tracking-[0.3em] text-white/70">
            A COLLECTION OF VISUAL STORIES
          </p>
        </div>

        <a
          href="#work"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-xs tracking-[0.3em] text-white/70 transition hover:text-white"
        >
          SCROLL TO EXPLORE ↓
        </a>
      </section>

      {/* SELECTED WORK */}
      <section id="work" className="py-20">
        <div className="mb-12 flex items-end justify-between px-6 md:px-12">
          <div>
            <p className="mb-3 text-xs tracking-[0.3em] text-white/40">
              PORTFOLIO / SELECTED PROJECTS
            </p>
            <h2 className="text-4xl font-light md:text-6xl">Selected Work</h2>
          </div>

          <span className="hidden text-xs tracking-widest text-white/40 md:block">
           2026 / {String(projects.length).padStart(2, "0")} PROJECTS
          </span>
        </div>

        <div className="flex flex-col gap-2">
  {projectsLoading ? (
    <p className="px-6 py-12 text-center text-sm text-white/40">
      Loading projects...
    </p>
  ) : projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedProject(project)}
              className="group relative block w-full overflow-hidden bg-black text-left"
              aria-label={`Open ${project.title}`}
            >
              <div className="relative h-[85vh] min-h-[550px] w-full overflow-hidden bg-black">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-contain transition-all duration-700 ease-out group-hover:scale-105 group-hover:blur-md group-hover:brightness-50"
                />

                <div className="absolute inset-0 bg-black/15 transition-all duration-700 group-hover:bg-black/45" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="translate-y-0 px-4 text-center opacity-100 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 md:translate-y-5 md:opacity-0">
                    <h3 className="text-3xl font-light tracking-wide text-white md:text-5xl">
                      {project.title}
                    </h3>
                    <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/70">
                      {project.category}
                    </p>
                  </div>
                </div>

                <span className="absolute bottom-6 left-6 text-xs tracking-[0.25em] text-white/70">
                  0{index + 1} / 0{projects.length}
                </span>

                <ArrowUpRight
                  className="absolute bottom-6 right-6 text-white/70 transition duration-500 group-hover:rotate-45 group-hover:text-white"
                  size={22}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      
      {/* ABOUT */}
      <section
        id="about"
        className="border-t border-white/10 px-6 py-28 md:px-12"
      >
        <p className="mb-8 text-xs tracking-[0.3em] text-white/40">
          ABOUT
        </p>

        <div className="max-w-none w-full space-y-6 text-base font-light leading-relaxed text-white/75 md:text-xl md:leading-9">
          <p>
            I am a media maker based in Melbourne, currently completing
            a Master of Media at RMIT University. My creative practice
            is driven by an interest in fiction and non-fiction
            storytelling, community narratives, and the ways media
            can help us understand people's experiences.
          </p>

          <p>
            Working across editing, camera, and lighting, I am
            interested in how images and sound shape a story and
            create connections between audiences and the people on
            screen. I am proficient in Adobe Premiere Pro and other
            Adobe Creative Suite applications, and I enjoy contributing
            to different stages of the production process.
          </p>

          <p>
            My interests extend across documentary film, television,
            social content, audio, journalism, and games. As I continue
            developing my practice, I am particularly interested in
            non-fiction filmmaking and community-based storytelling.
          </p>
          <a
  href="mailto:YOUR_EMAIL@example.com"
  className="mt-8 inline-block text-lg italic text-white/80 transition hover:text-white"
>
  Get in touch ↗
</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="flex flex-col justify-between gap-6 border-t border-white/10 px-6 py-10 md:flex-row md:px-12"
      >
        <span className="text-sm tracking-[0.2em]">NIKHIL JOSEPH</span>
        <span className="text-xs tracking-widest text-white/40">
          FILM · PHOTOGRAPHY · SOUND
        </span>
      </footer>

      {/* PROJECT VIEWER */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/95 p-5 md:p-12"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  {selectedProject.category}
                </p>
                <h2 className="mt-2 text-2xl font-light md:text-4xl">
                  {selectedProject.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project"
                className="rounded-full border border-white/30 p-3 transition hover:bg-white hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            {selectedProject.type === "youtube" && (
              <iframe
                className="aspect-video w-full bg-[#151515]"
                src={`https://www.youtube.com/embed/${selectedProject.videoId}?autoplay=1`}
                title={selectedProject.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}

            {selectedProject.type === "slideshow" && (
              <div className="w-full">
                <PhotoMontage
                  images={selectedProject.images}
                  musicUrl={selectedProject.musicUrl}
                />

                <div className="mt-8 text-center">
                  <p className="text-xs tracking-[0.3em] text-white/40">
                    PHOTOGRAPHY & BOOKLET CONTRIBUTION
                  </p>
                  <h3 className="mt-3 text-xl font-light text-white">
                    Fragments of a Faded Past
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">
                    Photography by Samatar Mohamed and Nikhil Sabu Joseph.
                    <br />
                    Featuring Nikhil as the man in the white glove.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}


function App() {
  if (window.location.pathname === "/admin") {
    return <Admin />;
  }

  if (window.location.pathname === "/work") {
    return <Work />;
  }

  return <HomePage />;
}



export default App;
