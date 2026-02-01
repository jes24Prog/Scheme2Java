import yaml from 'js-yaml';
import { Schema } from '@/lib/types';

const getSchemas = (spec: any): [any, string[]] => {
  if (spec.swagger) { // OpenAPI 2.0
    return [spec.definitions, Object.keys(spec.definitions || {})];
  }
  if (spec.openapi) { // OpenAPI 3.0
    return [spec.components?.schemas, Object.keys(spec.components?.schemas || {})];
  }
  return [{}, []];
};

const getPropertyType = (prop: any, spec: any): string => {
  if (prop.$ref) {
    const refName = prop.$ref.split('/').pop() || '';
    return refName;
  }
  if (prop.type === 'array') {
    const itemType = getPropertyType(prop.items, spec);
    return `List<${itemType}>`;
  }
  if (prop.type === 'string' && prop.enum) {
    return 'enum';
  }
  if (prop.format === 'int64') return 'long';
  return prop.type || 'Object';
};

const getRefName = (ref: string): string | null => {
    if (!ref || typeof ref !== 'string') return null;
    return ref.split('/').pop() || null;
}

export const parseSpec = (content: string): Schema[] => {
  try {
    const spec = yaml.load(content) as any;
    if (!spec || (typeof spec !== 'object')) {
        throw new Error("Invalid OpenAPI/Swagger spec");
    }

    const [schemas, schemaNames] = getSchemas(spec);
    
    if (!schemas) return [];

    const requestSchemaNames = new Set<string>();
    const responseSchemaNames = new Set<string>();

    if (spec.paths) {
        for (const path in spec.paths) {
            for (const method in spec.paths[path]) {
                if (method === 'parameters' || !spec.paths[path][method]) continue;
                
                const op = spec.paths[path][method];

                // Find refs in requestBody
                if (op.requestBody?.content) {
                    for (const mediaType in op.requestBody.content) {
                        const schema = op.requestBody.content[mediaType].schema;
                        if (schema?.$ref) {
                            const name = getRefName(schema.$ref);
                            if (name) requestSchemaNames.add(name);
                        } else if (schema?.type === 'array' && schema.items?.$ref) {
                            const name = getRefName(schema.items.$ref);
                            if (name) requestSchemaNames.add(name);
                        }
                    }
                }

                // Find refs in responses
                if (op.responses) {
                    for (const statusCode in op.responses) {
                        if (op.responses[statusCode]?.content) {
                            for (const mediaType in op.responses[statusCode].content) {
                                const schema = op.responses[statusCode].content[mediaType].schema;
                                if (schema?.$ref) {
                                    const name = getRefName(schema.$ref);
                                    if (name) responseSchemaNames.add(name);
                                } else if (schema?.type === 'array' && schema.items?.$ref) {
                                    const name = getRefName(schema.items.$ref);
                                    if (name) responseSchemaNames.add(name);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return schemaNames.map(name => {
      const schema = schemas[name];
      const properties = schema.properties ? Object.keys(schema.properties).map(propName => {
        const prop = schema.properties[propName];
        return {
          name: propName,
          type: getPropertyType(prop, spec),
          required: schema.required ? schema.required.includes(propName) : false,
        };
      }) : [];

      return {
        name,
        description: schema.description,
        properties,
        isRequest: requestSchemaNames.has(name),
        isResponse: responseSchemaNames.has(name),
      };
    });
  } catch (error) {
    console.error("Error parsing spec:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to parse spec: ${error.message}`);
    }
    throw new Error("An unknown error occurred while parsing the spec.");
  }
};

export const getRawSchemas = (content: string): { [key: string]: any } => {
    const spec = yaml.load(content) as any;
    if (!spec || typeof spec !== 'object') throw new Error("Invalid spec");
    const [schemas] = getSchemas(spec);
    return schemas;
}
