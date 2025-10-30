import { Todo, Note, Project } from "./todo-factory.js";

const Storage = {
  saveTodos(todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
  },
  saveNotes(notes) {
    localStorage.setItem("notes", JSON.stringify(notes));
  },
  saveProjects(projects) {
    localStorage.setItem("projects", JSON.stringify(projects));
  },

  loadTodos() {
    const data = localStorage.getItem("todos");
    if (data) {
      return JSON.parse(data).map(
        (t) =>
          new Todo(
            t.title,
            t.description,
            t.dueDate,
            t.priority,
            t.completed,
            t.id
          )
      );
    }

    // Create default todos if none exist
    const today = new Date();
    const formatDate = (d) => d.toISOString().slice(0, 10);
    const currentDate = formatDate(today);
    const futureDate = formatDate(
      new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
    );

    const defaults = [
      new Todo("Buy groceries", "Milk, eggs, and bread", currentDate, "High"),
      new Todo(
        "Study JavaScript",
        "Review ES6 and DOM manipulation",
        currentDate,
        "Medium"
      ),
      new Todo("Workout", "Do 30 minutes of cardio", currentDate, "Low"),
      new Todo(
        "Plan weekend trip",
        "Choose location and book tickets",
        futureDate,
        "Medium"
      ),
      new Todo(
        "Pay bills",
        "Electricity and internet due soon",
        futureDate,
        "High"
      ),
    ];

    this.saveTodos(defaults);
    return defaults;
  },

  loadNotes() {
    const data = localStorage.getItem("notes");
    if (data) {
      return JSON.parse(data).map((n) => new Note(n.text, n.id));
    }

    const defaults = [
      new Note("Meeting notes: Discussed new project ideas."),
      new Note("Remember to call mom this weekend."),
      new Note("Book to read: 'Clean Code' by Robert C. Martin."),
      new Note("Ideas: build a habit tracker web app."),
      new Note("Quote: 'Simplicity is the soul of efficiency.'"),
      new Note("Recipe: Pasta with garlic, olive oil, and chili flakes."),
    ];

    this.saveNotes(defaults);
    return defaults;
  },

  loadProjects() {
    const data = localStorage.getItem("projects");
    if (data) {
      return JSON.parse(data).map((p) => {
        const project = new Project(p.name, p.id);
        if (Array.isArray(p.todos)) {
          p.todos.forEach((t) => {
            const todo = new Todo(
              t.title,
              t.description,
              t.dueDate,
              t.priority,
              t.completed,
              t.id
            );
            project.addTodo(todo);
          });
        }
        return project;
      });
    }
  },
};

export default Storage;
