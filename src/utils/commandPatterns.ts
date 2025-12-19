export interface CommandPattern {
    pattern: RegExp;
    action: string;
    description: string;
    examples: string[];
    extract: (match: RegExpMatchArray) => Record<string, any>;
}

export const commandPatterns: CommandPattern[] = [
    // ============ TASK MANAGEMENT ============
    {
        pattern: /add task (.+?) to (?:project )?(.+?)(?:\s+with priority\s+(high|medium|low))?$/i,
        action: 'add_task',
        description: 'Create a new task in a project',
        examples: [
            'add task buy groceries to URewards',
            'add task fix login bug to URewards with priority high'
        ],
        extract: (match) => ({
            taskName: match[1].trim(),
            projectName: match[2].trim(),
            priority: match[3]?.toLowerCase() || 'medium'
        })
    },
    {
        pattern: /move task (.+?) to (to do|todo|in progress|done)$/i,
        action: 'update_task_status',
        description: 'Update task status',
        examples: [
            'move task 5 to in progress',
            'move task buy groceries to done'
        ],
        extract: (match) => ({
            taskIdentifier: match[1].trim(),
            status: match[2].toLowerCase().replace(/\s+/g, '_').replace('todo', 'to_do')
        })
    },
    {
        pattern: /delete task (.+)$/i,
        action: 'delete_task',
        description: 'Delete a task',
        examples: ['delete task 5', 'delete task buy groceries'],
        extract: (match) => ({
            taskIdentifier: match[1].trim()
        })
    },
    {
        pattern: /assign task (.+?) to (.+)$/i,
        action: 'assign_task',
        description: 'Assign task to a team member',
        examples: ['assign task 5 to John'],
        extract: (match) => ({
            taskIdentifier: match[1].trim(),
            memberName: match[2].trim()
        })
    },
    {
        pattern: /set task (.+?) priority to (high|medium|low)$/i,
        action: 'update_task_priority',
        description: 'Update task priority',
        examples: ['set task 5 priority to high'],
        extract: (match) => ({
            taskIdentifier: match[1].trim(),
            priority: match[2].toLowerCase()
        })
    },
    {
        pattern: /set task (.+?) due date to (.+)$/i,
        action: 'update_task_due_date',
        description: 'Set task due date',
        examples: ['set task 5 due date to tomorrow', 'set task 5 due date to December 25'],
        extract: (match) => ({
            taskIdentifier: match[1].trim(),
            dueDate: match[2].trim()
        })
    },

    // ============ PROJECT MANAGEMENT ============
    {
        pattern: /create project (.+)$/i,
        action: 'create_project',
        description: 'Create a new project',
        examples: ['create project Marketing Campaign'],
        extract: (match) => ({
            projectName: match[1].trim()
        })
    },
    {
        pattern: /open project (.+)$/i,
        action: 'open_project',
        description: 'Navigate to a project',
        examples: ['open project URewards'],
        extract: (match) => ({
            projectName: match[1].trim()
        })
    },
    {
        pattern: /show all projects$/i,
        action: 'show_projects',
        description: 'List all projects',
        examples: ['show all projects'],
        extract: () => ({})
    },
    {
        pattern: /delete project (.+)$/i,
        action: 'delete_project',
        description: 'Delete a project',
        examples: ['delete project Marketing'],
        extract: (match) => ({
            projectName: match[1].trim()
        })
    },

    // ============ NAVIGATION ============
    {
        pattern: /go to (home|profile|dashboard)$/i,
        action: 'navigate',
        description: 'Navigate to a page',
        examples: ['go to home', 'go to profile'],
        extract: (match) => ({
            destination: match[1].toLowerCase()
        })
    },
    {
        pattern: /show (invitations|members|settings)$/i,
        action: 'show_section',
        description: 'Display a specific section',
        examples: ['show invitations', 'show members'],
        extract: (match) => ({
            section: match[1].toLowerCase()
        })
    },

    // ============ QUERIES ============
    {
        pattern: /how many tasks in (?:project )?(.+)$/i,
        action: 'count_tasks',
        description: 'Count tasks in a project',
        examples: ['how many tasks in URewards'],
        extract: (match) => ({
            projectName: match[1].trim()
        })
    },
    {
        pattern: /show (high|medium|low) priority tasks$/i,
        action: 'filter_tasks_by_priority',
        description: 'Filter tasks by priority',
        examples: ['show high priority tasks'],
        extract: (match) => ({
            priority: match[1].toLowerCase()
        })
    },
    {
        pattern: /show my tasks$/i,
        action: 'show_my_tasks',
        description: 'Show tasks assigned to you',
        examples: ['show my tasks'],
        extract: () => ({})
    },
    {
        pattern: /what(?:'s| is) my next task$/i,
        action: 'show_next_task',
        description: 'Show your next upcoming task',
        examples: ["what's my next task"],
        extract: () => ({})
    },
    {
        pattern: /list tasks due (today|tomorrow|this week)$/i,
        action: 'filter_tasks_by_due_date',
        description: 'Filter tasks by due date',
        examples: ['list tasks due today', 'list tasks due this week'],
        extract: (match) => ({
            timeframe: match[1].toLowerCase()
        })
    },

    // ============ SYSTEM ============
    {
        pattern: /^(help|show commands|what can you do)$/i,
        action: 'show_help',
        description: 'Display available commands',
        examples: ['help', 'show commands'],
        extract: () => ({})
    },
    {
        pattern: /^(stop listening|stop|cancel)$/i,
        action: 'stop_listening',
        description: 'Deactivate voice assistant',
        examples: ['stop listening', 'cancel'],
        extract: () => ({})
    }
];

// Helper function to find matching pattern
export function findMatchingPattern(transcript: string): {
    pattern: CommandPattern;
    match: RegExpMatchArray;
    params: Record<string, any>;
} | null {
    const cleanTranscript = transcript.trim();

    for (const pattern of commandPatterns) {
        const match = cleanTranscript.match(pattern.pattern);
        if (match) {
            return {
                pattern,
                match,
                params: pattern.extract(match)
            };
        }
    }

    return null;
}

// Helper to get all commands grouped by category
export function getCommandsByCategory() {
    return {
        'Task Management': commandPatterns.filter(p =>
            ['add_task', 'update_task_status', 'delete_task', 'assign_task',
                'update_task_priority', 'update_task_due_date'].includes(p.action)
        ),
        'Project Management': commandPatterns.filter(p =>
            ['create_project', 'open_project', 'show_projects', 'delete_project'].includes(p.action)
        ),
        'Navigation': commandPatterns.filter(p =>
            ['navigate', 'show_section'].includes(p.action)
        ),
        'Queries': commandPatterns.filter(p =>
            ['count_tasks', 'filter_tasks_by_priority', 'show_my_tasks',
                'show_next_task', 'filter_tasks_by_due_date'].includes(p.action)
        ),
        'System': commandPatterns.filter(p =>
            ['show_help', 'stop_listening'].includes(p.action)
        )
    };
}
