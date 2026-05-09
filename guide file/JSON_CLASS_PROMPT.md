# JSON Class Content Generate Prompt for AI

Use this prompt to generate Math class JSON files:

---

```
Create a JSON file for a Math class content in Bengali with the following structure:

{
  "chapterName": "Chapter Name in Bengali",
  "classNumber": "01",
  "sections": [
    {
      "type": "title",
      "content": "Main topic title"
    },
    {
      "type": "header", 
      "content": "Section heading"
    },
    {
      "type": "box",
      "content": "<strong>Important:</strong> Key method or formula explanation in Bengali"
    },
    {
      "type": "calculation",
      "content": "Step-by-step math problem with proper formatting:\n(45)²\n= 1625\n+  40\n------\n= 2025"
    },
    {
      "type": "text",
      "content": "<strong>Explanation:</strong> Detailed explanation in Bengali"
    },
    {
      "type": "list",
      "items": [
        "Example 1 with <strong>answer</strong>",
        "Example 2 with <strong>answer</strong>"
      ]
    }
  ]
}

Rules:
- Use proper Bengali with English math terms where needed
- Include at least 3-5 calculation examples per section
- Use HTML <strong> tags for important text
- Keep content educational and clear
- JSON must be valid with no trailing commas
- Show at least 5-7 examples with step-by-step calculations
- Include special tricks and shortcuts where applicable
- Format calculations exactly as shown above with equal signs and dashes
```