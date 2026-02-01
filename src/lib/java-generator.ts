import type { GenerationOptions } from './types';
import { toCamelCase, toPascalCase } from './string-utils';


const getJavaType = (type: string, format: string | undefined, options: GenerationOptions, items?: any): string => {
  if (type === 'string') {
    if (format === 'date-time' || format === 'date') {
      return options.dateType === 'OffsetDateTime' ? 'OffsetDateTime' : 'String';
    }
    return 'String';
  }
  if (type === 'integer') {
    if (format === 'int64') return options.useBoxedPrimitives ? 'Long' : 'long';
    return options.useBoxedPrimitives ? 'Integer' : 'int';
  }
  if (type === 'number') {
    if (format === 'double') return options.useBoxedPrimitives ? 'Double' : 'double';
    if (format === 'float') return options.useBoxedPrimitives ? 'Float' : 'float';
    return 'BigDecimal';
  }
  if (type === 'boolean') {
    return options.useBoxedPrimitives ? 'Boolean' : 'boolean';
  }
  if (type === 'array') {
    const itemRef = items?.$ref?.split('/').pop();
    const itemType = itemRef
        ? toPascalCase(itemRef)
        : getJavaType(items?.type, items?.format, options);
    return `List<${itemType || 'Object'}>`;
  }
  if (type === 'object') {
    return 'Object';
  }
  return toPascalCase(type);
};

const getValidationAnnotations = (name: string, prop: any, schema: any, options: GenerationOptions, imports: Set<string>): string[] => {
    const annotations: string[] = [];
    const validationPrefix = `${options.validationApi}.validation.constraints`;
    const fieldName = toCamelCase(name);

    if (schema.required?.includes(name)) {
        annotations.push(`@NotNull(message = "${fieldName} is required")`);
        imports.add(`import ${validationPrefix}.NotNull;`);
    }

    if (prop.type === 'string') {
        if (prop.minLength !== undefined && prop.maxLength !== undefined) {
            annotations.push(`@Size(min = ${prop.minLength}, max = ${prop.maxLength}, message = "${fieldName} must be between ${prop.minLength} and ${prop.maxLength} characters")`);
            imports.add(`import ${validationPrefix}.Size;`);
        } else if (prop.minLength !== undefined) {
            annotations.push(`@Size(min = ${prop.minLength}, message = "${fieldName} must be at least ${prop.minLength} characters")`);
            imports.add(`import ${validationPrefix}.Size;`);
        } else if (prop.maxLength !== undefined) {
            annotations.push(`@Size(max = ${prop.maxLength}, message = "${fieldName} cannot be longer than ${prop.maxLength} characters")`);
            imports.add(`import ${validationPrefix}.Size;`);
        }

        if (prop.pattern) {
            annotations.push(`@Pattern(regexp = "${prop.pattern.replace(/\\/g, '\\\\')}", message = "${fieldName} must match the pattern: ${prop.pattern}")`);
            imports.add(`import ${validationPrefix}.Pattern;`);
        }
        if (prop.format === 'email') {
            annotations.push(`@Email(message = "${fieldName} must be a valid email address")`);
            imports.add(`import ${validationPrefix}.Email;`);
        }
        if (prop.format === 'uuid') {
            annotations.push(`@Pattern(regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", message = "${fieldName} must be a valid UUID")`);
            imports.add(`import ${validationPrefix}.Pattern;`);
        }
        if (prop.format === 'ipv4') {
            annotations.push(`@Pattern(regexp = "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", message = "${fieldName} must be a valid IPv4 address")`);
            imports.add(`import ${validationPrefix}.Pattern;`);
        }
        if (prop.format === 'ipv6') {
            annotations.push(`@Pattern(regexp = "([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])", message = "${fieldName} must be a valid IPv6 address")`);
            imports.add(`import ${validationPrefix}.Pattern;`);
        }
    }
    
    if (prop.type === 'array') {
         if (prop.minItems !== undefined && prop.maxItems !== undefined) {
            annotations.push(`@Size(min = ${prop.minItems}, max = ${prop.maxItems}, message = "${fieldName} must contain between ${prop.minItems} and ${prop.maxItems} items")`);
            imports.add(`import ${validationPrefix}.Size;`);
        } else if (prop.minItems !== undefined) {
            annotations.push(`@Size(min = ${prop.minItems}, message = "${fieldName} must contain at least ${prop.minItems} items")`);
            imports.add(`import ${validationPrefix}.Size;`);
        } else if (prop.maxItems !== undefined) {
            annotations.push(`@Size(max = ${prop.maxItems}, message = "${fieldName} cannot contain more than ${prop.maxItems} items")`);
            imports.add(`import ${validationPrefix}.Size;`);
        }
        if (prop.uniqueItems) {
            imports.add(`import org.hibernate.validator.constraints.UniqueElements;`);
            annotations.push(`@UniqueElements(message = "${fieldName} must not contain duplicates")`);
        }
    }

    if (prop.type === 'integer' || prop.type === 'number') {
        if (prop.minimum !== undefined) {
             if (prop.exclusiveMinimum) {
                annotations.push(`@DecimalMin(value = "${prop.minimum}", inclusive = false, message = "${fieldName} must be greater than ${prop.minimum}")`);
                imports.add(`import ${validationPrefix}.DecimalMin;`);
             } else {
                annotations.push(`@Min(value = ${prop.minimum}, message = "${fieldName} must be at least ${prop.minimum}")`);
                imports.add(`import ${validationPrefix}.Min;`);
             }
        }
        if (prop.maximum !== undefined) {
             if (prop.exclusiveMaximum) {
                annotations.push(`@DecimalMax(value = "${prop.maximum}", inclusive = false, message = "${fieldName} must be less than ${prop.maximum}")`);
                imports.add(`import ${validationPrefix}.DecimalMax;`);
             } else {
                annotations.push(`@Max(value = ${prop.maximum}, message = "${fieldName} must be at most ${prop.maximum}")`);
                imports.add(`import ${validationPrefix}.Max;`);
             }
        }
    }

    return annotations;
}

