/**
 * ========================================================
 * CSE343 Web Development - Section 4 / Lab 4: Todo App
 * Advanced JavaScript & TypeScript Implementation:
 *   - ES6 Classes, Constructors, Getters & Setters
 *   - Array Methods: filter(), map(), push(), splice()
 *   - Array Destructuring & Spread/Rest Operators
 *   - Arrow Functions & Template Literals
 *   - TypeScript Static Types, Interfaces & Strict Compilation
 * ========================================================
 */

// --------------------------------------------------------
// 1. TypeScript Types & Interfaces (Slide 23, 30)
// --------------------------------------------------------

interface ITodoData {
    id: string;
    text: string;
    completed: boolean;
    createdAt?: number;
}

type FilterType = 'all' | 'active' | 'completed';

// --------------------------------------------------------
// 2. ES6 Class Model with Getters & Setters (Slide 15, 16)
// --------------------------------------------------------

class TodoItem {
    private _id: string;
    private _text: string;
    private _completed: boolean;
    private _createdAt: number;

    constructor(text: string, completed: boolean = false, id?: string) {
        this._id = id ?? `todo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        this._text = text.trim();
        this._completed = completed;
        this._createdAt = Date.now();
    }

    // Getters and Setters (Slide 16)
    get id(): string {
        return this._id;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
            this._text = trimmed;
        }
    }

    get completed(): boolean {
        return this._completed;
    }

    set completed(value: boolean) {
        this._completed = value;
    }

    get createdAt(): number {
        return this._createdAt;
    }

    /**
     * Toggles the completed status of the item.
     */
    public toggle(): void {
        this._completed = !this._completed;
    }

    /**
     * Converts the TodoItem to a plain data object for persistence.
     */
    public toJSON(): ITodoData {
        return {
            id: this._id,
            text: this._text,
            completed: this._completed,
            createdAt: this._createdAt,
        };
    }

    /**
     * Factory method creating a TodoItem from raw data using destructuring (Slide 12).
     */
    public static fromJSON(data: ITodoData): TodoItem {
        const { text, completed, id } = data;
        return new TodoItem(text, completed, id);
    }
}

// --------------------------------------------------------
// 3. Main Application Class (Slide 15)
// --------------------------------------------------------

class TodoApp {
    private todos: TodoItem[] = [];
    private currentFilter: FilterType = 'all';
    private readonly storageKey: string = 'cse343_todos_v1';

    // DOM Elements
    private formElement: HTMLFormElement;
    private inputElement: HTMLInputElement;
    private listElement: HTMLUListElement;
    private itemsLeftElement: HTMLElement;
    private clearCompletedBtn: HTMLButtonElement;
    private clearAllBtn: HTMLButtonElement;
    private filterButtons: NodeListOf<HTMLButtonElement>;

    constructor() {
        // DOM Selection (as taught in Lab 3 & 4)
        this.formElement = document.getElementById('todo-form') as HTMLFormElement;
        this.inputElement = document.getElementById('todo-input') as HTMLInputElement;
        this.listElement = document.getElementById('todo-list') as HTMLUListElement;
        this.itemsLeftElement = document.getElementById('items-left') as HTMLElement;
        this.clearCompletedBtn = document.getElementById('clear-completed-btn') as HTMLButtonElement;
        this.clearAllBtn = document.getElementById('clear-all-btn') as HTMLButtonElement;
        this.filterButtons = document.querySelectorAll('.filter-btn');

        this.init();
    }

    /**
     * Initial setup: loads data, binds events, and performs initial render.
     */
    private init(): void {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    }

    /**
     * Loads saved todos from localStorage.
     * If empty, populates default items matching Slide 35 ("See Lecture", "Solve assignment").
     */
    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed: ITodoData[] = JSON.parse(stored);
                // Array map method (Slide 10)
                this.todos = parsed.map((item) => TodoItem.fromJSON(item));
            } else {
                // Default initial items from Slide 35 screenshot
                this.todos = [
                    new TodoItem('See Lecture', false),
                    new TodoItem('Solve assignment', false)
                ];
                this.saveToStorage();
            }
        } catch {
            this.todos = [
                new TodoItem('See Lecture', false),
                new TodoItem('Solve assignment', false)
            ];
        }
    }

    /**
     * Saves current todos to localStorage using Array.prototype.map (Slide 10).
     */
    private saveToStorage(): void {
        try {
            const serialized = this.todos.map((todo) => todo.toJSON());
            localStorage.setItem(this.storageKey, JSON.stringify(serialized));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    /**
     * Registers all DOM event listeners using addEventListener.
     */
    private bindEvents(): void {
        // Form submission: adding a new todo
        this.formElement.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.addTodo(this.inputElement.value);
            this.inputElement.value = '';
            this.inputElement.focus();
        });

        // Filter button clicks
        this.filterButtons.forEach((btn: HTMLButtonElement) => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter as FilterType;
                if (filter && this.currentFilter !== filter) {
                    this.setFilter(filter);
                }
            });
        });

        // Clear completed button
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        // Clear all button
        this.clearAllBtn.addEventListener('click', () => {
            this.clearAll();
        });
    }

    /**
     * Adds a new Todo item using Spread syntax (Slide 13).
     * @param text Todo title
     */
    public addTodo(text: string): void {
        const cleanText = text.trim();
        if (!cleanText) return;

        const newTodo = new TodoItem(cleanText);
        // Using Spread operator (...) to prepend item (Slide 13)
        this.todos = [...this.todos, newTodo];

        this.saveToStorage();
        this.render();
    }

    /**
     * Toggles completion status of a todo by id.
     * @param id Target todo id
     */
    public toggleTodo(id: string): void {
        const target = this.todos.find((t) => t.id === id);
        if (target) {
            target.toggle();
            this.saveToStorage();
            this.render();
        }
    }

    /**
     * Deletes a todo using Array.prototype.filter (Slide 11).
     * @param id Target todo id
     */
    public deleteTodo(id: string): void {
        // Filter out the deleted item (Slide 11)
        this.todos = this.todos.filter((t) => t.id !== id);
        this.saveToStorage();
        this.render();
    }

    /**
     * Updates the text of an existing todo.
     * @param id Target todo id
     * @param newText New text
     */
    public updateTodoText(id: string, newText: string): void {
        const target = this.todos.find((t) => t.id === id);
        if (target) {
            const clean = newText.trim();
            if (clean) {
                target.text = clean;
            } else {
                // If user cleared text completely, remove the item
                this.deleteTodo(id);
                return;
            }
            this.saveToStorage();
            this.render();
        }
    }

    /**
     * Sets active filter and updates active button state.
     * @param filter 'all' | 'active' | 'completed'
     */
    public setFilter(filter: FilterType): void {
        this.currentFilter = filter;
        this.filterButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    /**
     * Clears all completed items using Array.prototype.filter (Slide 11).
     */
    public clearCompleted(): void {
        this.todos = this.todos.filter((todo) => !todo.completed);
        this.saveToStorage();
        this.render();
    }

    /**
     * Clears all todos from the application.
     */
    public clearAll(): void {
        this.todos = [];
        this.saveToStorage();
        this.render();
    }

    /**
     * Filters todos according to the current active filter (Slide 11).
     * @returns Filtered array of TodoItems
     */
    private getFilteredTodos(): TodoItem[] {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter((todo) => !todo.completed);
            case 'completed':
                return this.todos.filter((todo) => todo.completed);
            case 'all':
            default:
                return this.todos;
        }
    }

    /**
     * Renders the current list of items, active counter, and actions.
     */
    public render(): void {
        // Clear existing items
        this.listElement.innerHTML = '';

        const filtered = this.getFilteredTodos();

        if (filtered.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.className = 'empty-placeholder';
            emptyMsg.textContent =
                this.currentFilter === 'all'
                    ? 'No tasks yet. Add one above!'
                    : `No ${this.currentFilter} tasks.`;
            this.listElement.appendChild(emptyMsg);
        } else {
            // Render each filtered item using document.createElement & appendChild (Lab 3 Slide 14)
            filtered.forEach((todo: TodoItem) => {
                const li = this.createTodoElement(todo);
                this.listElement.appendChild(li);
            });
        }

        // Calculate active remaining items using Array.prototype.filter (Slide 11)
        const activeCount = this.todos.filter((todo) => !todo.completed).length;

        // Update items left counter using Template Literals (Slide 3 & 15)
        this.itemsLeftElement.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
    }

    /**
     * Creates a DOM element representing a single todo item.
     * Supports clicking checkbox to toggle, double-clicking text to edit inline, and delete button.
     * @param todo TodoItem instance
     */
    private createTodoElement(todo: TodoItem): HTMLLIElement {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        // Content wrapper (Checkbox + Text)
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'todo-content-wrapper';

        // Checkbox button
        const checkbox = document.createElement('button');
        checkbox.type = 'button';
        checkbox.className = 'todo-checkbox';
        checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTodo(todo.id);
        });

        // Text label
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        // Double-click to edit feature as instructed in Slide 35 tip:
        // "Tip: double-click a todo to edit. Press Enter to save."
        textSpan.addEventListener('dblclick', () => {
            this.enableInlineEditing(contentWrapper, textSpan, todo);
        });

        contentWrapper.appendChild(checkbox);
        contentWrapper.appendChild(textSpan);

        // Delete (Trash) button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-delete';
        deleteBtn.setAttribute('aria-label', `Delete "${todo.text}"`);
        deleteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
        `;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTodo(todo.id);
        });

        li.appendChild(contentWrapper);
        li.appendChild(deleteBtn);

        return li;
    }

    /**
     * Enables inline editing for a todo item upon double click.
     */
    private enableInlineEditing(
        wrapper: HTMLElement,
        textSpan: HTMLElement,
        todo: TodoItem
    ): void {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-edit-input';
        input.value = todo.text;

        // Replace textSpan with input
        wrapper.replaceChild(input, textSpan);
        input.focus();
        input.setSelectionRange(0, input.value.length);

        let committed = false;

        const commitChange = (): void => {
            if (committed) return;
            committed = true;
            this.updateTodoText(todo.id, input.value);
        };

        const cancelChange = (): void => {
            if (committed) return;
            committed = true;
            this.render();
        };

        input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                commitChange();
            } else if (e.key === 'Escape') {
                cancelChange();
            }
        });

        input.addEventListener('blur', () => {
            commitChange();
        });
    }
}

// --------------------------------------------------------
// 4. Initialize Application on DOMContentLoaded
// --------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
