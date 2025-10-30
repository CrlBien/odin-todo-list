import {
  TodoManager,
  NoteManager,
  ProjectManager,
  getAllTodosAcross,
} from "./logic.js";

// DOM references
const tabTitle = document.getElementById("tab-title");

const sections = {
  todo: document.getElementById("todo-section"),
  today: document.getElementById("today-section"),
  notes: document.getElementById("notes-section"),
  projects: document.getElementById("projects-section"),
};

const lists = {
  todo: document.getElementById("todo-list"),
  today: document.getElementById("today-list"),
  notes: document.getElementById("notes-list"),
  projects: document.getElementById("projects-list"),
};

const forms = {
  todoForm: document.getElementById("todo-form"),
  notesForm: document.getElementById("notes-form"),
  projectForm: document.getElementById("project-form"),
};

const navLinks = document.querySelectorAll(".nav-link");

// Create FAB and overlay modal
const fab = document.createElement("button");
fab.id = "fab";
fab.className =
  "fixed right-8 bottom-8 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg z-40 cursor-pointer";
fab.textContent = "+";
document.body.appendChild(fab);

// overlay
const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.className =
  "fixed inset-0 hidden z-50 flex items-center justify-center";
overlay.innerHTML = `
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
  <div class="relative z-10 w-[92%] max-w-3xl flex justify-center">
    <div id="modal-content" class="bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto"></div>
  </div>
`;

document.body.appendChild(overlay);

let currentTab = "todo";
let activeProjectId = null;

// Helper: set active tab visual on nav links
function setActiveTab(tab) {
  currentTab = tab;

  navLinks.forEach((ln) => {
    ln.classList.remove("bg-gray-100", "font-semibold");
    if (ln.dataset && ln.dataset.tab === tab) {
      ln.classList.add("bg-gray-100", "font-semibold");
    }
  });
}

// Show/hide overlay modal
function showModal(html) {
  const content = overlay.querySelector("#modal-content");
  if (!content) return;
  content.innerHTML = html;
  overlay.classList.remove("hidden");

  overlay.addEventListener(
    "click",
    (e) => {
      if (e.target === overlay) closeModal();
    },
    { once: true }
  );
}
function closeModal() {
  overlay.classList.add("hidden");
  const content = overlay.querySelector("#modal-content");
  if (content) content.innerHTML = "";
}

/* Render helpers */

// priority badge color helper
function priorityClasses(priority) {
  if (priority === "Low") return "bg-green-100 text-green-700";
  if (priority === "Medium") return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-700";
}

