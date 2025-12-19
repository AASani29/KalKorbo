import { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useCommandExecutor, CommandResult } from '../../hooks/useCommandExecutor';
import { transcribeAudio, parseCommand as parseCommandWithAI } from '../../services/groqService';
import { VoiceButton } from './VoiceButton';
import { VoiceDisplay } from './VoiceDisplay';
import { VoiceFeedback } from './VoiceFeedback';
import { VoiceHelp } from './VoiceHelp';
import { VoiceConfirmation } from './VoiceConfirmation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { findBestMatches } from '../../utils/fuzzyMatch';

interface VoiceAssistantProps {
  onNavigate?: (destination: string) => void;
  onOpenProject?: (projectId: string) => void;
  onRefresh?: () => void;
}

type ProcessingStage = 'idle' | 'recording' | 'transcribing' | 'understanding' | 'confirming' | 'executing';

export function VoiceAssistant({ onNavigate, onOpenProject, onRefresh }: VoiceAssistantProps) {
  const { profile } = useAuth();
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsedCommandText, setParsedCommandText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showHelp, setShowHelp] = useState(false);
  
  // Confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<any>(null);
  const [projectSuggestions, setProjectSuggestions] = useState<Array<{ id: string; name: string; score: number }>>([]);
  const [suggestedProjectName, setSuggestedProjectName] = useState<string>('');

  const {
    isRecording,
    recordingTime,
    audioBlob,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  const handleSuccess = useCallback((result: CommandResult) => {
    setFeedback({ type: 'success', message: result.message });
    setProcessingStage('idle');
    setParsedCommandText(null);
    setTranscript('');
    resetRecording();
    
    if (onRefresh) {
      setTimeout(onRefresh, 500);
    }
  }, [onRefresh, resetRecording]);

  const handleError = useCallback((result: CommandResult) => {
    setFeedback({ 
      type: 'error', 
      message: result.error || result.message 
    });
    setProcessingStage('idle');
    setParsedCommandText(null);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
    if (isRecording) {
      stopRecording();
    }
    setProcessingStage('idle');
    setTranscript('');
    setParsedCommandText(null);
    resetRecording();
  }, [isRecording, stopRecording, resetRecording]);

  const handleStopListening = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    setProcessingStage('idle');
    setTranscript('');
    setParsedCommandText(null);
    resetRecording();
    setFeedback({ type: 'info', message: 'Voice assistant stopped' });
  }, [isRecording, stopRecording, resetRecording]);

  const { executeCommand } = useCommandExecutor({
    onSuccess: handleSuccess,
    onError: handleError,
    onNavigate,
    onOpenProject,
    onShowHelp: handleShowHelp,
    onStopListening: handleStopListening
  });

  // Fetch user's projects for suggestions
  const fetchUserProjects = useCallback(async () => {
    if (!profile?.id) return [];
    
    try {
      // Fetch projects owned by user
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('owner_id', profile.id);

      if (ownedError) {
        console.error('Error fetching owned projects:', ownedError);
      }

      // Fetch projects where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select('project_id, projects!inner(id, name)')
        .eq('user_id', profile.id);

      if (memberError) {
        console.error('Error fetching member projects:', memberError);
      }

      // Extract projects from member data
      const memberProjects = memberData?.map((m: any) => ({
        id: m.projects.id,
        name: m.projects.name
      })) || [];

      // Combine and deduplicate
      const allProjects = [
        ...(ownedProjects || []),
        ...memberProjects
      ];

      // Remove duplicates by id
      const uniqueProjects = Array.from(
        new Map(allProjects.map((p: any) => [p.id, p])).values()
      );

      console.log('Fetched projects for suggestions:', uniqueProjects);
      return uniqueProjects as Array<{ id: string; name: string }>;
    } catch (error) {
      console.error('Error in fetchUserProjects:', error);
      return [];
    }
  }, [profile?.id]);

  // Check if command needs confirmation
  const needsConfirmation = useCallback((command: any): boolean => {
    const projectCommands = ['add_task', 'open_project', 'count_tasks'];
    return projectCommands.includes(command.action) && command.params.projectName;
  }, []);

  // Find project suggestions
  const findProjectSuggestions = useCallback(async (projectName: string) => {
    const projects = await fetchUserProjects();
    const matches = findBestMatches(projectName, projects, 0.3, 5);
    
    return {
      bestMatch: matches[0],
      alternatives: matches.slice(1)
    };
  }, [fetchUserProjects]);

  // Handle confirmation
  const handleConfirmCommand = useCallback(async (selectedProjectId?: string) => {
    setShowConfirmation(false);
    
    if (!pendingCommand) return;

    try {
      setProcessingStage('executing');
      
      if (selectedProjectId) {
        const projects = await fetchUserProjects();
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (selectedProject) {
          pendingCommand.params.projectName = selectedProject.name;
        }
      } else if (suggestedProjectName) {
        pendingCommand.params.projectName = suggestedProjectName;
      }

      await executeCommand(pendingCommand);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error.message || 'Failed to execute command'
      });
      setProcessingStage('idle');
    }
    
    setPendingCommand(null);
    setSuggestedProjectName('');
    setProjectSuggestions([]);
  }, [pendingCommand, suggestedProjectName, executeCommand, fetchUserProjects]);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setPendingCommand(null);
    setSuggestedProjectName('');
    setProjectSuggestions([]);
    setProcessingStage('idle');
    setFeedback({ type: 'info', message: 'Command cancelled' });
  }, []);

  // Process audio blob when recording stops
  useEffect(() => {
    if (audioBlob && processingStage === 'recording') {
      const processAudio = async () => {
        try {
          setProcessingStage('transcribing');
          const transcriptionResult = await transcribeAudio(audioBlob);
          setTranscript(transcriptionResult.text);

          const lowerTranscript = transcriptionResult.text.toLowerCase().trim();
          if (lowerTranscript === 'stop' || lowerTranscript === 'cancel' || lowerTranscript === 'stop listening') {
            handleStopListening();
            return;
          }

          setProcessingStage('understanding');
          const commandResult = await parseCommandWithAI(transcriptionResult.text);

          if (commandResult.action === 'unknown' || commandResult.confidence < 0.5) {
            setFeedback({
              type: 'error',
              message: commandResult.message || `I didn't understand: "${transcriptionResult.text}".`
            });
            setProcessingStage('idle');
            resetRecording();
            return;
          }

          if (commandResult.action === 'stop_listening') {
            handleStopListening();
            return;
          }

          if (commandResult.action === 'show_help') {
            handleShowHelp();
            return;
          }

          setParsedCommandText(`${commandResult.action.replace(/_/g, ' ')}`);

          // Check if needs confirmation
          if (needsConfirmation(commandResult)) {
            setProcessingStage('confirming');
            const { bestMatch, alternatives } = await findProjectSuggestions(commandResult.params.projectName);
            
            if (bestMatch) {
              setSuggestedProjectName(bestMatch.name);
              setProjectSuggestions(alternatives);
              setPendingCommand(commandResult);
              setShowConfirmation(true);
            } else {
              setFeedback({
                type: 'error',
                message: `Project "${commandResult.params.projectName}" not found.`
              });
              setProcessingStage('idle');
              resetRecording();
            }
          } else {
            setProcessingStage('executing');
            await executeCommand({
              action: commandResult.action,
              params: commandResult.params,
              pattern: { description: commandResult.action.replace(/_/g, ' ') } as any,
              confidence: commandResult.confidence,
              rawTranscript: transcriptionResult.text
            });
          }

        } catch (error: any) {
          console.error('Voice processing error:', error);
          setFeedback({
            type: 'error',
            message: error.message || 'Failed to process voice command'
          });
          setProcessingStage('idle');
          resetRecording();
        }
      };

      processAudio();
    }
  }, [audioBlob, processingStage, executeCommand, handleStopListening, handleShowHelp, resetRecording, needsConfirmation, findProjectSuggestions]);

  // Auto-stop recording after 10 seconds
  useEffect(() => {
    if (isRecording && recordingTime >= 10) {
      stopRecording();
    }
  }, [isRecording, recordingTime, stopRecording]);

  // Show recorder errors
  useEffect(() => {
    if (recorderError) {
      setFeedback({ type: 'error', message: recorderError });
      setProcessingStage('idle');
    }
  }, [recorderError]);

  // Keyboard shortcut: Ctrl+Shift+V
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        handleToggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, processingStage]);

  const handleToggleListening = () => {
    if (isRecording) {
      stopRecording();
      setProcessingStage('recording');
    } else if (processingStage !== 'idle') {
      setProcessingStage('idle');
      setTranscript('');
      setParsedCommandText(null);
      resetRecording();
    } else {
      setFeedback({ type: null, message: '' });
      setTranscript('');
      setParsedCommandText(null);
      setProcessingStage('recording');
      startRecording();
    }
  };

  const handleCloseFeedback = () => {
    setFeedback({ type: null, message: '' });
  };

  const isListening = isRecording || processingStage !== 'idle';
  const isProcessing = processingStage !== 'idle' && processingStage !== 'recording';

  const getDisplayText = () => {
    switch (processingStage) {
      case 'recording':
        return '';
      case 'transcribing':
        return 'Transcribing with AI...';
      case 'understanding':
        return transcript;
      case 'confirming':
        return transcript;
      case 'executing':
        return transcript;
      default:
        return '';
    }
  };

  return (
    <>
      <VoiceButton
        isListening={isListening}
        isSupported={true}
        onClick={handleToggleListening}
        onHelpClick={() => setShowHelp(true)}
      />

      <VoiceDisplay
        isListening={isListening}
        transcript={getDisplayText()}
        interimTranscript={isRecording ? `Recording... ${recordingTime}s ${recordingTime >= 8 ? '(stopping soon...)' : ''}` : ''}
        isProcessing={isProcessing}
        parsedCommand={parsedCommandText}
      />

      <VoiceFeedback
        type={feedback.type}
        message={feedback.message}
        onClose={handleCloseFeedback}
      />

      <VoiceHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <VoiceConfirmation
        isOpen={showConfirmation}
        transcribedText={transcript}
        suggestedCorrection={suggestedProjectName}
        alternatives={projectSuggestions}
        onConfirm={handleConfirmCommand}
        onCancel={handleCancelConfirmation}
      />
    </>
  );
}
