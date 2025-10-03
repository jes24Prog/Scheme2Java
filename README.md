# Schema2Java: OpenAPI to Java Model Generator

Schema2Java is a powerful and intuitive web-based tool for developers to instantly generate Java Plain Old Java Objects (POJOs) from an OpenAPI (formerly Swagger) specification. It streamlines the process of creating data models for your Java applications by parsing your API definition and producing clean, configurable, and validation-ready code.

This tool is built with Next.js, React, and Tailwind CSS, providing a fast and responsive user experience.

## ✨ Features

- **Flexible Input**: Upload an OpenAPI v2 or v3 spec file (`.json`, `.yaml`, `.yml`) or simply paste the raw content.
- **Schema Discovery**: Automatically parses and lists all models found in `components.schemas` (OAS3) or `definitions` (OAS2).
- **Selective Generation**: Use checkboxes to select specific models you want to generate, with a "Select All" option for convenience.
- **Live Code Preview**: Instantly see the generated Java code for any selected model in a live editor, which updates as you change configuration options.
- **Rich Configuration**: Tailor the code generation to fit your project's coding standards and library stack.
- **Validation Support**: Automatically generate JSR-380 (Jakarta Validation) annotations from your schema's validation rules (`required`, `minLength`, `pattern`, etc.).
- **Easy Export**:
  - **Copy to Clipboard**: Quickly copy the code for a single class.
  - **Download Single File**: Download the `.java` file for the currently viewed class.
  - **Export ZIP**: Download a ZIP archive containing all generated `.java` files, neatly organized.

## ⚙️ Configuration Options

You have granular control over the generated code through the "Configure Generation" panel:

### General

- **Package Name**: Specify the Java package for your generated classes (e.g., `com.example.models`).

### Code Style & Helpers

- **Use Lombok**: If checked, adds `@Data` to your classes for boilerplate-free getters, setters, `equals()`, `hashCode()`, and `toString()`. This disables the "Generate Helpers" option.
- **Generate Helpers**: If Lombok is disabled, this option will generate standard public getters and setters for all private fields.
- **Use Optional<T>**: If checked, non-required fields will be wrapped in `java.util.Optional<T>`, promoting explicit handling of null values.
- **Use Boxed Primitives**: Use wrapper types like `Integer` and `Double` instead of primitive types `int` and `double`.

### Annotations

- **JSON Annotations**:
  - **Jackson (`@JsonProperty`)**: Adds Jackson annotations to map fields to their original OpenAPI property names.
- **Validation**:
  - **Enable Validation**: Turn on/off the generation of validation annotations.
  - **API Version**: Choose between `jakarta` (`jakarta.validation.constraints.*`) and `javax` (`javax.validation.constraints.*`) namespaces, depending on your Spring Boot version or other framework needs.

### Type Mapping

- **Date/Time Type**: Map `string` fields with `format: date-time` to either `java.time.OffsetDateTime` or `String`.
- **Enum Style**: Generate enums as a proper Java `enum` type.

## 🚀 How to Use

1.  **Provide Spec**: In the first panel, either drag-and-drop your OpenAPI file, click to upload it, or switch to the "Paste" tab to paste the raw text.
2.  **Configure Generation**: In the second panel, adjust the configuration options to match your project's requirements. Set your package name, decide on Lombok, and choose your validation API.
3.  **Select Models**: In the third panel, you'll see a list of all models discovered in your spec. Use the checkboxes to select the ones you want to generate code for. You can use the filter bar to quickly find models.
4.  **Generate & Preview**: Click the **Generate Models** button. The right-hand panel will populate with tabs for each generated class. You can click through the tabs to preview the code.
5.  **Export**:
    - Use the copy and download buttons in the preview panel for individual classes.
    - Click the **Export ZIP** button to download all generated classes at once.

## 💻 Tech Stack

- **Framework**: Next.js (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **File Handling**: `js-yaml` for parsing, `jszip` and `file-saver` for exporting.
