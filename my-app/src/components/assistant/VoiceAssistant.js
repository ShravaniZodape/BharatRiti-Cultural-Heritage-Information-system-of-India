import { useState } from 'react';

const CulturalAssistant = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: 'Goa',
        question: question
      })
    });


      const data = await res.json();
      setResponse(data.response || 'No response received.');
    } catch (err) {
      console.error('Error fetching response:', err);
      setResponse("Error communicating with the assistant.");
    }
    setLoading(false);
  };

  return (
    <div className="container my-4">
      <h3>📚 Cultural Text Assistant</h3>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about culture, dance, history..."
        className="form-control my-2"
      />
      <button className="btn btn-primary" onClick={handleAsk} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      <p className="mt-3"><strong>Assistant:</strong> {response}</p>
    </div>
  );
};

export default CulturalAssistant;