const generateField = (name: string, prop: any, options: GenerationOptions, allSchemas: any, schema: any, imports: Set<string>): string => {
  const fieldName = toCamelCase(name);
  let javaType;
  if(prop.$ref) {
      const refName = prop.$ref.split('/').pop();
      javaType = refName ? toPascalCase(refName) : 'Object';
  } else {
    javaType = getJavaType(prop.type, prop.format, options, prop.items);
  }

  let annotations: string[] = [];

  if (options.useValidationAnnotations) {
    annotations.push(...getValidationAnnotations(name, prop, schema, options, imports));
  }

  if (options.useJackson) {
    annotations.push(`@JsonProperty("${name}")`);
  }

  let fieldType = javaType;
  const isRequired = schema.required?.includes(name);

  if(options.useOptional && !isRequired) {
    fieldType = `Optional<${javaType}>`;
  }
  
  return annotations.map(a => `    ${a}`).join('\n') + `\n    private ${fieldType} ${fieldName};`;
};

const generateEnum = (name: string, schema: any, options: GenerationOptions, suffix: string): string => {
  const className = toPascalCase(name) + suffix;
  let imports = new Set<string>();
  let enumBody = `public enum ${className} {\n`;
  schema.enum.forEach((val: string) => {
    const enumVal = val.toString().replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
    if (options.useJackson) {
      imports.add('import com.fasterxml.jackson.annotation.JsonProperty;');
      enumBody += `    @JsonProperty("${val}")\n`;
    }
    enumBody += `    ${enumVal},\n`;
  });
  
  let code = `package ${options.packageName};\n\n`;
  if (imports.size > 0) {
      code += Array.from(imports).sort().join('\n') + '\n\n';
  }
  
  code += enumBody.slice(0, -2) + "\n}\n";
  return code;
};

