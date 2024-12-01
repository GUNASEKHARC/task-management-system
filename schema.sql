CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    status TEXT CHECK(status IN ('Pending', 'Completed')) DEFAULT 'Pending'
);
