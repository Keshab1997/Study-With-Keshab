# Content to JSON Converter

Automatically converts Bengali mathematics content to structured JSON files.

## Usage

### CLI Tool

```bash
# Convert a file
npm run convert

# Or directly
node scripts/content-to-json.js input.md output.json

# Read from stdin
node scripts/content-to-json.js --stdin < input.md
```

### Web Interface

Open `scripts/web-converter.html` in a browser for a visual interface.

## Input Format

```markdown
# Class 4: অধ্যায়ের নাম (Chapter Name in English)

## Rule 1: Rule Name (বাংলা নাম)
**Rule description here...**

**উদাহরণ:** Example text here...
• Bullet point 1
• Bullet point 2

## Rule 2: Another Rule (অন্য নাম)
**স্টেপ ১:** First step
**স্ট� ২:** Second step
```

## Features
- Parses class headers automatically
- Creates separate sections for each rule
- Converts **bold** and *italic* formatting to HTML
- Handles mathematical expressions (fractions, symbols)
- Preserves Bengali text properly