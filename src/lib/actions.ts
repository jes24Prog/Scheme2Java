'use server';

import { getRawSchemas, parseSpec } from './openapi-parser';
import { generateJavaCode } from './java-generator';
import type { GenerationOptions, GeneratedCode } from './types';
import { toPascalCase } from './string-utils';

export async function generateCodeAction(
  specContent: string,
  options: GenerationOptions,
  selectedSchemaNames: string[]
): Promise<GeneratedCode[]> {
  try {
    const allSchemas = getRawSchemas(specContent);
    const allParsedSchemas = parseSpec(specContent);
    const generatedCode: GeneratedCode[] = [];
    const processed = new Set<string>();

    const generateForSchema = (schemaName: string, suffix: string) => {
        const qualifiedName = toPascalCase(schemaName) + suffix;
        if (!schemaName || processed.has(qualifiedName)) return;

        const schema = allSchemas[schemaName];
        if(!schema) return;
        
        processed.add(qualifiedName);
        
        const processRef = (ref: string) => {
            if (ref) {
                const refName = ref.split('/').pop();
                if (refName) {
                    // Always generate dependencies with no suffix (as a base model)
                    generateForSchema(refName, "");
                }
            }
        };

        // Recursively generate for dependencies
        if (schema.properties) {
            Object.values(schema.properties).forEach((prop: any) => {
                if(prop.$ref) {
                    processRef(prop.$ref);
                } else if (prop.type === 'array' && prop.items?.$ref) {
                    processRef(prop.items.$ref);
                }
            });
        }
        if (schema.allOf) {
             schema.allOf.forEach((item: any) => {
                if(item.$ref) {
                    processRef(item.$ref);
                } else if (item.properties) { // Handle inline objects in allOf
                    Object.values(item.properties).forEach((prop: any) => {
                        if (prop.$ref) {
                            processRef(prop.$ref);
                        } else if (prop.type === 'array' && prop.items?.$ref) {
                            processRef(prop.items.$ref);
                        }
                    });
                }
            });
        }
        
        const code = generateJavaCode(schemaName, allSchemas, options, suffix);
        generatedCode.push({ name: qualifiedName, code });
    }

    selectedSchemaNames.forEach(name => {
        const schemaInfo = allParsedSchemas.find(s => s.name === name);
        if (schemaInfo) {
            let generatedSomething = false;
            if (schemaInfo.isRequest) {
                generateForSchema(name, 'Request');
                generatedSomething = true;
            }
            if (schemaInfo.isResponse) {
                generateForSchema(name, 'Response');
                generatedSomething = true;
            }
            if (!generatedSomething) {
                generateForSchema(name, '');
            }
        }
    });
    
    return generatedCode.sort((a,b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
        return [{ name: "Error", code: `// Generation failed: ${e.message}` }];
    }
    return [{ name: "Error", code: "// An unknown error occurred during code generation." }];
  }
}
