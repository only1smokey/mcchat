const inputText = document.getElementById('inputText');
const previewText = document.getElementById('previewText');
const generatedCode = document.getElementById('generatedCode');
const colorPicker = document.getElementById('colorPicker');
const applyHex = document.getElementById('applyHex');
let currentColor = '';
let currentFormat = '';

const chatColorCodes = {
    'red': 'ChatColor.RED',
    'green': 'ChatColor.GREEN',
    'blue': 'ChatColor.BLUE',
    'yellow': 'ChatColor.YELLOW',
    'aqua': 'ChatColor.AQUA',
    'dark_red': 'ChatColor.DARK_RED',
    'dark_green': 'ChatColor.DARK_GREEN',
    'dark_blue': 'ChatColor.DARK_BLUE',
    'gold': 'ChatColor.GOLD',
    'white': 'ChatColor.WHITE',
    'gray': 'ChatColor.GRAY',
    'dark_gray': 'ChatColor.DARK_GRAY',
    'black': 'ChatColor.BLACK',
    'light_purple': 'ChatColor.LIGHT_PURPLE',
    'dark_purple': 'ChatColor.DARK_PURPLE',
    'reset': 'ChatColor.RESET'
};

const formattingCodes = {
    'bold': 'ChatColor.BOLD',
    'italic': 'ChatColor.ITALIC',
    'underline': 'ChatColor.UNDERLINE',
    'strikethrough': 'ChatColor.STRIKETHROUGH',
    'magic': 'ChatColor.MAGIC',
    'reset': 'ChatColor.RESET'
};

// Function to insert text at the cursor position
function insertAtCursor(input, textToInsert) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;

    input.value = text.slice(0, start) + textToInsert + text.slice(end);
    input.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    input.focus();
}

document.querySelectorAll('#formatOptions button').forEach(button => {
    button.addEventListener('click', () => {
        const format = button.getAttribute('data-format');
        insertAtCursor(inputText, `(${format})`);
        inputText.dispatchEvent(new Event('input'));
    });
});

// Apply hex color from the color picker
applyHex.addEventListener('click', () => {
    const hexColor = colorPicker.value;
    insertAtCursor(inputText, `(${hexColor})`);
    inputText.dispatchEvent(new Event('input'));
});

// Handle input and update the preview and generated code
inputText.addEventListener('input', () => {
    const lines = inputText.value.split('\n');
    let previewHTML = '';
    let codeOutput = '';

    lines.forEach(line => {
        const regex = /\((#[0-9a-fA-F]{6}|[a-z_]+)\)?(?:\((bold|italic|underline|strikethrough|magic|reset)\))?(.*?)(?=\(\S+\)|$)/g;
        let match;
        let codeLine = '';
        let lineHasContent = false;

        // Handle lines without any format or color
        if (!line.match(regex) && line.trim() !== '') {
            previewHTML += `<span style="color:white;">${line}</span><br>`;
            codeOutput += `ChatColor.WHITE + "" + "${line}"\n`;
            return;
        }

        while ((match = regex.exec(line)) !== null) {
            const colorOrHex = match[1] || 'white'; // Default to white if no color specified
            const style = match[2] || ''; // Style might be empty
            const text = match[3]; // Do not trim the text to preserve spaces

            if (text) {
                lineHasContent = true;

                let colorCode = colorOrHex.startsWith('#') ? `ChatColor.of("${colorOrHex}")` : chatColorCodes[colorOrHex.toLowerCase()] || 'ChatColor.WHITE';
                let styleCode = formattingCodes[style] || '';

                // Generate Preview
                previewHTML += `<span style="color:${colorOrHex}; font-weight:${style === 'bold' ? 'bold' : 'normal'}; font-style:${style === 'italic' ? 'italic' : 'normal'}; text-decoration:${style === 'underline' ? 'underline' : (style === 'strikethrough' ? 'line-through' : 'none')};">${text}</span>`;

                // Generate Code
                codeLine += `${colorCode} + "" + ${styleCode ? styleCode + ' + "" + ' : ''}"${text}" + `;
            }
        }

        if (lineHasContent) {
            codeOutput += codeLine.slice(0, -3) + '\n'; // Remove the last " + " and add newline
            previewHTML += '<br>'; // New line in preview
        }
    });

    previewText.innerHTML = previewHTML;
    generatedCode.textContent = codeOutput.trim();
});