function renderTodoCards(container, todos = []) {
  if (!container) return;
  container.innerHTML = "";

  if (!todos || todos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "text-gray-500";
    empty.textContent = "No todos found.";
    container.appendChild(empty);
    return;
  }

  todos.forEach((t) => {
    const li = document.createElement("li");
    li.className = `p-3 rounded-lg border flex justify-between gap-4 ${
      t.completed ? "bg-green-50" : "bg-white"
    }`;

    // checkbox & text
    const left = document.createElement("div");
    left.className = "flex items-start gap-3 flex-1 min-w-0";

    const checkbox = document.createElement("button");
    checkbox.className = `w-5 h-5 rounded-sm border shrink-0 cursor-pointer ${
      t.completed ? "bg-green-400" : "bg-white"
    }`;
    checkbox.setAttribute("aria-label", "toggle-complete");
    checkbox.addEventListener("click", () => {
      const inRoot = TodoManager.getAll().find((x) => x.id === t.id);
      if (inRoot) {
        TodoManager.toggleComplete(t.id);
      } else {
        ProjectManager.getAll().forEach((p) => {
          const found = p.todos.find((x) => x.id === t.id);
          if (found) ProjectManager.toggleCompleteInProject(p.id, t.id);
        });
      }
      rerenderCurrent();
    });

    const textWrap = document.createElement("div");
    textWrap.className = "flex-1 overflow-hidden";

    // Title
    const titleWrap = document.createElement("div");
    titleWrap.className = "flex items-center gap-2";

    const priorityDot = document.createElement("div");
    priorityDot.className = `w-3 h-3 rounded-full shrink-0 ${
      t.priority === "High"
        ? "bg-red-500"
        : t.priority === "Medium"
        ? "bg-yellow-400"
        : t.priority === "Low"
        ? "bg-green-500"
        : "bg-gray-300"
    }`;

    const title = document.createElement("div");
    title.className = "font-semibold text-gray-900 truncate";
    title.textContent = t.title;

    titleWrap.appendChild(priorityDot);
    titleWrap.appendChild(title);

    // Description
    const desc = document.createElement("div");
    desc.className =
      "text-sm text-gray-700 mt-2 overflow-hidden text-ellipsis break-words";
    desc.style.maxHeight = t.expanded ? "none" : "6rem";
    desc.textContent = t.description || "";

    // Meta
    const meta = document.createElement("div");
    meta.className = "text-xs text-gray-500 mt-2 flex items-center gap-2";

    const date = document.createElement("span");
    date.textContent = t.dueDate || "No date";

    const priorityBadge = document.createElement("span");
    priorityBadge.textContent = t.priority;
    priorityBadge.className = `text-white px-2 py-0.5 rounded text-[10px] font-medium ${
      t.priority === "High"
        ? "bg-red-500"
        : t.priority === "Medium"
        ? "bg-yellow-400 text-black"
        : t.priority === "Low"
        ? "bg-green-500"
        : "bg-gray-400"
    }`;

    meta.appendChild(date);
    meta.appendChild(priorityBadge);

    textWrap.appendChild(titleWrap);
    textWrap.appendChild(desc);
    textWrap.appendChild(meta);

    left.appendChild(checkbox);
    left.appendChild(textWrap);

    // rightside buttons
    const right = document.createElement("div");
    right.className = "flex flex-col justify-start items-end gap-2 shrink-0";

    const editBtn = document.createElement("button");
    editBtn.className = "text-blue-600 px-2 cursor-pointer";
    editBtn.title = "Edit";
    editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    editBtn.addEventListener("click", () => openTodoModal({ editTodo: t }));

    const delBtn = document.createElement("button");
    delBtn.className = "text-red-600 px-2 cursor-pointer";
    delBtn.title = "Delete";
    delBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    delBtn.addEventListener("click", () => {
      if (confirm("Delete this todo?")) {
        const inRoot = TodoManager.getAll().find((x) => x.id === t.id);
        if (inRoot) TodoManager.removeById(t.id);
        else {
          ProjectManager.getAll().forEach((p) => {
            if (p.todos.find((x) => x.id === t.id)) {
              ProjectManager.removeTodoFromProject(p.id, t.id);
            }
          });
        }
        rerenderCurrent();
      }
    });

    right.appendChild(editBtn);
    right.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(right);

    container.appendChild(li);
  });
}

// Rerender according to currentTab and activeProjectId
function rerenderCurrent() {
  if (!tabTitle) {
    console.warn("tabTitle element missing");
    return;
  }
  if (
    !sections.todo ||
    !sections.notes ||
    !sections.projects ||
    !sections.today
  ) {
    console.warn("One or more section elements missing", sections);
    return;
  }
  if (!lists.todo || !lists.today || !lists.notes || !lists.projects) {
    console.warn("One or more list containers missing", lists);
    return;
  }

  // hide all sections first
  Object.values(sections).forEach((s) => s.classList.add("hidden"));

  if (currentTab === "todo") {
    tabTitle.textContent = "Todo";
    sections.todo.classList.remove("hidden");
    renderTodoCards(lists.todo, TodoManager.getAll());
    fab.style.display = "block";
  } else if (currentTab === "today") {
    tabTitle.textContent = "Today";
    sections.today.classList.remove("hidden");
    const all = getAllTodosAcross();
    const todayISO = new Date().toISOString().slice(0, 10);
    const todays = all.filter((t) => t.dueDate === todayISO);
    renderTodoCards(lists.today, todays);
    fab.style.display = "none";
  } else if (currentTab === "today") {
    tabTitle.textContent = "Today";
    sections.today.classList.remove("hidden");

    // Get all todos across root and projects
    const allTodos = getAllTodosAcross();

    // Get today date in YYYY-MM-DD format
    const todayISO = new Date().toISOString().slice(0, 10);

    // Filter all todos due today
    const todays = allTodos.filter((t) => t.dueDate && t.dueDate === todayISO);

    // Render them
    renderTodoCards(lists.today, todays);

    fab.style.display = "none";
  } else if (currentTab === "notes") {
    tabTitle.textContent = "Notes";
    sections.notes.classList.remove("hidden");
    renderNotesGrid();
    fab.style.display = "block";
  } else if (currentTab === "projects") {
    tabTitle.textContent = "Projects";
    sections.projects.classList.remove("hidden");
    if (!activeProjectId) {
      renderProjectsOverview();
      fab.style.display = "none";
    } else {
      renderProjectFolderView(activeProjectId);
      fab.style.display = "block";
    }
  }
}

