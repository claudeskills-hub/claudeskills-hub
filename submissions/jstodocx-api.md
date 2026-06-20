### Skill Name
JS to DOCX API

### Short Description
Generate DOCX files through the jstodocx.com API.

### Long Description
JS to DOCX API is an agent skill for creating Microsoft Word DOCX files from HTML, JavaScript source text, or controlled template fields by calling the public jstodocx.com API.

The skill gives agents a repeatable workflow for choosing the right conversion mode, sending a safe API request, saving the binary `.docx` response, and validating the downloaded file. It also includes guardrails for API keys, user content, and JavaScript safety: agents should not execute arbitrary JavaScript, should not log secrets, and should not send protected content unless the user confirms it is appropriate.

### Use Cases
- Generate a DOCX from a small HTML fragment or report body.
- Archive JavaScript source text into a readable Word document.
- Create a simple DOCX from template fields such as title, heading, paragraphs, bullets, and table rows.
- Give coding agents a documented API workflow instead of ad hoc curl calls.

### Installation
Clone or copy the skill directory from the public repository:

```bash
git clone https://github.com/daanaagua/jstodocx-api-skill.git
```

Then copy `skills/jstodocx-api` into your agent skill directory, for example:

```bash
mkdir -p ~/.codex/skills
cp -R jstodocx-api-skill/skills/jstodocx-api ~/.codex/skills/
```

### Examples
Ask an agent:

```text
Use the jstodocx-api skill to turn this HTML report into a DOCX file.
```

```text
Use the jstodocx-api skill to create a DOCX from this JavaScript source without executing the code.
```

```text
Use the jstodocx-api skill to generate a DOCX from template fields for a short proposal.
```

### Category
Development

### Tags
docx, javascript, api, document-generation, word, automation

### Repository URL
https://github.com/daanaagua/jstodocx-api-skill

### Your Contact
https://jstodocx.com/contact
