const fs = require('fs');
const path = require('path');

const filePath = 'src/match/match.controller.ts';
const content = fs.readFileSync(filePath, 'utf8');

// The snippet that was repeated:
/*
  @Post('admin/fix-data')
  @ApiOperation({ summary: 'Fix legacy null fields in all matches' })
  async fixData() {
    return this.migrationService.fixMatchStatsAndArrays();
  }
}
*/

const lines = content.split('\n');
const cleanedLines = [];

let skipCount = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts a junk snippet
    if (line.includes("@Post('admin/fix-data')")) {
        // Skip the next 5 lines (the rest of the snippet)
        i += 5;
        continue;
    }

    cleanedLines.push(line);
}

// Join lines and fix any broken brackets at the end
let cleanedContent = cleanedLines.join('\n');

// Add the endpoint properly at the very end (before the last closing brace of the class)
// First, find the last } of the class
const lastBraceIndex = cleanedContent.lastIndexOf('}');
if (lastBraceIndex !== -1) {
    const start = cleanedContent.substring(0, lastBraceIndex);
    cleanedContent = start + `
  @Post('admin/fix-data')
  @ApiOperation({ summary: 'Fix legacy null fields in all matches' })
  async fixData() {
    return this.migrationService.fixMatchStatsAndArrays();
  }
}
`;
}

fs.writeFileSync(filePath, cleanedContent);
console.log('✅ File cleaned and fixed!');