// Render notes in grid
function renderNotesGrid() {
  if (!lists.notes) return;
  lists.notes.innerHTML = "";
  const all = NoteManager.getAll();
  if (!all || all.length === 0) {
    lists.notes.innerHTML = `<div class="text-gray-500">No notes yet.</div>`;
    return;
  }
  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4";
  all.forEach((n) => {
    const card = document.createElement("div");
    card.className = "bg-yellow-50 p-4 rounded shadow min-h-[200px] relative";
    card.innerHTML = `<div class="text-xs text-gray-500 mb-2">Note</div>
      <div class="whitespace-pre-wrap">${n.text}</div>
      <button class="absolute top-2 right-2 text-red-500 cursor-pointer" title="Delete note"><i class="fa-solid fa-trash"></i></button>`;
    card.querySelector("button").addEventListener("click", () => {
      if (confirm("Delete note?")) {
        NoteManager.removeById(n.id);
        renderNotesGrid();
      }
    });
    grid.appendChild(card);
  });
  lists.notes.appendChild(grid);
}

// projects overview and project folder view
function renderProjectsOverview() {
  if (!lists.projects) return;
  lists.projects.innerHTML = "";
  const projs = ProjectManager.getAll();
  if (!projs || projs.length === 0) {
    lists.projects.innerHTML = `<div class="text-gray-500">No projects yet.</div>`;
  }

  projs.forEach((p) => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "mb-3 bg-white p-3 rounded shadow cursor-pointer hover:bg-gray-50 transition";

    wrapper.addEventListener("click", () => {
      activeProjectId = p.id;
      setActiveTab("projects");
      rerenderCurrent();
    });

    const row = document.createElement("div");
    row.className = "flex items-center justify-between";

    const left = document.createElement("div");
    left.className = "flex items-center gap-3";
    left.innerHTML = `<div class="font-semibold">${p.name}</div>`;

    const right = document.createElement("div");
    right.className = "flex items-center gap-2";

    const delProj = document.createElement("button");
    delProj.className =
      "text-red-600 cursor-pointer hover:text-red-700 transition";
    delProj.title = "Delete project";
    delProj.innerHTML = `<i class="fa-solid fa-trash"></i>`;

    delProj.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Delete project and all its todos?")) {
        ProjectManager.removeProjectById(p.id);
        rerenderCurrent();
      }
    });

    right.appendChild(delProj);
    row.appendChild(left);
    row.appendChild(right);
    wrapper.appendChild(row);

    // preview of up to 2 todos
    const preview = document.createElement("div");
    preview.className = "mt-2";
    p.todos.slice(0, 2).forEach((t) => {
      const mini = document.createElement("div");
      mini.className = "bg-white p-2 rounded border mt-1 text-sm";
      mini.innerHTML = `<div class="font-medium">${t.title}</div>
        <div class="text-xs text-gray-500">${t.dueDate || ""} • ${
        t.priority
      }</div>`;
      preview.appendChild(mini);
    });

    if (preview.children.length) wrapper.appendChild(preview);
    lists.projects.appendChild(wrapper);
  });

  // "+ Add Project" button
  const addRow = document.createElement("div");
  addRow.className = "mt-4 ml-6";
  addRow.innerHTML = `<button id="add-project-toggle" class="text-blue-600 cursor-pointer hover:underline">+ Add Project</button>`;
  lists.projects.appendChild(addRow);

  // toggle to input form
  const toggle = document.getElementById("add-project-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const inputContainer = document.createElement("div");
      inputContainer.className =
        "mt-4 ml-6 bg-white p-4 rounded shadow flex flex-col gap-3 w-full max-w-md";

      inputContainer.innerHTML = `
        <input id="new-project-name" class="border p-2 rounded w-full" placeholder="Project name..." />
        <div class="flex justify-end gap-3">
          <button id="cancel-project" class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">Cancel</button>
          <button id="create-project" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">Create</button>
        </div>
      `;

      lists.projects.replaceChild(inputContainer, addRow);

      const createBtn = inputContainer.querySelector("#create-project");
      const cancelBtn = inputContainer.querySelector("#cancel-project");
      const nameInput = inputContainer.querySelector("#new-project-name");

      createBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (!name) return;
        ProjectManager.addProject(name);
        activeProjectId = null;
        rerenderCurrent();
      });

      cancelBtn.addEventListener("click", () => {
        rerenderCurrent();
      });
    });
  }
}

