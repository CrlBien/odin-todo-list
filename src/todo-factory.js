class Todo {
  constructor(title, description = "", dueDate = "", priority = "Low") {
    this.id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.title = title.slice(0, 50);
    this.description = description.slice(0, 500);
    this.dueDate = dueDate || "";
    this.priority = priority;
    this.completed = false;
    this.expanded = false;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
  }

  update({ title, description, dueDate, priority }) {
    if (title !== undefined) this.title = String(title).slice(0, 50);
    if (description !== undefined)
      this.description = String(description).slice(0, 500);
    if (dueDate !== undefined) this.dueDate = dueDate;
    if (priority !== undefined) this.priority = priority;
  }

  serialize() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      completed: this.completed,
      expanded: this.expanded,
    };
  }

  static deserialize(obj) {
    const t = new Todo(
      obj.title || "",
      obj.description || "",
      obj.dueDate || "",
      obj.priority || "Low"
    );
    t.id = obj.id || t.id;
    t.completed = !!obj.completed;
    t.expanded = !!obj.expanded;
    return t;
  }
}

class Note {
  constructor(text = "") {
    this.id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.text = String(text).slice(0, 250);
  }

  serialize() {
    return { id: this.id, text: this.text };
  }

  static deserialize(obj) {
    const n = new Note(obj.text || "");
    n.id = obj.id || n.id;
    return n;
  }
}

class Project {
  constructor(name) {
    this.id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.name = String(name).slice(0, 100);
    this.todos = []; // array of Todo instances
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  removeTodoById(todoId) {
    const idx = this.todos.findIndex((t) => t.id === todoId);
    if (idx > -1) this.todos.splice(idx, 1);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      todos: this.todos.map((t) => t.serialize()),
    };
  }

  static deserialize(obj) {
    const p = new Project(obj.name || "Untitled");
    p.id = obj.id || p.id;
    if (Array.isArray(obj.todos)) {
      p.todos = obj.todos.map((to) => Todo.deserialize(to));
    }
    return p;
  }
}

export { Todo, Note, Project };
