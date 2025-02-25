
import { useState } from 'react';

interface ClaudeResponse {
  response: string;
  codeSnippets?: string[];
}

export function useClaudeAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askClaude = async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCodeReview = async (code: string) => {
    return askClaude(`Review this code and suggest improvements:\n\`\`\`\n${code}\n\`\`\``);
  };

  const explainCode = async (code: string) => {
    return askClaude(`Explain what this code does:\n\`\`\`\n${code}\n\`\`\``);
  };

  const suggestFeature = async (description: string) => {
    return askClaude(`Suggest implementation for this feature: ${description}`);
  };

  return { askClaude, getCodeReview, explainCode, suggestFeature, loading, error };
}