export const generateJavaCode = (
  schemaName: string,
  allSchemas: { [key: string]: any },
  options: GenerationOptions,
  suffix: string
): string => {
  const schema = allSchemas[schemaName];
  if (!schema) return `// Schema ${schemaName} not found.`;

  if (schema.enum && options.enumType === 'enum') {
    return generateEnum(schemaName, schema, options, suffix);
  }

  const className = toPascalCase(schemaName) + suffix;
  const imports = new Set<string>();

  if (options.useLombok) {
    imports.add('import lombok.Data;');
    imports.add('import lombok.Builder;');
    imports.add('import lombok.AllArgsConstructor;');
    imports.add('import lombok.NoArgsConstructor;');
    imports.add('import jakarta.annotation.Generated;');
  }
  if (options.useJackson) {
    imports.add('import com.fasterxml.jackson.annotation.JsonProperty;');
    imports.add('import com.fasterxml.jackson.annotation.JsonInclude;');
  }
  if (options.useOptional) imports.add('import java.util.Optional;');
  
  let currentSchema = schema;
  let allProperties: { [key: string]: any } = {};

  const processedRefs = new Set<string>();
  const collectProperties = (current: any) => {
    if (current.allOf) {
        current.allOf.forEach((item: any) => {
            if (item.$ref) {
                const refName = item.$ref.split('/').pop();
                if (refName && !processedRefs.has(refName) && allSchemas[refName]) {
                    processedRefs.add(refName);
                    collectProperties(allSchemas[refName]);
                }
            } else {
                collectProperties(item);
            }
        });
    }

    if (current.properties) {
        Object.assign(allProperties, current.properties);
    }
    
    if (current.required) {
        if (!schema.required) schema.required = [];
        schema.required.push(...current.required);
    }
  };

  collectProperties(schema);
  
  const fields = Object.entries(allProperties)
    .map(([name, prop]) => {
      const propDef = prop as any;
      if (propDef.type === 'array') imports.add('import java.util.List;');
      if ((propDef.type === 'number' && !propDef.format) || propDef.format === 'bigdecimal') imports.add('import java.math.BigDecimal;');
      if (options.dateType === 'OffsetDateTime' && (propDef.format === 'date-time' || propDef.format === 'date')) {
          imports.add('import java.time.OffsetDateTime;');
      }
      return generateField(name, propDef, options, allSchemas, schema, imports);
    })
    .join('\n\n');


  let classAnnotations: string[] = [];
  if (options.useLombok) {
    classAnnotations.push('@Data');
    classAnnotations.push('@Builder');
    classAnnotations.push('@AllArgsConstructor');
    classAnnotations.push('@NoArgsConstructor');
    classAnnotations.push('@Generated');
  }
  if (options.useJackson) {
    classAnnotations.push('@JsonInclude(JsonInclude.Include.NON_NULL)');
  }
  
  const schemaExcerpt = `/*\n Original schema: ${schemaName}\n ${JSON.stringify(schema, null, 2).split('\n').slice(0, 10).join('\n')}\n*/`;

  let code = `package ${options.packageName};\n\n`;
  code += Array.from(imports).sort().join('\n') + '\n\n';
  code += `${schemaExcerpt}\n`;
  code += `${classAnnotations.join('\n')}\npublic class ${className} {\n\n`;
  code += fields + '\n';
  
  if (!options.useLombok && options.generateHelpers) {
      // Basic getter/setter generation
      Object.entries(allProperties).forEach(([name, prop]) => {
          const fieldName = toCamelCase(name);
          let type;
          if ((prop as any).$ref) {
              const refName = (prop as any).$ref.split('/').pop();
              type = refName ? toPascalCase(refName) : 'Object';
          } else {
              type = getJavaType((prop as any).type, (prop as any).format, options, (prop as any).items);
          }
          const capitalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
          
          let fieldType = type;
          if (options.useOptional && !schema.required?.includes(name)) {
              fieldType = `Optional<${type}>`;
          }

          code += `\n    public ${fieldType} get${capitalizedFieldName}() {\n        return ${fieldName};\n    }\n`
          code += `\n    public void set${capitalizedFieldName}(${fieldType} ${fieldName}) {\n        this.${fieldName} = ${fieldName};\n    }\n`
      });
  }

  code += '}\n';

  return code;
};
