#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseContent(content) {
  const lines = content.split('\n');
  const result = {
    chapterName: '',
    classNumber: '',
    sections: []
  };

  let currentSection = null;
  let inTitle = false;
  let inBox = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Parse class header: # Class 4: Chapter Name (English)
    if (line.startsWith('# ')) {
      const headerMatch = line.match(/#\s*(Class\s*\d+)[:\s]+(.+?)\s*(?:\((.+?)\))?$/);
      if (headerMatch) {
        result.classNumber = headerMatch[1].trim();
        result.chapterName = headerMatch[3] ? headerMatch[3].trim() : headerMatch[2].trim();
        if (headerMatch[3]) {
          result.chapterNameBengali = headerMatch[2].trim();
        }
      }
      continue;
    }

    // Parse rule headers: ## Rule 1: Name (English)
    if (line.startsWith('## ')) {
      let ruleLine = line.substring(3);
      const ruleContent = `<strong>${ruleLine}</strong>`;
      // Always create a new section for each rule/header
      currentSection = {
        type: 'box',
        content: ruleContent
      };
      result.sections.push(currentSection);
      inBox = true;
      continue;
    }

    // Parse example or content lines
    if (line.startsWith('**') || line.startsWith('📌') || line.includes('উদাহরণ')) {
      const processedLine = processInlineFormatting(line);
      if (currentSection && currentSection.type === 'box') {
        currentSection.content += `<br>${processedLine}`;
      } else {
        currentSection = {
          type: 'box',
          content: processedLine
        };
        result.sections.push(currentSection);
        inBox = true;
      }
      continue;
    }

    // Parse bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const processedLine = processInlineFormatting(line);
      if (currentSection) {
        currentSection.content += `<br>${processedLine}`;
      }
      continue;
    }

    // Regular content line - add to current section or create new
    if (line.length > 0) {
      const processedLine = processInlineFormatting(line);
      if (currentSection && currentSection.type === 'box') {
        currentSection.content += `<br>${processedLine}`;
      } else {
        currentSection = {
          type: 'box',
          content: processedLine
        };
        result.sections.push(currentSection);
      }
    }
  }

  return result;
}

function processInlineFormatting(line) {
  return line
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/&rarr;/g, '→')
    .replace(/•/g, '•');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node content-to-json.js <input.md> [output.json]');
    console.log('       node content-to-json.js --stdin');
    process.exit(1);
  }

  let input;
  let outputPath;

  if (args[0] === '--stdin') {
    input = fs.readFileSync(0, 'utf-8');
  } else {
    input = fs.readFileSync(args[0], 'utf-8');
    outputPath = args[1] || args[0].replace(/\.md$/, '.json');
  }

  try {
    const result = parseContent(input);
    const jsonOutput = JSON.stringify(result, null, 2);
    
    if (outputPath) {
      fs.writeFileSync(outputPath, jsonOutput);
      console.log(`✓ Converted: ${args[0]} → ${outputPath}`);
    } else {
      console.log(jsonOutput);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseContent, processInlineFormatting };