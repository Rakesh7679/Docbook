import dotenv from 'dotenv';
dotenv.config();

/**
 * AI Service Layer - Encapsulates LLM provider logic
 * Can easily swap providers (Gemini, OpenAI, Anthropic) without breaking controllers
 */
export const generateAIResponse = async (userMessage, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

  // Check for emergency keywords first
  const emergencyKeywords = [
    'chest pain', 'shortness of breath', 'can\'t breathe', 'stroke', 'unconscious',
    'severe bleeding', 'heart attack', 'suicidal', 'seizure', 'paralysis'
  ];

  const lowerMsg = userMessage.toLowerCase();
  const isEmergency = emergencyKeywords.some(keyword => lowerMsg.includes(keyword));

  const emergencyBanner = isEmergency 
    ? "\n\n⚠️ **CRITICAL NOTICE**: Your symptoms may indicate a serious medical emergency. Please immediately call emergency services (like 911/112) or go to the nearest emergency room!" 
    : "";

  const systemInstruction = `You are DocBook AI Assistant, a professional, empathetic, and knowledgeable virtual healthcare guide.
Guidelines:
1. Provide helpful general information about common symptoms, preventive health measures, general medicine usage, and clear explanations of medical terms/prescriptions.
2. ALWAYS remind the user that you are an AI assistant and NOT a doctor. Your information is for educational/informational purposes and is NOT a medical diagnosis or treatment plan.
3. Recommend consulting a qualified doctor for personalized diagnosis or prescribing.
4. Use clear formatting with bullet points and short readable paragraphs.`;

  if (apiKey) {
    try {
      // Build conversation contents for Gemini REST API
      const contents = [];
      
      // Add context history
      history.forEach(msg => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });

      // Add current message with system context
      contents.push({
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser Question: ${userMessage}` }]
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return (
            aiText + 
            emergencyBanner + 
            "\n\n*Disclaimer: I am an AI assistant, not a doctor. Please consult a healthcare professional for personal medical diagnosis.*"
          );
        }
      }
      console.warn("Gemini API call failed or returned empty response. Falling back to local response generation.");
    } catch (err) {
      console.error("AI Service Error:", err.message);
    }
  }

  // Fallback intelligent medical assistant responder
  return getFallbackMedicalResponse(userMessage, isEmergency, emergencyBanner);
};

function getFallbackMedicalResponse(userMessage, isEmergency, emergencyBanner) {
  const text = userMessage.toLowerCase();

  let reply = "";

  if (isEmergency) {
    reply = `I am deeply concerned about the symptoms you mentioned.${emergencyBanner}\n\nPlease do not rely on an AI or web search for severe or sudden acute symptoms. Seek immediate emergency medical care.`;
  } else if (text.includes("fever") || text.includes("temperature")) {
    reply = `### Understanding Fever & High Body Temperature 🌡️

A fever is usually your body's immune system fighting off an infection (viral or bacterial).

**General Care Guidelines:**
- **Stay Hydrated**: Drink plenty of water, herbal teas, or oral rehydration fluids.
- **Rest**: Get adequate sleep to help your immune system recover.
- **Cooling**: Keep the room well-ventilated and wear light clothing.
- **Over-the-Counter Care**: Common antipyretics like Paracetamol are often used to reduce mild fever (follow proper dosage guidelines).

**When to Consult a Doctor:**
- If fever exceeds 102°F (38.9°C) or lasts more than 3 days.
- If accompanied by severe headache, stiff neck, rash, or persistent vomiting.`;
  } else if (text.includes("headache") || text.includes("migraine")) {
    reply = `### Managing Headaches 🧠

Headaches can stem from stress, dehydration, eyestrain, lack of sleep, or sinus congestion.

**Tips for Relief:**
- Drink a glass of water immediately (dehydration is a primary trigger).
- Rest in a quiet, dark room.
- Apply a cool compress to your forehead or neck.
- Limit screen time from phones/computers.

**Red Flags:**
- Sudden, unbearable "thunderclap" headache.
- Headache following a head injury.
- Accompanied by vision loss, weakness, or difficulty speaking.`;
  } else if (text.includes("cough") || text.includes("cold") || text.includes("throat")) {
    reply = `### Common Cold & Cough Guidance 😷

Most colds are self-limiting viral infections affecting the upper respiratory tract.

**Home Care Tips:**
- **Warm Liquids**: Warm water with honey and lemon can soothe a sore throat.
- **Steam Inhalation**: Inhaling steam helps clear nasal passages.
- **Salt Water Gargle**: Dissolve 1/2 tsp salt in warm water and gargle 2-3 times daily.
- **Rest**: Give your body time to fight off the virus.

**When to See a Doctor:**
- Cough lasting longer than 2-3 weeks.
- Coughing up blood or thick discolored phlegm.
- Difficulty breathing or wheezing.`;
  } else if (text.includes("prescription") || text.includes("medicine") || text.includes("dosage")) {
    reply = `### Understanding Prescriptions & Medications 💊

**General Medication Advice:**
- **Take as Directed**: Always strictly follow the dosage, frequency, and duration specified by your doctor.
- **Food Instructions**: "After food" means taking medicine within 30 minutes after eating to protect stomach lining. "Before food" means taking it on an empty stomach.
- **Finish the Course**: Especially with antibiotics, complete the full prescribed duration even if you start feeling better early.
- **Storage**: Store medicines in a cool, dry place away from direct sunlight.

*Tip: You can view and download your official doctor's prescriptions directly from your DocBook dashboard!*`;
  } else {
    reply = `### DocBook General Health Assistance 🩺

Thank you for reaching out! Here is general health guidance regarding your query:

1. **Hydration & Nutrition**: Maintain a balanced diet rich in whole foods, vegetables, and stay adequately hydrated.
2. **Rest**: Aim for 7–9 hours of sleep each night.
3. **Monitor Symptoms**: Keep track of how long symptoms persist and note any changes.
4. **Professional Consultation**: For personalized diagnosis, tailored prescriptions, or specific medical advice, please book an appointment with a specialist on DocBook.`;
  }

  return (
    reply +
    emergencyBanner +
    "\n\n---\n*Disclaimer: DocBook AI Assistant provides general informational guidance and is NOT a replacement for a qualified doctor's diagnosis.*"
  );
}
