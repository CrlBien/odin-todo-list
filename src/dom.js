import { todo, notes, projects } from "./logic.js";

const DOM = (() => {
  const tabTitle = document.getElementById("tab-title");
  const todoSection = document.getElementById("todo-section");
  const notesSection = document.getElementById("notes-section");
  const projectsSection = document.getElementById("projects-section");

  const todoList = document.getElementById("todo-list");
  const notesList = document.getElementById("notes-list");
  const projectsList = document.getElementById("projects-list");

  const tabs = {
    todo: document.getElementById("home-btn"),
    today: document.getElementById("today-btn"),
    notes: document.getElementById("notes-btn"),
    projects: document.getElementById("projects-btn"),
  };

  const switchTab = (tab) => {
    Object.values(tabs).forEach((btn) =>
      btn.classList.remove("bg-gray-200", "font-bold")
    );
    todoSection.classList.add("hidden");
    notesSection.classList.add("hidden");
    projectsSection.classList.add("hidden");

    if (tab === "todo") {
      tabTitle.textContent = "Todo List";
      todoSection.classList.remove("hidden");
      tabs.todo.classList.add("bg-gray-200", "font-bold");
      renderTodos();
    } else if (tab === "notes") {
      tabTitle.textContent = "Notes";
      notesSection.classList.remove("hidden");
      tabs.notes.classList.add("bg-gray-200", "font-bold");
      renderNotes();
    } else if (tab === "projects") {
      tabTitle.textContent = "Projects";
      projectsSection.classList.remove("hidden");
      tabs.projects.classList.add("bg-gray-200", "font-bold");
      renderProjects();
    } else if (tab === "today") {
      tabTitle.textContent = "Today’s Todos";
      todoSection.classList.remove("hidden");
      tabs.today.classList.add("bg-gray-200", "font-bold");
      renderTodayTodos();
    }
  };

  // Render functions
  const renderTodos = () => {
    todoList.innerHTML = "";
    todo.getAll().forEach((t, index) => {
      const li = document.createElement("li");
      li.className = `p-3 rounded border flex justify-between items-center ${
        t.completed ? "bg-green-100" : "bg-white"
      }`;

      li.innerHTML = `
        <div>
          <input type="checkbox" ${
            t.completed ? "checked" : ""
          } class="mr-2 todo-check">
          <strong>${t.title}</strong><br>
          <small>${t.dueDate || ""}</small>
        </div>
        <div class="space-x-2">
          <button class="edit-todo text-blue-500"><i class="fa fa-pen"></i></button>
          <button class="delete-todo text-red-500"><i class="fa fa-trash"></i></button>
        </div>
      `;

      li.querySelector(".todo-check").addEventListener("change", () => {
        todo.toggleComplete(index);
        renderTodos();
      });
      li.querySelector(".delete-todo").addEventListener("click", () => {
        todo.remove(index);
        renderTodos();
      });
      li.querySelector(".edit-todo").addEventListener("click", () => {
        const newTitle = prompt("Edit title", t.title);
        if (newTitle && newTitle.length <= 50) {
          todo.edit(index, { title: newTitle });
          renderTodos();
        }
      });

      todoList.appendChild(li);
    });
  };

  const renderTodayTodos = () => {
    const today = new Date().toISOString().split("T")[0];
    const allTodos = [
      ...todo.getAll(),
      ...projects.getAll().flatMap((proj) => proj.todos),
    ];
    const todayTodos = allTodos.filter((t) => t.dueDate === today);
    todoList.innerHTML = "";
    todayTodos.forEach((t) => {
      const li = document.createElement("li");
      li.className = "p-3 rounded border bg-white";
      li.innerHTML = `<strong>${t.title}</strong><br><small>${t.dueDate}</small>`;
      todoList.appendChild(li);
    });
  };

  const renderNotes = () => {
    notesList.innerHTML = "";
    notes.getAll().forEach((n, index) => {
      const li = document.createElement("li");
      li.className = "bg-yellow-100 p-3 rounded shadow flex justify-between";
      li.innerHTML = `
        <span>${n.notes}</span>
        <button class="delete-note text-red-500"><i class="fa fa-trash"></i></button>
      `;
      li.querySelector(".delete-note").addEventListener("click", () => {
        notes.remove(index);
        renderNotes();
      });
      notesList.appendChild(li);
    });
  };

  const renderProjects = () => {
    projectsList.innerHTML = "";
    projects.getAll().forEach((p, index) => {
      const li = document.createElement("li");
      li.className = "bg-purple-100 p-3 rounded shadow flex justify-between";
      li.innerHTML = `
        <span>${p.name}</span>
        <button class="delete-proj text-red-500"><i class="fa fa-trash"></i></button>
      `;
      li.querySelector(".delete-proj").addEventListener("click", () => {
        projects.removeProject(index);
        renderProjects();
      });
      projectsList.appendChild(li);
    });
  };

  // Event handlers
  document.getElementById("todo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("todo-title").value;
    const desc = document.getElementById("todo-description").value;
    const date = document.getElementById("todo-date").value;
    const priority = document.getElementById("todo-priority").value;

    if (title.length > 50 || desc.length > 500) return alert("Too long input!");
    todo.add(title, desc, date, priority);
    e.target.reset();
    renderTodos();
  });

  document.getElementById("notes-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const note = document.getElementById("note-text").value;
    if (note.length > 250) return alert("Max 250 chars");
    notes.add(note);
    e.target.reset();
    renderNotes();
  });

  document.getElementById("project-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("project-name").value;
    projects.addProject(name);
    e.target.reset();
    renderProjects();
  });

  tabs.todo.addEventListener("click", () => switchTab("todo"));
  tabs.today.addEventListener("click", () => switchTab("today"));
  tabs.notes.addEventListener("click", () => switchTab("notes"));
  tabs.projects.addEventListener("click", () => switchTab("projects"));

  // Initialize default tab
  switchTab("todo");

  return { switchTab };
})();

export default DOM;
