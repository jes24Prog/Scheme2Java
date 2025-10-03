# **App Name**: Schema2Java

## Core Features:

- OpenAPI Upload & Parsing: Accepts OpenAPI (v2 & v3) JSON/YAML files, parses `components.schemas` (v3) and `definitions` (v2), resolves `$ref` references.
- Schema Selection UI: Displays a list of discovered models with checkboxes, 'Select All', and 'Deselect All' buttons, showing name, summary, and fields for each.
- Java Code Generation: Generates `.java` files with proper imports, class fields annotated with `@JsonProperty`, Lombok support (optional), enum generation, and handles nested `$ref` and `oneOf/anyOf/allOf` constructs. Adds comments for traceability.
- Live Preview & Editing: Shows a syntax-highlighted Java preview with editing capabilities, an 'Apply Changes' button, a 'Copy' button, a 'Download Single' button and an 'Export ZIP' button for selected schemas.
- Validation & Warnings: Validates Java class and field names, displays warnings for collisions, unknown OpenAPI features, and circular references.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5), evokes sophistication and reliability for code generation tools.
- Background color: Light gray (#F0F2F5), provides a neutral and clean backdrop, enhancing code readability.
- Accent color: Vivid cyan (#00BCD4), is used to highlight interactive elements and action buttons, promoting usability.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and short labels, 'Inter' (sans-serif) for body text to maximize clarity of code snippets and related information.
- Code font: 'Source Code Pro' (monospace) for code snippets in preview and editing sections.
- Minimal, line-based icons to represent file types, actions (copy, download), and data structures (schemas, fields).
- A clean, modular layout that provides sufficient spacing and padding around visual elements.
- Subtle transitions when applying or generating source code