// project folder view
function renderProjectFolderView(projectId) {
  if (!lists.projects) return;
  const proj = ProjectManager.getAll().find((p) => p.id === projectId);
  if (!proj) {
    activeProjectId = null;
    return renderProjectsOverview();
  }
  lists.projects.innerHTML = "";

  const header = document.createElement("div");
  header.className = "flex items-center justify-between mb-3";
  header.innerHTML = `<div><div class="font-bold text-lg">${proj.name}</div><div class="text-sm text-gray-500">${proj.todos.length} todos</div></div>
    <div class="flex items-center gap-2">
      <button id="back-to-projects" class="text-gray-600"><i class="fa-solid fa-arrow-left"></i></button>
    </div>`;
  lists.projects.appendChild(header);

  const backBtn = document.getElementById("back-to-projects");
  if (backBtn)
    backBtn.addEventListener("click", () => {
      activeProjectId = null;
      rerenderCurrent();
    });
  const delBtn = document.getElementById("del-project");
  if (delBtn)
    delBtn.addEventListener("click", () => {
      if (confirm("Delete project and its todos?")) {
        ProjectManager.removeProjectById(proj.id);
        activeProjectId = null;
        rerenderCurrent();
      }
    });

  // todos list
  const listWrap = document.createElement("div");
  listWrap.className = "flex flex-col gap-3";
  if (!proj.todos || proj.todos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "text-gray-500";
    empty.textContent = "No todos yet. Click + to add to this project.";
    listWrap.appendChild(empty);
  } else {
    renderTodoCards(listWrap, proj.todos);
  }
  lists.projects.appendChild(listWrap);
}

// Modals: todo add/edit and note add
function openTodoModal({ folderProjectId = null, editTodo = null } = {}) {
  const title = editTodo ? editTodo.title : "";
  const desc = editTodo ? editTodo.description : "";
  const date = editTodo ? editTodo.dueDate : "";
  const prio = editTodo ? editTodo.priority : "Low";

  const html = `
    <div class="flex gap-6">
      <div class="flex-1">
        <div class="font-bold mb-2">${editTodo ? "Edit Todo" : "Add Todo"}</div>
        <input id="m-title" maxlength="50" placeholder="Title" value="${escape(
          title
        )}" class="w-full border p-2 rounded mb-3" />
        <textarea id="m-desc" maxlength="500" placeholder="Description" class="w-full border p-2 rounded h-40">${escape(
          desc
        )}</textarea>
      </div>
      <div class="w-56 pl-4 border-l">
        <div class="font-semibold mb-2">Priority</div>
        <div class="flex flex-col gap-2">
          <button id="prio-low" class="py-2 rounded ${
            prio === "Low" ? "bg-green-100" : ""
          }">Low</button>
          <button id="prio-med" class="py-2 rounded ${
            prio === "Medium" ? "bg-yellow-100" : ""
          }">Medium</button>
          <button id="prio-high" class="py-2 rounded ${
            prio === "High" ? "bg-red-100" : ""
          }">High</button>
        </div>
        <div class="mt-4">
          <div class="font-semibold mb-2">Due Date</div>
          <input id="m-date" type="date" value="${date}" class="w-full border p-2 rounded" />
        </div>
      </div>
    </div>
    <div class="flex justify-end gap-3 mt-4">
      <button id="modal-cancel" class="px-3 py-1">Cancel</button>
      <button id="modal-save" class="px-4 py-2 bg-blue-600 text-white rounded">${
        editTodo ? "Save" : "Add"
      }</button>
    </div>
  `;
  showModal(html);

  // priority selection
  let selected = prio;
  function markBtns() {
    const low = document.getElementById("prio-low");
    const med = document.getElementById("prio-med");
    const high = document.getElementById("prio-high");
    if (!low || !med || !high) return;
    low.classList.toggle("bg-green-100", selected === "Low");
    med.classList.toggle("bg-yellow-100", selected === "Medium");
    high.classList.toggle("bg-red-100", selected === "High");
  }
  markBtns();

  const lowBtn = document.getElementById("prio-low");
  const medBtn = document.getElementById("prio-med");
  const highBtn = document.getElementById("prio-high");
  if (lowBtn)
    lowBtn.addEventListener("click", () => {
      selected = "Low";
      markBtns();
    });
  if (medBtn)
    medBtn.addEventListener("click", () => {
      selected = "Medium";
      markBtns();
    });
  if (highBtn)
    highBtn.addEventListener("click", () => {
      selected = "High";
      markBtns();
    });

  const cancelBtn = document.getElementById("modal-cancel");
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  const saveBtn = document.getElementById("modal-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const t = document.getElementById("m-title").value.trim().slice(0, 50);
      const d = document.getElementById("m-desc").value.trim().slice(0, 500);
      const due = document.getElementById("m-date").value;
      if (!t) return alert("Title required (max 50 chars)");

      if (editTodo) {
        const inRoot = TodoManager.getAll().find((x) => x.id === editTodo.id);
        if (inRoot) {
          TodoManager.edit(editTodo.id, {
            title: t,
            description: d,
            dueDate: due,
            priority: selected,
          });
        } else {
          ProjectManager.getAll().forEach((p) => {
            if (p.todos.find((x) => x.id === editTodo.id)) {
              ProjectManager.editTodoInProject(p.id, editTodo.id, {
                title: t,
                description: d,
                dueDate: due,
                priority: selected,
              });
            }
          });
        }
      } else {
        if (folderProjectIdValid(folderProjectId)) {
          // create a root todo and add to project: we'll create a new todo via TodoManager and then move it (or directly push)
          const newTodo = TodoManager.add(t, d, due, selected); // adds to root
          // remove from root and add to project instead (to keep consistent)
          TodoManager.removeById(newTodo.id);
          ProjectManager.addTodoToProject(folderProjectId, newTodo);
        } else {
          TodoManager.add(t, d, due, selected);
        }
      }
      closeModal();
      rerenderCurrent();
    });
  }
}

