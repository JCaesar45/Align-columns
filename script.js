(function () {
  "use strict";

  const CommandParser = (() => {
    const commands = new Map();

    function register(name, handler, description) {
      commands.set(name.toLowerCase(), { handler, description });
    }

    function execute(rawInput) {
      const trimmed = rawInput.trim();
      if (!trimmed) return { type: "empty" };

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (commands.has(cmd)) {
        try {
          const result = commands.get(cmd).handler(args);
          return { type: "success", content: result };
        } catch (err) {
          return { type: "error", content: `ERR: ${err.message}` };
        }
      }

      return {
        type: "error",
        content: `Unknown command: "${cmd}". Type "help" for available commands.`
      };
    }

    function getCommands() {
      return Array.from(commands.entries()).map(([name, data]) => ({
        name,
        description: data.description
      }));
    }

    return { register, execute, getCommands };
  })();

  const OutputRenderer = (() => {
    const region = document.getElementById("output-region");

    function append(text, className = "") {
      const block = document.createElement("div");
      block.className = `command-response ${className}`;
      block.innerHTML = text;
      region.appendChild(block);
      region.scrollTop = region.scrollHeight;
    }

    function appendRaw(html) {
      append(html, "");
    }

    function clear() {
      region.innerHTML = "";
    }

    return { append, appendRaw, clear };
  })();

  const ParticleSystem = (() => {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationId = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedY = Math.random() * 0.4 + 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.y += this.speedY;
        if (this.y > canvas.height + 10) this.reset();
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 65, ${this.opacity})`;
        ctx.fill();
      }
    }

    function init(count = 80) {
      resize();
      particles = Array.from({ length: count }, () => new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    }

    function start() {
      init();
      animate();
    }

    function stop() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    window.addEventListener("resize", resize);

    return { start, stop, resize };
  })();

  const ClockUpdater = (() => {
    const el = document.getElementById("live-timestamp");

    function tick() {
      const now = new Date();
      const utc = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
      el.textContent = utc;
    }

    function start() {
      tick();
      setInterval(tick, 1000);
    }

    return { start };
  })();

  function registerCommands() {
    CommandParser.register(
      "help",
      () => {
        const cmds = CommandParser.getCommands();
        return cmds
          .map(
            (c) =>
              `<span class="cmd-highlight">${c.name.padEnd(14)}</span> ${c.description}`
          )
          .join("<br>");
      },
      "Display available commands"
    );

    CommandParser.register(
      "about",
      () => {
        return `
        <strong>LUMINARY_TERM v2.7.4</strong><br>
        Retro-futuristic developer interface<br>
        Built with vanilla web technologies<br>
        No frameworks. No build tools. Just code.
      `;
      },
      "About this terminal"
    );

    CommandParser.register(
      "clear",
      () => {
        OutputRenderer.clear();
        return "";
      },
      "Clear the terminal screen"
    );

    CommandParser.register(
      "date",
      () => {
        return new Date().toString();
      },
      "Display current date and time"
    );

    CommandParser.register(
      "echo",
      (args) => {
        return args.join(" ");
      },
      "Echo the given text"
    );

    CommandParser.register(
      "whoami",
      () => {
        return "visitor@luminary-terminal";
      },
      "Display current user"
    );

    CommandParser.register(
      "projects",
      () => {
        const projects = [
          {
            name: "NEBULA_DB",
            desc: "Distributed time-series database in Rust",
            stars: 1240
          },
          {
            name: "GHOST_PROXY",
            desc: "Privacy-preserving API gateway",
            stars: 873
          },
          {
            name: "SYNAPSE",
            desc: "Neuromorphic computing simulator",
            stars: 2401
          },
          {
            name: "VOID_EDITOR",
            desc: "Modal text editor for the terminal",
            stars: 567
          }
        ];

        return projects
          .map(
            (p) =>
              `<span style="color: var(--phosphor-green);">${p.name.padEnd(18)}</span> ` +
              `<span style="color: var(--text-secondary);">${p.desc.padEnd(48)}</span> ` +
              `<span style="color: var(--amber-warn);">★ ${p.stars}</span>`
          )
          .join("<br>");
      },
      "List featured projects"
    );

    CommandParser.register(
      "matrix",
      () => {
        triggerMatrixEffect();
        return "Initiating matrix rain...";
      },
      "Trigger visual matrix effect"
    );

    CommandParser.register(
      "contact",
      () => {
        return `
        <span style="color: var(--phosphor-green);">PGP:</span> 8F3A 21D7 C09E 4B61 22FC  7D90 31E8 A5F2 B04D 6C97<br>
        <span style="color: var(--phosphor-green);">EMAIL:</span> dev [at] luminary-term [dot] io<br>
        <span style="color: var(--phosphor-green);">GITHUB:</span> github.com/luminary-dev
      `;
      },
      "Display contact information"
    );
  }

  function triggerMatrixEffect() {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 40);

    setTimeout(() => {
      clearInterval(interval);
      ParticleSystem.start();
    }, 8000);
  }

  function handleInput() {
    const input = document.getElementById("command-input");
    const result = CommandParser.execute(input.value);

    if (result.type !== "empty") {
      const promptSpan = `<span class="prompt-symbol" style="color: var(--phosphor-green);">❯</span> ${escapeHtml(input.value)}`;
      OutputRenderer.appendRaw(promptSpan);

      if (result.content) {
        const cls =
          result.type === "error"
            ? "response-error"
            : result.type === "warning"
              ? "response-warning"
              : "response-success";
        OutputRenderer.append(result.content, cls);
      }
    }

    input.value = "";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function init() {
    registerCommands();
    ClockUpdater.start();
    ParticleSystem.start();

    const input = document.getElementById("command-input");

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleInput();
      }
    });

    document
      .getElementById("terminal-container")
      .addEventListener("click", () => {
        input.focus();
      });

    const history = [];
    let historyIndex = -1;

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex] || "";
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > -1) {
          historyIndex--;
          input.value = historyIndex >= 0 ? history[historyIndex] : "";
        }
      }
    });

    const originalHandler = handleInput;
    handleInput = function () {
      if (input.value.trim()) {
        history.unshift(input.value);
        if (history.length > 50) history.pop();
        historyIndex = -1;
      }
      originalHandler();
    };

    handleInput = handleInput.bind(this);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
