import { describe, it, expect } from 'vitest';
import { formatChatHistory } from './ai.service';

describe('AI Service: formatChatHistory (Sanitización Gemini)', () => {
  it('debe mapear el rol "assistant" a "model"', () => {
    const rawHistory = [
      { role: 'user', content: 'Hola' },
      { role: 'assistant', content: '¡Hola! ¿En qué te ayudo?' },
    ];

    const formatted = formatChatHistory(rawHistory);

    expect(formatted).toEqual([
      { role: 'user', parts: [{ text: 'Hola' }] },
      { role: 'model', parts: [{ text: '¡Hola! ¿En qué te ayudo?' }] },
    ]);
  });

  it('debe descartar mensajes iniciales "model" para asegurar que comience con "user"', () => {
    const rawHistory = [
      { role: 'assistant', content: 'Saludo inicial no solicitado' },
      { role: 'user', content: 'Consulta real' },
      { role: 'assistant', content: 'Respuesta' },
    ];

    const formatted = formatChatHistory(rawHistory);

    expect(formatted[0].role).toBe('user');
    expect(formatted[0].parts[0].text).toBe('Consulta real');
  });

  it('debe eliminar turnos repetidos consecutivos para mantener alternancia estricta user <-> model', () => {
    const rawHistory = [
      { role: 'user', content: 'Pregunta 1' },
      { role: 'user', content: 'Pregunta 1 repetida' },
      { role: 'assistant', content: 'Respuesta 1' },
    ];

    const formatted = formatChatHistory(rawHistory);

    expect(formatted.length).toBe(2);
    expect(formatted[0].role).toBe('user');
    expect(formatted[1].role).toBe('model');
  });

  it('debe realizar búsquedas RAG de documentos técnicos por palabra clave', () => {
    const { searchDocuments } = require('../data/opportunity-documents');
    const results = searchDocuments('HIPAA', 'Nouveau BioTech');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].companyName).toBe('Nouveau BioTech');
    expect(results[0].content).toContain('HIPAA');
  });
});