// verify folderProjectId is a valid project id
function folderProjectIdValid(id) {
  if (!id) return false;
  return !!ProjectManager.getAll().find((p) => p.id === id);
}

// open note modal
function openNoteModal(editNote = null) {
  const text = editNote ? editNote.text : "";
  const html = `
    <!-- Modal Overlay --> <div class="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50"> <!-- Modal Box --> <div class="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full"> <div class="font-bold mb-2">${
      editNote ? "Edit Note" : "Add Note"
    }</div> <textarea id="m-note" maxlength="250" class="w-full border p-2 rounded h-44" >${escape(
    text
  )}</textarea> <div class="flex justify-end gap-2 mt-3"> <button id="note-cancel" class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">Cancel</button> <button id="note-save" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" > Save </button> </div> </div> </div>
  `;
  showModal(html);
  const cancel = document.getElementById("note-cancel");
  const save = document.getElementById("note-save");
  if (cancel) cancel.addEventListener("click", closeModal);
  if (save) {
    save.addEventListener("click", () => {
      const val = document.getElementById("m-note").value.trim().slice(0, 250);
      if (!val) return alert("Note cannot be empty");
      if (editNote) {
      } else {
        NoteManager.add(val);
      }
      closeModal();
      rerenderCurrent();
    });
  }
}

// nav link wiring
navLinks.forEach((ln) => {
  ln.addEventListener("click", () => {
    const tab = ln.dataset.tab;
    if (!tab) return;
    activeProjectId = null;
    setActiveTab(tab);
    rerenderCurrent();
  });
});

if (forms.todoForm) {
  forms.todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const titleEl = document.getElementById("todo-title");
    const descEl = document.getElementById("todo-description");
    const dateEl = document.getElementById("todo-date");
    const prioEl = document.getElementById("todo-priority");
    const title = titleEl ? titleEl.value.trim().slice(0, 50) : "";
    const desc = descEl ? descEl.value.trim().slice(0, 500) : "";
    const date = dateEl ? dateEl.value : "";
    const prio = prioEl ? prioEl.value : "Low";
    if (!title) return alert("Title required");
    TodoManager.add(title, desc, date, prio);
    e.target.reset();
    rerenderCurrent();
  });
}

if (forms.notesForm) {
  forms.notesForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const noteEl = document.getElementById("note-text");
    const noteText = noteEl ? noteEl.value.trim().slice(0, 250) : "";
    if (!noteText) return alert("Note required");
    NoteManager.add(noteText);
    e.target.reset();
    rerenderCurrent();
  });
}

if (forms.projectForm) {
  forms.projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameEl = document.getElementById("project-name");
    const name = nameEl ? nameEl.value.trim() : "";
    if (!name) return alert("Project name required");
    ProjectManager.addProject(name);
    e.target.reset();
    rerenderCurrent();
  });
}

// FAB behaviour
fab.addEventListener("click", () => {
  if (currentTab === "todo") openTodoModal({ folderProjectId: null });
  else if (currentTab === "notes") openNoteModal();
  else if (currentTab === "projects" && activeProjectId)
    openTodoModal({ folderProjectId: activeProjectId });
});

// initialize
setActiveTab("todo");
rerenderCurrent();

function escape(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default {
  openTodoModal,
  openNoteModal,
  rerenderCurrent,
};
