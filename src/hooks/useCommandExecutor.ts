import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { ParsedCommand } from './useCommandParser';

export interface CommandResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

interface UseCommandExecutorOptions {
    onSuccess?: (result: CommandResult) => void;
    onError?: (error: CommandResult) => void;
    onNavigate?: (destination: string) => void;
    onOpenProject?: (projectId: string) => void;
    onShowHelp?: () => void;
    onStopListening?: () => void;
}

export function useCommandExecutor(options: UseCommandExecutorOptions = {}) {
    const { profile } = useAuth();
    const {
        onSuccess,
        onError,
        onNavigate,
        onOpenProject,
        onShowHelp,
        onStopListening
    } = options;

    // Helper: Find project by name (fuzzy match)
    const findProjectByName = useCallback(async (projectName: string) => {
        try {
            // Fetch owned projects
            const { data: ownedProjects } = await supabase
                .from('projects')
                .select('id, name')
                .eq('owner_id', profile?.id)
                .ilike('name', `%${projectName}%`)
                .limit(5);

            // Fetch member projects
            const { data: memberData } = await supabase
                .from('project_members')
                .select('project_id, projects!inner(id, name)')
                .eq('user_id', profile?.id);

            const memberProjects = memberData?.map((m: any) => ({
                id: m.projects.id,
                name: m.projects.name
            })).filter((p: any) => p.name.toLowerCase().includes(projectName.toLowerCase())) || [];

            // Combine results
            const allProjects = [
                ...(ownedProjects || []),
                ...memberProjects
            ];

            // Remove duplicates
            const uniqueProjects = Array.from(
                new Map(allProjects.map((p: any) => [p.id, p])).values()
            );

            if (uniqueProjects.length === 0) {
                throw new Error(`Project "${projectName}" not found`);
            }

            // Exact match first, otherwise first result
            const exactMatch = uniqueProjects.find((p: any) => p.name.toLowerCase() === projectName.toLowerCase());
            return exactMatch || uniqueProjects[0];
        } catch (error) {
            throw new Error(`Project "${projectName}" not found`);
        }
    }, [profile?.id]);

    // Helper: Find task by identifier (ID or name)
    const findTaskByIdentifier = useCallback(async (identifier: string, projectId?: string) => {
        // Try as numeric ID first
        if (/^\d+$/.test(identifier)) {
            const { data: task, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', identifier)
                .single();

            if (!error && task) return task;
        }

        // Try as name
        let query = supabase
            .from('tasks')
            .select('*')
            .ilike('title', `%${identifier}%`)
            .limit(5);

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data: tasks, error } = await query;

        if (error) throw error;
        if (!tasks || tasks.length === 0) {
            throw new Error(`Task "${identifier}" not found`);
        }

        return tasks[0];
    }, []);

    // Helper: Parse natural language date
    const parseDate = useCallback((dateStr: string): string => {
        const today = new Date();
        const lower = dateStr.toLowerCase();

        if (lower === 'today') {
            return today.toISOString().split('T')[0];
        }

        if (lower === 'tomorrow') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }

        if (lower === 'next week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return nextWeek.toISOString().split('T')[0];
        }

        // Try to parse as date
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }

        throw new Error(`Could not parse date: ${dateStr}`);
    }, []);

    const executeCommand = useCallback(async (command: ParsedCommand): Promise<CommandResult> => {
        try {
            let result: CommandResult;

            switch (command.action) {
                // ============ TASK MANAGEMENT ============
                case 'add_task': {
                    const {
                        taskName,
                        projectName,
                        status,
                        priority,
                        description,
                        dueDate,
                        memberName,
                        tags
                    } = command.params;
                    const project = await findProjectByName(projectName);

                    let assigneeId = profile?.id;
                    if (memberName) {
                        const { data: members } = await supabase
                            .from('profiles')
                            .select('id')
                            .ilike('full_name', `%${memberName}%`)
                            .limit(1);

                        if (members && members.length > 0) {
                            assigneeId = members[0].id;
                        }
                    }

                    const insertData: any = {
                        title: taskName,
                        project_id: project.id,
                        status: status || 'todo',
                        priority: priority || 'medium',
                        created_by: profile?.id,
                        assigned_to: assigneeId,
                        description: description || '',
                        tags: tags || []
                    };

                    if (dueDate) {
                        insertData.due_date = parseDate(dueDate);
                    }

                    const { data, error } = await supabase
                        .from('tasks')
                        .insert(insertData)
                        .select()
                        .single();

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Task "${taskName}" added to ${project.name}`,
                        data
                    };
                    break;
                }

                case 'update_task': {
                    const {
                        taskIdentifier,
                        status,
                        priority,
                        description,
                        dueDate,
                        memberName,
                        tags
                    } = command.params;
                    const task = await findTaskByIdentifier(taskIdentifier);

                    const updateData: any = {};
                    if (status) updateData.status = status;
                    if (priority) updateData.priority = priority;
                    if (description !== undefined) updateData.description = description;
                    if (tags) updateData.tags = tags;

                    if (dueDate) {
                        updateData.due_date = parseDate(dueDate);
                    }

                    if (memberName) {
                        const { data: members } = await supabase
                            .from('profiles')
                            .select('id')
                            .ilike('full_name', `%${memberName}%`)
                            .limit(1);

                        if (members && members.length > 0) {
                            updateData.assigned_to = members[0].id;
                        }
                    }

                    const { error } = await supabase
                        .from('tasks')
                        .update(updateData)
                        .eq('id', task.id);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Task "${task.title}" updated successfully`
                    };
                    break;
                }

                case 'update_task_status': {
                    const { taskIdentifier, status } = command.params;
                    const task = await findTaskByIdentifier(taskIdentifier);

                    const { error } = await supabase
                        .from('tasks')
                        .update({ status })
                        .eq('id', task.id);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Task "${task.title}" moved to ${status.replace('_', ' ')}`
                    };
                    break;
                }

                case 'delete_task': {
                    const { taskIdentifier } = command.params;
                    const task = await findTaskByIdentifier(taskIdentifier);

                    const { error } = await supabase
                        .from('tasks')
                        .delete()
                        .eq('id', task.id);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Task "${task.title}" deleted`
                    };
                    break;
                }

                case 'update_task_priority': {
                    const { taskIdentifier, priority } = command.params;
                    const task = await findTaskByIdentifier(taskIdentifier);

                    const { error } = await supabase
                        .from('tasks')
                        .update({ priority })
                        .eq('id', task.id);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Task "${task.title}" priority set to ${priority}`
                    };
                    break;
                }

                case 'update_task_due_date': {
                    const { taskIdentifier, dueDate } = command.params;
                    const task = await findTaskByIdentifier(taskIdentifier);
                    const parsedDate = parseDate(dueDate);

                    const { error } = await supabase
                        .from('tasks')
                        .update({ due_date: parsedDate })
                        .eq('id', task.id);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Task "${task.title}" due date set to ${parsedDate}`
                    };
                    break;
                }

                case 'assign_task': {
                    const { taskIdentifier, memberName } = command.params;
                    const task = await findTaskByIdentifier(taskIdentifier);

                    // Find member by name
                    const { data: members, error: memberError } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .ilike('full_name', `%${memberName}%`)
                        .limit(5);

                    if (memberError) throw memberError;
                    if (!members || members.length === 0) {
                        throw new Error(`Member "${memberName}" not found`);
                    }

                    const { error } = await supabase
                        .from('tasks')
                        .update({ assigned_to: members[0].id })
                        .eq('id', task.id);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Task "${task.title}" assigned to ${members[0].full_name}`
                    };
                    break;
                }

                // ============ PROJECT MANAGEMENT ============
                case 'create_project': {
                    const { projectName } = command.params;

                    const { data, error } = await supabase
                        .from('projects')
                        .insert({
                            name: projectName,
                            created_by: profile?.id
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Project "${projectName}" created`,
                        data
                    };
                    break;
                }

                case 'open_project': {
                    const { projectName } = command.params;
                    const project = await findProjectByName(projectName);

                    if (onOpenProject) {
                        onOpenProject(project.id);
                    }

                    result = {
                        success: true,
                        message: `Opening project "${project.name}"`,
                        data: project
                    };
                    break;
                }

                case 'show_projects': {
                    const { data: projects, error } = await supabase
                        .from('projects')
                        .select('id, name')
                        .or(`created_by.eq.${profile?.id},id.in.(select project_id from project_members where user_id.eq.${profile?.id})`)
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Found ${projects?.length || 0} projects`,
                        data: projects
                    };
                    break;
                }

                case 'delete_project': {
                    const { projectName } = command.params;
                    const project = await findProjectByName(projectName);

                    const { error } = await supabase
                        .from('projects')
                        .delete()
                        .eq('id', project.id);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Project "${project.name}" deleted`
                    };
                    break;
                }

                // ============ NAVIGATION ============
                case 'navigate': {
                    const { destination } = command.params;

                    if (onNavigate) {
                        onNavigate(destination);
                    }

                    result = {
                        success: true,
                        message: `Navigating to ${destination}`
                    };
                    break;
                }

                case 'show_section': {
                    const { section } = command.params;

                    result = {
                        success: true,
                        message: `Showing ${section}`,
                        data: { section }
                    };
                    break;
                }

                // ============ QUERIES ============
                case 'count_tasks': {
                    const { projectName } = command.params;
                    const project = await findProjectByName(projectName);

                    const { count, error } = await supabase
                        .from('tasks')
                        .select('*', { count: 'exact', head: true })
                        .eq('project_id', project.id);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `${project.name} has ${count} tasks`,
                        data: { count }
                    };
                    break;
                }

                case 'filter_tasks_by_priority': {
                    const { priority } = command.params;

                    const { data: tasks, error } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('priority', priority)
                        .or(`assigned_to.eq.${profile?.id},created_by.eq.${profile?.id}`);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Found ${tasks?.length || 0} ${priority} priority tasks`,
                        data: tasks
                    };
                    break;
                }

                case 'show_my_tasks': {
                    const { data: tasks, error } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('assigned_to', profile?.id)
                        .neq('status', 'done');

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `You have ${tasks?.length || 0} active tasks`,
                        data: tasks
                    };
                    break;
                }

                case 'show_next_task': {
                    const { data: tasks, error } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('assigned_to', profile?.id)
                        .neq('status', 'done')
                        .order('due_date', { ascending: true, nullsFirst: false })
                        .limit(1);

                    if (error) throw error;

                    if (tasks && tasks.length > 0) {
                        result = {
                            success: true,
                            message: `Your next task: "${tasks[0].title}"`,
                            data: tasks[0]
                        };
                    } else {
                        result = {
                            success: true,
                            message: 'You have no pending tasks'
                        };
                    }
                    break;
                }

                case 'filter_tasks_by_due_date': {
                    const { timeframe } = command.params;
                    const today = new Date();
                    let startDate: Date;
                    let endDate: Date;

                    if (timeframe === 'today') {
                        startDate = new Date(today.setHours(0, 0, 0, 0));
                        endDate = new Date(today.setHours(23, 59, 59, 999));
                    } else if (timeframe === 'tomorrow') {
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        startDate = new Date(tomorrow.setHours(0, 0, 0, 0));
                        endDate = new Date(tomorrow.setHours(23, 59, 59, 999));
                    } else {
                        // this week
                        startDate = new Date(today.setHours(0, 0, 0, 0));
                        endDate = new Date(today);
                        endDate.setDate(endDate.getDate() + 7);
                    }

                    const { data: tasks, error } = await supabase
                        .from('tasks')
                        .select('*')
                        .gte('due_date', startDate.toISOString())
                        .lte('due_date', endDate.toISOString())
                        .or(`assigned_to.eq.${profile?.id},created_by.eq.${profile?.id}`);

                    if (error) throw error;

                    result = {
                        success: true,
                        message: `Found ${tasks?.length || 0} tasks due ${timeframe}`,
                        data: tasks
                    };
                    break;
                }

                // ============ SYSTEM ============
                case 'show_help': {
                    if (onShowHelp) {
                        onShowHelp();
                    }

                    result = {
                        success: true,
                        message: 'Showing available commands'
                    };
                    break;
                }

                case 'stop_listening': {
                    if (onStopListening) {
                        onStopListening();
                    }

                    result = {
                        success: true,
                        message: 'Voice assistant stopped'
                    };
                    break;
                }

                default:
                    throw new Error(`Unknown command action: ${command.action}`);
            }

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (error: any) {
            const errorResult: CommandResult = {
                success: false,
                message: 'Command failed',
                error: error.message || 'Unknown error occurred'
            };

            if (onError) {
                onError(errorResult);
            }

            return errorResult;
        }
    }, [profile?.id, findProjectByName, findTaskByIdentifier, parseDate, onSuccess, onError, onNavigate, onOpenProject, onShowHelp, onStopListening]);

    return {
        executeCommand
    };
}
