const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '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';
const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

// Debug: Log API key status (first 10 chars only for security)
console.log('Groq API Key loaded:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

export interface TranscriptionResult {
    text: string;
    duration?: number;
    confidence?: number;
}

export interface CommandParseResult {
    action: string;
    params: Record<string, any>;
    confidence: number;
    message?: string;
}

/**
 * Transcribe audio using Groq's Whisper API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    if (!GROQ_API_KEY) {
        throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env.local file');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'json');
    formData.append('language', 'en');

    try {
        const response = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Transcription failed');
        }

        const data = await response.json();
        console.log('Groq Whisper transcription:', data.text);

        return {
            text: data.text,
            duration: data.duration,
            confidence: 0.9
        };
    } catch (error: any) {
        console.error('Groq transcription error:', error);
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
}

/**
 * Parse natural language command using Groq's Llama 3.1
 */
export async function parseCommand(transcript: string): Promise<CommandParseResult> {
    if (!GROQ_API_KEY) {
        throw new Error('Groq API key not configured');
    }

    const systemPrompt = `You are a voice command parser for KalKorbo, a task management system.
Convert natural language commands into structured JSON.

Available actions:
- add_task: Create a new task (params: taskName, projectName, priority?)
- update_task_status: Change task status (params: taskIdentifier, status: todo|in_progress|done)
- delete_task: Remove a task (params: taskIdentifier)
- assign_task: Assign task to member (params: taskIdentifier, memberName)
- set_priority: Set task priority (params: taskIdentifier, priority: high|medium|low)
- set_due_date: Set task due date (params: taskIdentifier, dueDate)
- create_project: Create new project (params: projectName)
- open_project: Navigate to project (params: projectName)
- show_projects: List all projects (params: {})
- delete_project: Delete project (params: projectName)
- navigate: Go to page (params: destination: home|profile|dashboard)
- show_section: Display section (params: section: invitations|members|settings)
- count_tasks: Count tasks in project (params: projectName)
- filter_tasks_by_priority: Filter by priority (params: priority: high|medium|low)
- show_my_tasks: Show user's tasks (params: {})
- show_next_task: Show next upcoming task (params: {})
- filter_tasks_by_due_date: Filter by due date (params: timeframe: today|tomorrow|this week)
- show_help: Display help (params: {})
- stop_listening: Stop voice assistant (params: {})

Respond ONLY with valid JSON in this exact format:
{
  "action": "action_name",
  "params": { ... },
  "confidence": 0.0-1.0
}

If unclear or unrelated to task management:
{
  "action": "unknown",
  "params": {},
  "confidence": 0.0,
  "message": "I didn't understand that command. Try saying 'help' to see available commands."
}

Examples:
- "add task buy groceries to URewards" → {"action": "add_task", "params": {"taskName": "buy groceries", "projectName": "URewards"}, "confidence": 0.95}
- "move task 5 to done" → {"action": "update_task_status", "params": {"taskIdentifier": "5", "status": "done"}, "confidence": 0.9}
- "stop" → {"action": "stop_listening", "params": {}, "confidence": 1.0}`;

    try {
        const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: transcript
                    }
                ],
                temperature: 0.1,
                max_tokens: 500,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Command parsing failed');
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return {
            action: result.action || 'unknown',
            params: result.params || {},
            confidence: result.confidence || 0,
            message: result.message
        };
    } catch (error: any) {
        console.error('Groq parsing error:', error);
        throw new Error(`Failed to parse command: ${error.message}`);
    }
}

/**
 * Test Groq API connection
 */
export async function testGroqConnection(): Promise<boolean> {
    if (!GROQ_API_KEY) {
        return false;
    }

    try {
        const response = await fetch(`${GROQ_API_BASE}/models`, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`
            }
        });
        return response.ok;
    } catch {
        return false;
    }
}
